export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image?: string;
  description?: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  weight: string;
  unit: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  sku: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  origin: string;
  isOrganic: boolean;
  isFlashDeal: boolean;
  isHidden?: boolean;
  rating: number;
  reviewCount: number;
  images: string; // JSON string of string array
  categoryId?: string;
  subcategoryId?: string | null;
  category?: any;
  subcategory?: any;
  variants: ProductVariant[];
  reviews?: Review[];
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountAmount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'DRIVER';
  phone?: string;
  address?: string;
}

export interface OrderItem {
  id: string;
  variantId: string;
  productName: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  discountAmount: number;
  deliveryFee: number;
  tax: number;
  netAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  deliverySlot: string;
  createdAt: string;
  items: OrderItem[];
}
