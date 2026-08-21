import mongoose from "mongoose";

/**
 * Executes a callback function inside a MongoDB transaction if the connected
 * MongoDB instance supports replica sets / transactions.
 *
 * If MongoDB is running as a standalone instance (which does not support
 * multi-document transactions), it gracefully catches the error and executes
 * the callback directly without a session.
 *
 * @param {Function} workFn - Async function (session) => Promise<any>
 * @returns {Promise<any>} - Result of workFn
 */
export const withOptionalTransaction = async (workFn) => {
  let session = null;
  let transactionStarted = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    transactionStarted = true;

    const result = await workFn(session);

    await session.commitTransaction();
    return result;
  } catch (error) {
    if (transactionStarted && session) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        // Ignore abort errors if transaction could not be aborted
      }
    }

    const errorMessage = error?.message || "";
    const isStandaloneError =
      errorMessage.includes("Transaction numbers are only allowed on a replica set member or mongos") ||
      errorMessage.includes("This MongoDB deployment does not support retryable writes") ||
      errorMessage.includes("replica set") ||
      error?.code === 20 ||
      error?.codeName === "IllegalOperation";

    if (isStandaloneError) {
      // Re-run directly without session for standalone MongoDB instances
      return await workFn(null);
    }

    throw error;
  } finally {
    if (session) {
      try {
        await session.endSession();
      } catch (endErr) {
        // Ignore session end errors
      }
    }
  }
};
