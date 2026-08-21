import "dotenv/config";
import mongoose from "mongoose";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";

const categoriesData = [
  {
    name: "Electronics",
    description: "Cutting-edge gadgets, computing gear, audio equipment, and smart devices.",
  },
  {
    name: "Fashion",
    description: "Contemporary apparel, timeless essentials, premium outerwear, and knitwear.",
  },
  {
    name: "Footwear",
    description: "Engineered sneakers, leather boots, loafers, and high-performance trail shoes.",
  },
  {
    name: "Accessories",
    description: "Precision chronographs, handcrafted leather goods, sunglasses, and bags.",
  },
  {
    name: "Home & Living",
    description: "Modern minimalist home decor, ergonomic work gear, and ambient lighting.",
  },
  {
    name: "Audio & Sound",
    description: "High-fidelity headphones, studio audio monitors, and wireless sound systems.",
  },
  {
    name: "Bags & Travel",
    description: "Weatherproof commuter backpacks, leather duffles, and tech sling bags.",
  },
];

// 50 High-Quality Curated Products
const productsData = [
  // 1-10: Electronics & Gadgets
  {
    title: "Quantum Pro Mechanical Keyboard",
    category: "Electronics",
    brand: "Signal Works",
    description: "Engineered with hot-swappable Gateron mechanical switches, sound-dampening gasket mount, and per-key customizable RGB lighting. Perfect for programmers, writers, and competitive gamers.",
    basePrice: 7499,
    baseDiscountPrice: 5999,
    stock: 35,
    hasVariants: true,
    variants: [
      {
        sku: "QPRO-KB-RED",
        attributes: { color: "Midnight Black", size: "75%", material: "Aluminum Chassis" },
        price: 7499,
        discountPrice: 5999,
        stock: 18,
        image: { url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80", publicId: "prod/kb-red" },
      },
      {
        sku: "QPRO-KB-BRN",
        attributes: { color: "Chalk White", size: "75%", material: "Aluminum Chassis" },
        price: 7499,
        discountPrice: 5999,
        stock: 17,
        image: { url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80", publicId: "prod/kb-brn" },
      },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80", publicId: "prod/kb-1", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80", publicId: "prod/kb-2", isPrimary: false },
    ],
    ratingsAverage: 4.8,
    ratingsQuantity: 142,
    tags: ["electronics", "gaming", "keyboard", "deals", "bestseller"],
    featured: true,
  },
  {
    title: "AeroShield 4K Drone Explorer",
    category: "Electronics",
    brand: "Nova Tech",
    description: "Compact ultralight folding drone equipped with a 3-axis stabilized 4K HDR camera, 35-minute flight time, optical obstacle avoidance, and 10km live video transmission.",
    basePrice: 38999,
    baseDiscountPrice: 32499,
    stock: 14,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=900&q=80", publicId: "prod/drone-1", isPrimary: true },
    ],
    ratingsAverage: 4.9,
    ratingsQuantity: 88,
    tags: ["electronics", "drone", "camera", "deals", "featured"],
    featured: true,
  },
  {
    title: "Apex Magnetic Wireless Power Hub",
    category: "Electronics",
    brand: "Signal Works",
    description: "3-in-1 fast-charging stand for iPhone, Apple Watch, and AirPods with aerospace-grade aluminum alloy build and intelligent temperature regulation.",
    basePrice: 4299,
    baseDiscountPrice: 3499,
    stock: 55,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80", publicId: "prod/charger-1", isPrimary: true },
    ],
    ratingsAverage: 4.6,
    ratingsQuantity: 215,
    tags: ["electronics", "charger", "wireless", "sale"],
    featured: false,
  },
  {
    title: "VisionUltra 4K USB-C Designer Monitor",
    category: "Electronics",
    brand: "Nova Tech",
    description: "27-inch IPS UHD display with 99% sRGB color gamut coverage, HDR400 certified brightness, 90W single-cable USB-C power delivery, and ultra-thin borderless bezel.",
    basePrice: 28999,
    baseDiscountPrice: 24999,
    stock: 20,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80", publicId: "prod/monitor-1", isPrimary: true },
    ],
    ratingsAverage: 4.7,
    ratingsQuantity: 96,
    tags: ["electronics", "monitor", "display", "bestseller"],
    featured: true,
  },
  {
    title: "Vortex Gaming Ergonomic Mouse",
    category: "Electronics",
    brand: "Signal Works",
    description: "Ultralightweight 58g honey-comb design with PAW3395 26K DPI optical sensor, pure PTFE glides, and lag-free 2.4GHz wireless connection.",
    basePrice: 3999,
    baseDiscountPrice: 2999,
    stock: 45,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=80", publicId: "prod/mouse-1", isPrimary: true },
    ],
    ratingsAverage: 4.5,
    ratingsQuantity: 178,
    tags: ["electronics", "gaming", "mouse", "sale"],
    featured: false,
  },
  {
    title: "StreamCast Studio USB Microphone",
    category: "Electronics",
    brand: "Aether Audio",
    description: "Broadcast-quality cardioid condenser microphone with built-in pop filter, zero-latency headphone monitor jack, and tap-to-mute touch sensor.",
    basePrice: 6299,
    baseDiscountPrice: 4999,
    stock: 28,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80", publicId: "prod/mic-1", isPrimary: true },
    ],
    ratingsAverage: 4.8,
    ratingsQuantity: 120,
    tags: ["electronics", "audio", "microphone", "deals"],
    featured: false,
  },
  {
    title: "Lumina Smart Desk Ambient Lightbar",
    category: "Electronics",
    brand: "Nova Tech",
    description: "Monitor-mounted asymmetric optical lightbar that illuminates your workstation without screen glare, with wireless rotary dial control and auto-dimming sensor.",
    basePrice: 3499,
    baseDiscountPrice: 2699,
    stock: 40,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80", publicId: "prod/lightbar-1", isPrimary: true },
    ],
    ratingsAverage: 4.6,
    ratingsQuantity: 310,
    tags: ["electronics", "desk", "lighting", "bestseller"],
    featured: false,
  },
  {
    title: "HyperSync 10-in-1 Thunderbolt 4 Dock",
    category: "Electronics",
    brand: "Signal Works",
    description: "Universal docking station supporting dual 4K@60Hz displays, 100W PD host charging, Gigabit Ethernet, SD/TF readers, and high-speed 10Gbps USB-C ports.",
    basePrice: 11999,
    baseDiscountPrice: 9499,
    stock: 19,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80", publicId: "prod/dock-1", isPrimary: true },
    ],
    ratingsAverage: 4.7,
    ratingsQuantity: 64,
    tags: ["electronics", "dock", "accessories", "deals"],
    featured: false,
  },
  {
    title: "PocketPower 65W GaN Travel Charger",
    category: "Electronics",
    brand: "Signal Works",
    description: "Compact Gallium Nitride (GaN) fast charger with foldable prongs and dual USB-C + USB-A ports capable of powering laptops and smartphones simultaneously.",
    basePrice: 2499,
    baseDiscountPrice: 1899,
    stock: 62,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80", publicId: "prod/gan-1", isPrimary: true },
    ],
    ratingsAverage: 4.9,
    ratingsQuantity: 440,
    tags: ["electronics", "charger", "travel", "bestseller"],
    featured: false,
  },
  {
    title: "Eon Mini Smart Home Hub",
    category: "Electronics",
    brand: "Nova Tech",
    description: "Universal smart home bridge supporting Matter, Zigbee, and Thread protocols with voice assistant integration and automated scene controllers.",
    basePrice: 4999,
    baseDiscountPrice: 3899,
    stock: 33,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80", publicId: "prod/hub-1", isPrimary: true },
    ],
    ratingsAverage: 4.4,
    ratingsQuantity: 82,
    tags: ["electronics", "smarthome", "iot"],
    featured: false,
  },

  // 11-20: Audio & Sound
  {
    title: "Aether Pro Wireless ANC Headphones",
    category: "Audio & Sound",
    brand: "Aether Audio",
    description: "Flagship hybrid active noise cancelling headphones featuring custom 40mm graphene drivers, LDAC high-res wireless audio codec, and 50-hour ultra-long battery life.",
    basePrice: 14999,
    baseDiscountPrice: 11999,
    stock: 26,
    hasVariants: true,
    variants: [
      {
        sku: "AETH-ANC-BLK",
        attributes: { color: "Obsidian Black", material: "Memory Foam & Leather" },
        price: 14999,
        discountPrice: 11999,
        stock: 14,
        image: { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80", publicId: "prod/anc-blk" },
      },
      {
        sku: "AETH-ANC-SLV",
        attributes: { color: "Starlight Silver", material: "Memory Foam & Leather" },
        price: 14999,
        discountPrice: 11999,
        stock: 12,
        image: { url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80", publicId: "prod/anc-slv" },
      },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80", publicId: "prod/headphone-1", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80", publicId: "prod/headphone-2", isPrimary: false },
    ],
    ratingsAverage: 4.9,
    ratingsQuantity: 380,
    tags: ["audio", "headphones", "wireless", "deals", "bestseller"],
    featured: true,
  },
  {
    title: "Pulse Buds True Wireless Earbuds",
    category: "Audio & Sound",
    brand: "Aether Audio",
    description: "Compact wireless in-ear monitors with 42dB intelligent adaptive noise cancellation, transparency audio pass-through, and IPX5 sweatproof protection.",
    basePrice: 5999,
    baseDiscountPrice: 4299,
    stock: 48,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80", publicId: "prod/earbuds-1", isPrimary: true },
    ],
    ratingsAverage: 4.7,
    ratingsQuantity: 290,
    tags: ["audio", "earbuds", "wireless", "sale"],
    featured: false,
  },
  {
    title: "SoundBox Heritage Wooden Bluetooth Speaker",
    category: "Audio & Sound",
    brand: "Aether Audio",
    description: "Vintage-styled 40W stereo loudspeaker handcrafted from solid walnut wood casing with analog brass control dials and modern Bluetooth 5.3 connectivity.",
    basePrice: 8999,
    baseDiscountPrice: 6999,
    stock: 22,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80", publicId: "prod/speaker-1", isPrimary: true },
    ],
    ratingsAverage: 4.8,
    ratingsQuantity: 154,
    tags: ["audio", "speaker", "vintage", "deals"],
    featured: true,
  },
  {
    title: "StudioReference 5 Inch Active Monitors",
    category: "Audio & Sound",
    brand: "Signal Works",
    description: "Pair of bi-amplified nearfield studio monitors tuned with kevlar composite woofers for clinical sound transparency and accurate music production mixing.",
    basePrice: 19999,
    baseDiscountPrice: 16499,
    stock: 12,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1520170350707-b2da59970118?auto=format&fit=crop&w=900&q=80", publicId: "prod/studio-1", isPrimary: true },
    ],
    ratingsAverage: 4.9,
    ratingsQuantity: 47,
    tags: ["audio", "studio", "monitors", "pro"],
    featured: false,
  },
  {
    title: "VinylWave Classic Belt-Drive Turntable",
    category: "Audio & Sound",
    brand: "Hearth & Co",
    description: "Precision belt-drive analog turntable with Audio-Technica magnetic phono cartridge, built-in switchable pre-amp, and Bluetooth vinyl streaming.",
    basePrice: 15999,
    baseDiscountPrice: 12999,
    stock: 16,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=900&q=80", publicId: "prod/turntable-1", isPrimary: true },
    ],
    ratingsAverage: 4.8,
    ratingsQuantity: 73,
    tags: ["audio", "turntable", "vinyl", "vintage"],
    featured: false,
  },
  {
    title: "BoomTrek Waterproof Outdoor Speaker",
    category: "Audio & Sound",
    brand: "Aether Audio",
    description: "IP67 submersible rugged outdoor speaker with 360-degree bass radiator, integrated silicone carry strap, and 24-hour party playback.",
    basePrice: 3999,
    baseDiscountPrice: 2899,
    stock: 50,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80", publicId: "prod/outdoor-spk-1", isPrimary: true },
    ],
    ratingsAverage: 4.6,
    ratingsQuantity: 210,
    tags: ["audio", "speaker", "waterproof", "sale"],
    featured: false,
  },
  {
    title: "SoundBar Pro 2.1 Virtual Dolby Atmos",
    category: "Audio & Sound",
    brand: "Aether Audio",
    description: "Slimline home theater soundbar with wireless down-firing subwoofer, HDMI eARC support, and multi-room optical audio playback.",
    basePrice: 12499,
    baseDiscountPrice: 9999,
    stock: 18,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80", publicId: "prod/soundbar-1", isPrimary: true },
    ],
    ratingsAverage: 4.7,
    ratingsQuantity: 112,
    tags: ["audio", "soundbar", "homecinema"],
    featured: false,
  },
  {
    title: "Aether Pods Compact Charging Case Earphones",
    category: "Audio & Sound",
    brand: "Aether Audio",
    description: "Featherlight everyday earphones with quad microphones for crystal-clear calls, touch controls, and instantaneous Bluetooth device pairing.",
    basePrice: 3299,
    baseDiscountPrice: 2399,
    stock: 65,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80", publicId: "prod/pods-1", isPrimary: true },
    ],
    ratingsAverage: 4.5,
    ratingsQuantity: 520,
    tags: ["audio", "earbuds", "budget", "bestseller"],
    featured: false,
  },
  {
    title: "VocalPure Dynamic Podcast Microphone",
    category: "Audio & Sound",
    brand: "Signal Works",
    description: "Cardioid dynamic vocal microphone designed for podcasting, voiceover, and livestreaming with internal pneumatic shock mounting.",
    basePrice: 8499,
    baseDiscountPrice: 6999,
    stock: 24,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80", publicId: "prod/vocal-1", isPrimary: true },
    ],
    ratingsAverage: 4.8,
    ratingsQuantity: 91,
    tags: ["audio", "podcast", "microphone"],
    featured: false,
  },
  {
    title: "AeroBeats Neckband Wireless Earphones",
    category: "Audio & Sound",
    brand: "Aether Audio",
    description: "Flexible silicone neckband with magnetic earbuds, magnetic auto-pause, low-latency gaming mode, and 30-hour battery life.",
    basePrice: 1999,
    baseDiscountPrice: 1499,
    stock: 75,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80", publicId: "prod/neckband-1", isPrimary: true },
    ],
    ratingsAverage: 4.4,
    ratingsQuantity: 610,
    tags: ["audio", "neckband", "budget", "sale"],
    featured: false,
  },

  // 21-30: Fashion & Apparel
  {
    title: "Atelier Relaxed Linen Shirt",
    category: "Fashion",
    brand: "Atelier One",
    description: "Tailored from 100% sustainably harvested French flax linen with breathable open collar, mother-of-pearl buttons, and relaxed drape.",
    basePrice: 2899,
    baseDiscountPrice: 2199,
    stock: 45,
    hasVariants: true,
    variants: [
      {
        sku: "ATL-LIN-WHT-M",
        attributes: { color: "Off-White", size: "M", material: "Pure Linen" },
        price: 2899,
        discountPrice: 2199,
        stock: 22,
        image: { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80", publicId: "prod/linen-wht" },
      },
      {
        sku: "ATL-LIN-NVY-L",
        attributes: { color: "Navy Blue", size: "L", material: "Pure Linen" },
        price: 2899,
        discountPrice: 2199,
        stock: 23,
        image: { url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80", publicId: "prod/linen-nvy" },
      },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80", publicId: "prod/shirt-1", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80", publicId: "prod/shirt-2", isPrimary: false },
    ],
    ratingsAverage: 4.8,
    ratingsQuantity: 185,
    tags: ["fashion", "shirt", "linen", "summer", "bestseller"],
    featured: true,
  },
  {
    title: "Heritage Selvedge Denim Jacket",
    category: "Fashion",
    brand: "Atelier One",
    description: "Heavyweight 14oz raw Japanese selvedge denim jacket finished with custom engraved copper rivets, reinforced bar tacks, and classic chest pockets.",
    basePrice: 5999,
    baseDiscountPrice: 4799,
    stock: 25,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=80", publicId: "prod/denim-1", isPrimary: true },
    ],
    ratingsAverage: 4.9,
    ratingsQuantity: 92,
    tags: ["fashion", "jacket", "denim", "featured"],
    featured: true,
  },
  {
    title: "Heavyweight Organic Cotton Hoodie",
    category: "Fashion",
    brand: "Atelier One",
    description: "450 GSM combed organic cotton fleece pullover hoodie with double-layered hood, ribbed side panels, and pre-shrunk premium fit.",
    basePrice: 3499,
    baseDiscountPrice: 2699,
    stock: 40,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80", publicId: "prod/hoodie-1", isPrimary: true },
    ],
    ratingsAverage: 4.7,
    ratingsQuantity: 310,
    tags: ["fashion", "hoodie", "streetwear", "bestseller"],
    featured: false,
  },
  {
    title: "Tailored Smart Wool-Blend Trousers",
    category: "Fashion",
    brand: "Atelier One",
    description: "Modern tapered dress trousers with elasticated hidden waistband, crease-resistant stretch blend, and clean front pleats.",
    basePrice: 3799,
    baseDiscountPrice: 2999,
    stock: 30,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80", publicId: "prod/trousers-1", isPrimary: true },
    ],
    ratingsAverage: 4.6,
    ratingsQuantity: 145,
    tags: ["fashion", "trousers", "formal"],
    featured: false,
  },
  {
    title: "Minimalist Trench Coat",
    category: "Fashion",
    brand: "Atelier One",
    description: "Water-repellent double-breasted cotton-gabardine trench coat with storm flap, removable waist belt, and satin interior lining.",
    basePrice: 8999,
    baseDiscountPrice: 7299,
    stock: 18,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80", publicId: "prod/trench-1", isPrimary: true },
    ],
    ratingsAverage: 4.8,
    ratingsQuantity: 67,
    tags: ["fashion", "coat", "winter", "deals"],
    featured: false,
  },
  {
    title: "Everyday Supima Cotton Crewneck Tee (Pack of 3)",
    category: "Fashion",
    brand: "Atelier One",
    description: "Ultra-soft staple tees made from extra-long staple Supima cotton that resists fading and pilling through hundreds of washes.",
    basePrice: 2499,
    baseDiscountPrice: 1899,
    stock: 60,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80", publicId: "prod/tee-1", isPrimary: true },
    ],
    ratingsAverage: 4.9,
    ratingsQuantity: 420,
    tags: ["fashion", "tshirt", "basics", "bestseller"],
    featured: false,
  },
  {
    title: "Merino Wool Knit Crewneck Sweater",
    category: "Fashion",
    brand: "Atelier One",
    description: "100% fine Australian Merino wool sweater with natural temperature-regulating microfibers and ribbed cuff accents.",
    basePrice: 4599,
    baseDiscountPrice: 3699,
    stock: 26,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80", publicId: "prod/sweater-1", isPrimary: true },
    ],
    ratingsAverage: 4.8,
    ratingsQuantity: 110,
    tags: ["fashion", "sweater", "winter", "deals"],
    featured: false,
  },
  {
    title: "Urban Technical Cargo Joggers",
    category: "Fashion",
    brand: "Atelier One",
    description: "DWR water-resistant stretch ripstop cargo pants with articulated knee seams, deep zip pockets, and elasticated ankle cuffs.",
    basePrice: 3299,
    baseDiscountPrice: 2499,
    stock: 35,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=900&q=80", publicId: "prod/cargo-1", isPrimary: true },
    ],
    ratingsAverage: 4.7,
    ratingsQuantity: 195,
    tags: ["fashion", "cargos", "streetwear"],
    featured: false,
  },
  {
    title: "Reversible Bomber Flight Jacket",
    category: "Fashion",
    brand: "Atelier One",
    description: "Classic aviation MA-1 flight silhouette with water-repellent nylon shell, lightweight thermal insulation, and rescue orange interior.",
    basePrice: 5499,
    baseDiscountPrice: 4299,
    stock: 22,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80", publicId: "prod/bomber-1", isPrimary: true },
    ],
    ratingsAverage: 4.6,
    ratingsQuantity: 84,
    tags: ["fashion", "bomber", "jacket"],
    featured: false,
  },
  {
    title: "Classic Oxford Button-Down Shirt",
    category: "Fashion",
    brand: "Atelier One",
    description: "Heavy oxford cloth weave with authentic roll button-down collar, curved hem, and box pleat for everyday smart-casual dressing.",
    basePrice: 2299,
    baseDiscountPrice: 1799,
    stock: 50,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80", publicId: "prod/oxford-1", isPrimary: true },
    ],
    ratingsAverage: 4.8,
    ratingsQuantity: 280,
    tags: ["fashion", "shirt", "formal", "bestseller"],
    featured: false,
  },

  // 31-38: Footwear
  {
    title: "CloudWalk Pro Cushion Sneakers",
    category: "Footwear",
    brand: "Stride Lab",
    description: "Ultra-responsive nitrogen-infused foam midsole paired with engineered breathable knit upper for all-day walking and high-energy running.",
    basePrice: 5499,
    baseDiscountPrice: 4299,
    stock: 38,
    hasVariants: true,
    variants: [
      {
        sku: "CWK-SNK-WHT-9",
        attributes: { color: "Cloud White", size: "UK 9", material: "Breathable Knit" },
        price: 5499,
        discountPrice: 4299,
        stock: 20,
        image: { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", publicId: "prod/snk-wht" },
      },
      {
        sku: "CWK-SNK-RED-10",
        attributes: { color: "Crimson Red", size: "UK 10", material: "Breathable Knit" },
        price: 5499,
        discountPrice: 4299,
        stock: 18,
        image: { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", publicId: "prod/snk-red" },
      },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", publicId: "prod/sneaker-1", isPrimary: true },
    ],
    ratingsAverage: 4.9,
    ratingsQuantity: 490,
    tags: ["footwear", "sneakers", "running", "deals", "bestseller"],
    featured: true,
  },
  {
    title: "Heritage Full-Grain Leather Chelsea Boots",
    category: "Footwear",
    brand: "Stride Lab",
    description: "Handcrafted from Italian full-grain pull-up leather with Goodyear welted construction, elasticated side gussets, and durable rubber commando sole.",
    basePrice: 8999,
    baseDiscountPrice: 7199,
    stock: 20,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=900&q=80", publicId: "prod/chelsea-1", isPrimary: true },
    ],
    ratingsAverage: 4.8,
    ratingsQuantity: 125,
    tags: ["footwear", "boots", "leather", "featured"],
    featured: true,
  },
  {
    title: "TerraGrip Waterproof Trail Running Shoes",
    category: "Footwear",
    brand: "Stride Lab",
    description: "Rugged Vibram Megagrip lugged outsole paired with GORE-TEX waterproof breathable membrane and rock protection plate for muddy mountain trails.",
    basePrice: 6999,
    baseDiscountPrice: 5499,
    stock: 24,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=80", publicId: "prod/trail-1", isPrimary: true },
    ],
    ratingsAverage: 4.7,
    ratingsQuantity: 88,
    tags: ["footwear", "trail", "running", "deals"],
    featured: false,
  },
  {
    title: "Suede Penny Loafers Handstitched",
    category: "Footwear",
    brand: "Stride Lab",
    description: "Supple calfskin suede loafers with handstitched apron, memory foam padded footbed, and unlined construction for unmatched sockless comfort.",
    basePrice: 5999,
    baseDiscountPrice: 4799,
    stock: 28,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=900&q=80", publicId: "prod/loafer-1", isPrimary: true },
    ],
    ratingsAverage: 4.7,
    ratingsQuantity: 160,
    tags: ["footwear", "loafers", "formal"],
    featured: false,
  },
  {
    title: "Retro Court Leather High-Top Trainers",
    category: "Footwear",
    brand: "Stride Lab",
    description: "Vintage 1980s basketball-inspired high-top trainers with perforated toe box, padded collar, and vulcanized rubber cupsole.",
    basePrice: 4999,
    baseDiscountPrice: 3899,
    stock: 32,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=900&q=80", publicId: "prod/hightop-1", isPrimary: true },
    ],
    ratingsAverage: 4.6,
    ratingsQuantity: 210,
    tags: ["footwear", "sneakers", "streetwear", "sale"],
    featured: false,
  },
  {
    title: "Everyday Slide Recovery Sandals",
    category: "Footwear",
    brand: "Stride Lab",
    description: "Ergonomic arch-support slides crafted from soft EVA foam designed for post-workout athletic recovery and poolside lounging.",
    basePrice: 1799,
    baseDiscountPrice: 1299,
    stock: 55,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=900&q=80", publicId: "prod/slides-1", isPrimary: true },
    ],
    ratingsAverage: 4.5,
    ratingsQuantity: 340,
    tags: ["footwear", "slides", "summer"],
    featured: false,
  },
  {
    title: "Minimalist Canvas Low-Top Sneakers",
    category: "Footwear",
    brand: "Stride Lab",
    description: "Breathable organic cotton canvas trainers with durable rubber toe bumper and OrthoLite comfort insole.",
    basePrice: 2899,
    baseDiscountPrice: 2199,
    stock: 42,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80", publicId: "prod/canvas-1", isPrimary: true },
    ],
    ratingsAverage: 4.7,
    ratingsQuantity: 285,
    tags: ["footwear", "canvas", "basics"],
    featured: false,
  },
  {
    title: "Alpine Explorer Waterproof Hiking Boots",
    category: "Footwear",
    brand: "Stride Lab",
    description: "High-ankle mountaineering boots with rubber rand scuff guards, steel shank support, and thermal fleece insulation.",
    basePrice: 9499,
    baseDiscountPrice: 7699,
    stock: 16,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=900&q=80", publicId: "prod/hiking-1", isPrimary: true },
    ],
    ratingsAverage: 4.8,
    ratingsQuantity: 95,
    tags: ["footwear", "boots", "hiking", "deals"],
    featured: false,
  },

  // 39-44: Accessories & Luxury Watches
  {
    title: "Aurora Minimalist Sapphire Watch",
    category: "Accessories",
    brand: "Northstar",
    description: "Sleek 38mm stainless steel case with scratch-resistant sapphire crystal glass, Japanese Miyota quartz movement, and interchangeable genuine Horween leather strap.",
    basePrice: 4999,
    baseDiscountPrice: 3899,
    stock: 30,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80", publicId: "prod/watch-1", isPrimary: true },
    ],
    ratingsAverage: 4.9,
    ratingsQuantity: 340,
    tags: ["accessories", "watches", "luxury", "bestseller"],
    featured: true,
  },
  {
    title: "Metro Chronograph Automatic Watch",
    category: "Accessories",
    brand: "Northstar",
    description: "Exhibition caseback automatic chronograph with 42-hour power reserve, tachymeter bezel, date complication, and 100m water resistance.",
    basePrice: 12999,
    baseDiscountPrice: 9999,
    stock: 15,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80", publicId: "prod/chrono-1", isPrimary: true },
    ],
    ratingsAverage: 4.9,
    ratingsQuantity: 110,
    tags: ["accessories", "watches", "luxury", "featured"],
    featured: true,
  },
  {
    title: "Orbit Polarized Aviator Sunglasses",
    category: "Accessories",
    brand: "Northstar",
    description: "Lightweight titanium wireframe aviators with UV400 polarized mineral glass lenses and anti-reflective internal coating.",
    basePrice: 2999,
    baseDiscountPrice: 2299,
    stock: 45,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80", publicId: "prod/sunglasses-1", isPrimary: true },
    ],
    ratingsAverage: 4.7,
    ratingsQuantity: 215,
    tags: ["accessories", "sunglasses", "summer", "sale"],
    featured: false,
  },
  {
    title: "Slim Bifold Leather Wallet with RFID Shield",
    category: "Accessories",
    brand: "Northstar",
    description: "Full-grain vegetable-tanned leather wallet with quick-draw card slot, cash compartment, and integrated electromagnetic RFID blocking barrier.",
    basePrice: 1899,
    baseDiscountPrice: 1399,
    stock: 50,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80", publicId: "prod/wallet-1", isPrimary: true },
    ],
    ratingsAverage: 4.8,
    ratingsQuantity: 480,
    tags: ["accessories", "wallet", "leather", "bestseller"],
    featured: false,
  },
  {
    title: "Insulated Stainless Steel Thermal Flask 750ml",
    category: "Accessories",
    brand: "Northstar",
    description: "Double-wall vacuum insulated 18/8 food-grade stainless steel bottle that keeps drinks cold for 24 hours or piping hot for 12 hours.",
    basePrice: 1499,
    baseDiscountPrice: 1099,
    stock: 65,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80", publicId: "prod/flask-1", isPrimary: true },
    ],
    ratingsAverage: 4.7,
    ratingsQuantity: 390,
    tags: ["accessories", "bottle", "lifestyle"],
    featured: false,
  },
  {
    title: "Braided Italian Leather Belt with Brushed Brass",
    category: "Accessories",
    brand: "Northstar",
    description: "Hand-plaited genuine leather belt with solid brass buckle that offers a custom micro-adjustable fit without standard prong holes.",
    basePrice: 1999,
    baseDiscountPrice: 1499,
    stock: 40,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80", publicId: "prod/belt-1", isPrimary: true },
    ],
    ratingsAverage: 4.6,
    ratingsQuantity: 180,
    tags: ["accessories", "belt", "leather"],
    featured: false,
  },

  // 45-47: Bags & Travel
  {
    title: "Commuter Waterproof Tech Backpack 24L",
    category: "Bags & Travel",
    brand: "Field Notes",
    description: "Weatherproof recycled polyester backpack with padded 16-inch laptop pocket, concealed passport security pocket, and luggage pass-through strap.",
    basePrice: 4999,
    baseDiscountPrice: 3899,
    stock: 35,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80", publicId: "prod/backpack-1", isPrimary: true },
    ],
    ratingsAverage: 4.8,
    ratingsQuantity: 275,
    tags: ["bags", "backpack", "travel", "deals", "bestseller"],
    featured: true,
  },
  {
    title: "Heritage Waxed Canvas Duffle Bag 45L",
    category: "Bags & Travel",
    brand: "Field Notes",
    description: "Rugged weekend duffle bag made from 18oz water-resistant waxed canvas with full-grain leather carry handles and removable shoulder strap.",
    basePrice: 5999,
    baseDiscountPrice: 4699,
    stock: 22,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=900&q=80", publicId: "prod/duffle-1", isPrimary: true },
    ],
    ratingsAverage: 4.9,
    ratingsQuantity: 130,
    tags: ["bags", "duffle", "travel", "featured"],
    featured: true,
  },
  {
    title: "Crossbody Tech Sling Pack 5L",
    category: "Bags & Travel",
    brand: "Field Notes",
    description: "Minimalist everyday sling with Fidlock magnetic buckle, waterproof YKK Aquaguard zippers, and padded tablet compartment.",
    basePrice: 2499,
    baseDiscountPrice: 1899,
    stock: 45,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80", publicId: "prod/sling-1", isPrimary: true },
    ],
    ratingsAverage: 4.7,
    ratingsQuantity: 190,
    tags: ["bags", "sling", "everyday", "sale"],
    featured: false,
  },

  // 48-50: Home & Living
  {
    title: "Nordic Minimalist Ceramic Pour-Over Coffee Set",
    category: "Home & Living",
    brand: "Hearth & Co",
    description: "Hand-thrown matte ceramic dripper with heat-resistant borosilicate glass carafe and reusable stainless steel micro-mesh filter.",
    basePrice: 2299,
    baseDiscountPrice: 1799,
    stock: 35,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=900&q=80", publicId: "prod/coffee-1", isPrimary: true },
    ],
    ratingsAverage: 4.8,
    ratingsQuantity: 240,
    tags: ["home", "coffee", "kitchen", "bestseller"],
    featured: true,
  },
  {
    title: "Aura Ultrasonic Ceramic Aroma Diffuser",
    category: "Home & Living",
    brand: "Hearth & Co",
    description: "Handcrafted stone ceramic ultrasonic aromatherapy diffuser with ambient warm LED nightlight and whisper-quiet ultrasonic atomization.",
    basePrice: 3499,
    baseDiscountPrice: 2699,
    stock: 40,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80", publicId: "prod/diffuser-1", isPrimary: true },
    ],
    ratingsAverage: 4.7,
    ratingsQuantity: 310,
    tags: ["home", "aroma", "decor", "deals"],
    featured: false,
  },
  {
    title: "Solid Walnut Monitor Stand & Desk Organizer",
    category: "Home & Living",
    brand: "Hearth & Co",
    description: "Handcrafted solid American walnut wood desk shelf with integrated cork padding, keyboard stow space, and aluminum cable management channel.",
    basePrice: 4299,
    baseDiscountPrice: 3499,
    stock: 28,
    hasVariants: false,
    images: [
      { url: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=900&q=80", publicId: "prod/deskshelf-1", isPrimary: true },
    ],
    ratingsAverage: 4.9,
    ratingsQuantity: 175,
    tags: ["home", "desk", "organization", "bestseller"],
    featured: true,
  },
];

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function seedCategories() {
  const categoryMap = new Map();

  for (const cat of categoriesData) {
    const slug = slugify(cat.name);
    const categoryDoc = await Category.findOneAndUpdate(
      { slug },
      {
        $set: {
          name: cat.name,
          slug,
          description: cat.description,
          isActive: true,
        },
      },
      { upsert: true, returnDocument: "after", runValidators: true }
    );
    categoryMap.set(cat.name, categoryDoc._id);
  }

  console.log(`✓ Seeded ${categoryMap.size} product categories.`);
  return categoryMap;
}

async function seedProducts() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is missing.");
  }

  console.log("=== STARTING COMPLETE 50-PRODUCT SEEDING ===");
  await mongoose.connect(process.env.MONGO_URI);

  const categoryMap = await seedCategories();

  // Clear existing products to ensure clean catalog with full fields
  const deleteResult = await Product.deleteMany({});
  console.log(`✓ Cleared ${deleteResult.deletedCount} previous products.`);

  const productsToInsert = productsData.map((p) => {
    const slug = slugify(p.title);
    const categoryId = categoryMap.get(p.category);

    return {
      title: p.title,
      slug,
      description: p.description,
      brand: p.brand,
      category: categoryId,
      images: p.images,
      basePrice: p.basePrice,
      baseDiscountPrice: p.baseDiscountPrice,
      stock: p.stock,
      hasVariants: p.hasVariants || false,
      variants: p.variants || [],
      ratingsAverage: p.ratingsAverage,
      ratingsQuantity: p.ratingsQuantity,
      tags: p.tags || [],
      isPublished: true,
      featured: p.featured || false,
    };
  });

  const inserted = await Product.insertMany(productsToInsert);
  console.log(`🎉 SUCCESS: Seeded ${inserted.length} rich products with all fields!`);

  // Print summary by category
  const counts = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  console.log("=== PRODUCT DISTRIBUTION ===");
  for (const c of counts) {
    const cat = await Category.findById(c._id);
    console.log(`- ${cat?.name || "Other"}: ${c.count} products`);
  }
}

seedProducts()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log("✓ MongoDB Disconnected");
  });
