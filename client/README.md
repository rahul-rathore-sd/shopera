# 🛍️ Shopera — Client Frontend

The client storefront and administrative user interface for **Shopera**, built with **React 19**, **Vite 8**, and **Tailwind CSS v4**.

---

## ⚡ Tech Stack & Highlights

- **Framework**: [React 19](https://react.dev/)
- **Tooling**: [Vite 8](https://vitejs.dev/) with React Compiler ready setup
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with local storage persistence & sync)
- **Data Caching & Synchronization**: [TanStack React Query v5](https://tanstack.com/query)
- **Routing**: [React Router v7](https://reactrouter.com/) (with role-based route guards)
- **HTTP Client**: [Axios](https://axios-http.com/) with interceptors for token auto-refresh

---

## 📁 Client Directory Structure

```text
client/src/
├── api/                # Axios instance & request/response interceptors
├── assets/             # Brand logos, hero banners, and vector assets
├── components/
│   ├── admin/          # Back-office admin tables, modals, & tabs
│   ├── common/         # ProductCard, Button, Input, Modal, Loader
│   └── layout/         # Navbar, Footer, FilterSidebar
├── pages/
│   ├── Home.jsx        # Landing page with hero, categories & catalog
│   ├── ProductDetail.jsx # Product gallery, specs, and add-to-cart
│   ├── Cart.jsx        # Cart drawer / dedicated cart manager
│   ├── Checkout.jsx    # Shipping address & Razorpay / COD flow
│   ├── OrderSuccess.jsx# Post-checkout receipt & summary
│   ├── Orders.jsx      # Customer order tracking & history
│   ├── Profile.jsx     # Account settings & address manager
│   ├── Login.jsx       # User authentication screen
│   ├── Register.jsx    # New account registration
│   └── AdminDashboard.jsx # Merchant back-office suite
├── routes/
│   ├── AdminRoute.jsx  # Admin-only route guard
│   └── AppRoutes.jsx   # Client route registry
├── store/
│   ├── useAuthStore.js # Zustand authentication store
│   └── useCartStore.js # Zustand cart & checkout store
├── App.jsx             # Top-level application shell
├── index.css           # Global Tailwind CSS styles
└── main.jsx            # Entry point mount
```

---

## ⚙️ Environment Variables

Create `.env` in the `client/` folder:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 🛠️ Scripts

Run these from the workspace root or inside the `client` directory:

```bash
# Start development server
npm run dev --workspace=client

# Build optimized production bundle
npm run build --workspace=client

# Preview production build
npm run preview --workspace=client

# Run linter
npm run lint --workspace=client
```

---

*For full project documentation, architecture diagrams, backend setup, and deployment guides, please see the [Main Project README](../README.md).*
