export interface Product {
  id: string;
  name: string;
  label: string;
  price: number;
  skinType: string;
  image: string;
  description: string;
}

export interface Review {
  id: string;
  username: string;
  reviewText: string;
  sentiment: "positive" | "negative" | "neutral";
  date: string;
  productId?: string;
  rating: number;
}

export const products: Product[] = [
  // Dresses
  { id: "1", name: "Silk Wrap Dress", label: "dress", price: 7499, skinType: "all", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop", description: "Elegant silk wrap dress with a flattering silhouette" },
  { id: "21", name: "Floral Midi Dress", label: "dress", price: 5499, skinType: "all", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop", description: "Graceful floral midi dress perfect for day to evening" },
  { id: "22", name: "Linen Shirt Dress", label: "dress", price: 4999, skinType: "all", image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=400&h=500&fit=crop", description: "Relaxed linen shirt dress with a belted waist" },
  { id: "23", name: "Velvet Evening Gown", label: "dress", price: 15999, skinType: "all", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop", description: "Luxurious velvet gown for special occasions" },
  // Blazers
  { id: "2", name: "Linen Blazer", label: "blazer", price: 10799, skinType: "all", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop", description: "Structured linen blazer for effortless sophistication" },
  { id: "24", name: "Plaid Oversized Blazer", label: "blazer", price: 8999, skinType: "all", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop", description: "Bold plaid oversized blazer for a statement look" },
  // Sweaters
  { id: "3", name: "Cashmere Sweater", label: "sweater", price: 12499, skinType: "all", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop", description: "Ultra-soft cashmere pullover in a timeless cut" },
  { id: "27", name: "Cable Knit Cardigan", label: "sweater", price: 6799, skinType: "all", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop", description: "Chunky cable knit cardigan for layered looks" },
  // Tops
  { id: "7", name: "Satin Camisole", label: "top", price: 3799, skinType: "all", image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=500&fit=crop", description: "Delicate satin camisole with lace detail" },
  { id: "28", name: "Cropped Linen Blouse", label: "top", price: 2999, skinType: "all", image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=500&fit=crop", description: "Breezy cropped linen blouse with flutter sleeves" },
  // Trousers
  { id: "6", name: "Wide Leg Trousers", label: "trousers", price: 6499, skinType: "all", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop", description: "High-waisted wide leg trousers in cream" },
  { id: "30", name: "Tailored Cigarette Pants", label: "trousers", price: 5299, skinType: "all", image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=500&fit=crop", description: "Slim tailored cigarette pants in charcoal" },
  { id: "31", name: "Pleated Palazzo Pants", label: "trousers", price: 4799, skinType: "all", image: "https://images.unsplash.com/photo-1551854838-212c9a5fc5e2?w=400&h=500&fit=crop", description: "Flowing pleated palazzo pants for effortless style" },
  // Skirts
  { id: "34", name: "Flowy Wrap Skirt", label: "skirt", price: 2999, skinType: "all", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop", description: "Light wrap skirt in a tropical floral print" },
  // Accessories
  { id: "35", name: "Pearl Hair Clip Set", label: "accessories", price: 1299, skinType: "all", image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&h=500&fit=crop", description: "Set of 3 elegant pearl hair clips" },
  { id: "36", name: "Leather Belt", label: "accessories", price: 2499, skinType: "all", image: "https://images.unsplash.com/photo-1624222247344-550fb60fe8ff?w=400&h=500&fit=crop", description: "Minimalist tan leather belt with gold buckle" },
  { id: "37", name: "Silk Scarf", label: "accessories", price: 3499, skinType: "all", image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=500&fit=crop", description: "Hand-painted silk scarf in vibrant hues" },
  // Beauty
  { id: "4", name: "Rose Lip Tint", label: "beauty", price: 1999, skinType: "sensitive", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=500&fit=crop", description: "Sheer rose-toned lip tint for a natural flush" },
  { id: "5", name: "Hydrating Serum", label: "beauty", price: 4599, skinType: "dry", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=500&fit=crop", description: "Deep hydrating serum with hyaluronic acid" },
  { id: "8", name: "Glow Foundation", label: "beauty", price: 3199, skinType: "oily", image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&h=500&fit=crop", description: "Lightweight foundation with luminous finish" },
  { id: "38", name: "Matte Nude Lipstick", label: "beauty", price: 1799, skinType: "all", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=500&fit=crop", description: "Long-wear matte lipstick in nude rose" },
  { id: "39", name: "Vitamin C Brightening Cream", label: "beauty", price: 3999, skinType: "dry", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=500&fit=crop", description: "Vitamin C cream for radiant, even-toned skin" },
  { id: "42", name: "Micellar Cleansing Water", label: "beauty", price: 1299, skinType: "sensitive", image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=500&fit=crop", description: "Gentle micellar water for all skin types" },
];

export const categories = ["all", "dress", "blazer", "sweater", "top", "trousers", "skirt", "accessories", "beauty"];
export const skinTypes = ["all", "sensitive", "dry", "oily"];
export const priceRanges = [
  { label: "All", min: 0, max: Infinity },
  { label: "Under ₹4,000", min: 0, max: 4000 },
  { label: "₹4,000 – ₹8,000", min: 4000, max: 8000 },
  { label: "Over ₹8,000", min: 8000, max: Infinity },
];
