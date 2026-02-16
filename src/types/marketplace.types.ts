/**
 * Marketplace types aligned with backend Products, Seller, Cart, Order models
 * @module marketplace.types
 */

// ============================================================================
// Product Variation Types
// ============================================================================

/**
 * Product variation (size, color, etc.)
 * Aligned with: models.py ProductVariation
 */
export type ProductVariation = {
  id: string
  name: string
  price: number
  stock: number
  value: string
}

// Legacy alias
export type Variation = ProductVariation

// ============================================================================
// Seller Types
// ============================================================================

/**
 * Seller entity
 * Aligned with: models.py Seller
 */
export type Seller = {
  id: string
  name: string
  avatar: string
  sales: number
  rating: number
  is_verified: boolean
  location?: string
  products?: Product[]
  reviews?: ProductReview[]
  joinedDate?: string
  about?: string
}

// ============================================================================
// Product Types
// ============================================================================

/**
 * Product review
 * Aligned with: models.py Reviews
 */
export type ProductReview = {
  id: number
  username: string
  rating: number
  text: string
  avatar: string
}

/**
 * Product entity
 * Aligned with: models.py Products
 */
export type Product = {
  id: string
  slug?: string
  average_rating: number
  category: string
  created_at: string
  images: string[]
  title: string
  brand: string
  price: number
  sellerAvatar: string | null
  sellerIsVerified: boolean
  sellerName: string
  seller_id: string
  description: string
  rating: number
  reviewsCount: number
  seller: Seller
  reviews: ProductReview[]
  variations: ProductVariation[]
  isBestseller?: boolean
  isNew?: boolean
}

// ============================================================================
// Cart Types
// ============================================================================

/**
 * Cart item
 * Aligned with: models.py CartItem
 */
export type CartItem = {
  id: number
  product_id: string
  product: {
    id: string
    title: string
    price: number
    images: string[]
    seller: {
      id: string
      name: string
    }
  }
  quantity: number
  variation_id?: string
  variation?: ProductVariation
  subtotal: number
}

/**
 * Cart response from API
 */
export type CartResponse = {
  id: number
  items: CartItem[]
  total: number
  item_count: number
}

/**
 * Add to cart payload
 */
export type AddToCartPayload = {
  productId: string
  quantity?: number
  variationId?: string
}

// ============================================================================
// Order Types
// ============================================================================

/**
 * Order status
 */
export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

/**
 * Order item
 * Aligned with: models.py OrderItem
 */
export type OrderItem = {
  id: number
  product_id: string
  product_title: string
  product_image: string
  quantity: number
  price: number
  variation_id?: string
  variation_name?: string
}

/**
 * Order entity
 * Aligned with: models.py Order
 */
export type Order = {
  id: number
  order_number: string
  user_id: number
  status: OrderStatus
  total: number
  items: OrderItem[]
  shipping_address?: string
  payment_method: string
  payment_status: 'pending' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

// ============================================================================
// Wishlist Types
// ============================================================================

/**
 * Wishlist item
 * Aligned with: models.py Wishlists
 */
export type WishlistItem = {
  id: number
  user_id: number
  product_id: string
  product: Product
  added_at: string
}

// ============================================================================
// Discount Types
// ============================================================================

/**
 * Discount code
 * Aligned with: models.py Discount
 */
export type DiscountCode = {
  id: number
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase?: number
  max_discount?: number
  valid_from: string
  valid_until: string
  is_active: boolean
}

/**
 * Discount validation response from API
 */
export type DiscountValidation = {
  valid: boolean
  code: string
  discount_type: 'percentage' | 'fixed'
  value: number
  discount_amount: number
  final_total: number
  error?: string
}

// ============================================================================
// Display Types (for UI components)
// ============================================================================

/**
 * Simplified cart item for display in cart/checkout/receipt components
 */
export type CartItemDisplay = {
  id: string
  product_title: string
  quantity: number
  price_per_item: number
  total_item_price: number
  images: string[]
}

/**
 * Simplified cart response for display
 */
export type CartResponseDisplay = {
  cart_items: CartItemDisplay[]
}

// ============================================================================
// Refund Types
// ============================================================================

/**
 * Refund request status
 */
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processed'

/**
 * Refund request
 * Aligned with: models.py Refund
 */
export type RefundRequest = {
  id: number
  order_id: number
  reason: string
  status: RefundStatus
  amount: number
  created_at: string
  processed_at?: string
}
