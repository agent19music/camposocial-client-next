/**
 * Badge types aligned with backend Badge, UserBadge, BadgeTransaction models
 * @module badge.types
 */

// ============================================================================
// Badge Types
// ============================================================================

/**
 * Badge type category
 * - 'uni': University badges (auto-awarded)
 * - 'free': Free/promotional badges
 * - 'commercial': Paid badges
 */
export type BadgeType = 'uni' | 'free' | 'commercial'

/**
 * Badge entity
 * Aligned with: models.py Badge
 */
export type Badge = {
  id: number
  name: string
  description: string | null
  image_url: string
  price_ksh: number
  badge_type: BadgeType
  is_animated: boolean
  is_active: boolean
  created_at: string
}

/**
 * Badge item for display (simplified)
 */
export type BadgeItem = {
  id: number
  name: string
  description?: string
  image_url: string
  price_ksh: number
  badge_type: BadgeType
  is_animated: boolean
}

// ============================================================================
// User Badge Types
// ============================================================================

/**
 * Badge acquisition source
 */
export type BadgeSource = 'purchase' | 'auto_award' | 'admin_grant' | 'promotion'

/**
 * User badge (badge owned by user)
 * Aligned with: models.py UserBadge
 */
export type UserBadge = {
  id: number
  user_id: number
  badge_id: number
  badge: Badge
  is_displayed: boolean
  display_order: number
  purchased_at: string
  source: BadgeSource
}

/**
 * User badge for management UI (flattened structure)
 * Used in badge management component where API returns flattened data
 */
export type UserBadgeManagement = {
  id: number
  name: string
  description: string
  image_url: string
  badge_type?: BadgeType
  is_animated: boolean
  is_displayed: boolean
  display_order: number
  purchased_at: string
  source?: BadgeSource
}

/**
 * User badge for display on profile
 */
export type UserBadgeDisplay = {
  id: number
  name: string
  image_url: string
  is_animated: boolean
}

// ============================================================================
// Badge Transaction Types
// ============================================================================

/**
 * Badge transaction status
 */
export type BadgeTransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

/**
 * Payment method for badges
 */
export type BadgePaymentMethod = 'MPESA'

/**
 * Payment provider
 */
export type BadgePaymentProvider = 'intasend' | 'mpesa'

/**
 * Badge transaction
 * Aligned with: models.py BadgeTransaction
 */
export type BadgeTransaction = {
  id: number
  user_id: number
  badge_id: number
  phone_number: string
  amount: number
  mpesa_receipt_number?: string
  mpesa_transaction_id?: string
  checkout_request_id?: string
  status: BadgeTransactionStatus
  payment_method: BadgePaymentMethod
  payment_provider: BadgePaymentProvider
  created_at: string
  completed_at?: string
  error_message?: string
}

// ============================================================================
// Badge Purchase Types
// ============================================================================

/**
 * Badge purchase step
 */
export type BadgePurchaseStep = 'select' | 'payment' | 'processing' | 'complete'

/**
 * Badge purchase payload
 */
export type BadgePurchasePayload = {
  badge_id: number
  phone_number: string
  payment_method: BadgePaymentMethod
}

/**
 * Badge purchase response
 */
export type BadgePurchaseResponse = {
  success: boolean
  transaction_id?: number
  checkout_request_id?: string
  message?: string
  error?: string
}

// ============================================================================
// Badge Management Types
// ============================================================================

/**
 * Update badge display payload
 */
export type UpdateBadgeDisplayPayload = {
  badge_id: number
  is_displayed: boolean
  display_order?: number
}

/**
 * Badge display props for component
 */
export type BadgeDisplayProps = {
  badges: UserBadgeDisplay[]
  size?: 'sm' | 'md' | 'lg'
  maxDisplay?: number
  showTooltip?: boolean
}

/**
 * Badge management props for component
 */
export type BadgeManagementProps = {
  userId: number
  onUpdate?: () => void
}

/**
 * Badge purchase modal props
 */
export type BadgePurchaseModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}
