/**
 * Poll types aligned with backend Poll, PollOption, PollVote models
 * @module poll.types
 */

// ============================================================================
// Poll Option Types
// ============================================================================

/**
 * Poll option
 * Aligned with: models.py PollOption
 */
export type PollOption = {
  id: number
  option_text: string
  vote_count?: number
  percentage?: number
  is_user_choice?: boolean
  order_index: number
}

// ============================================================================
// Poll Types
// ============================================================================

/**
 * Poll type (single or multiple choice)
 */
export type PollType = 'single' | 'multiple'

/**
 * Poll category
 */
export type PollCategory = 'campus' | 'event' | 'course' | 'general'

/**
 * Poll creator info
 */
export type PollCreator = {
  id: number
  username: string
  display_name: string
  avatar?: string
}

/**
 * Full poll entity
 * Aligned with: models.py Poll
 */
export type Poll = {
  id: string
  title: string
  description?: string
  category: string
  poll_type: PollType
  is_anonymous: boolean
  total_votes: number
  has_voted: boolean
  show_results?: boolean
  ends_at: string | null
  is_expired: boolean
  options: PollOption[]
  creator?: PollCreator
  created_at: string
}

/**
 * Poll creation payload
 */
export type CreatePollPayload = {
  title: string
  description?: string
  options: string[]
  duration_hours?: number
  group_id?: string
  category?: PollCategory
  is_anonymous?: boolean
}

// Legacy alias
export type CreatePollData = CreatePollPayload

/**
 * Poll vote response
 */
export type PollVoteResponse = {
  success: boolean
  results?: PollOption[]
  error?: string
}

/**
 * Poll creation response
 */
export type CreatePollResponse = {
  success: boolean
  poll?: Poll
  error?: string
}
