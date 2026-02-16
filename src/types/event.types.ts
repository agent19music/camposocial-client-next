/**
 * Event types aligned with backend Events, EventTicketGroup, Comment_events models
 * @module event.types
 */

// ============================================================================
// Event Comment Types
// ============================================================================

/**
 * Event comment user info
 */
export type EventCommentUser = {
  id: string | number | null
  username: string | null
  avatar: string | null
}

/**
 * Event comment
 * Aligned with: models.py Comment_events
 */
export type EventComment = {
  id: number
  text: string
  createdAt: string
  updatedAt: string
  user: EventCommentUser
  likesCount: number
  likedByCurrentUser: boolean
  parentCommentId: number | null
  replies: EventComment[]
}

/**
 * Event comment creation payload
 */
export type EventCommentPayload = {
  text: string
  parent_comment_id?: number
}

/**
 * Event comment like response
 */
export type EventLikeResponse = {
  message: string
  likesCount: number
  likedByCurrentUser: boolean
}

// ============================================================================
// Event Ticket Types
// ============================================================================

/**
 * Event ticket group
 * Aligned with: models.py EventTicketGroup
 */
export type EventTicketGroup = {
  id: string
  name: string
  price: number
  quantity: number
  ticketsPerGroup: number
  description?: string
  createdAt: string
  updatedAt: string
}

/**
 * Event ticket group input for creating/updating
 */
export type EventTicketGroupInput = {
  name: string
  price: number
  quantity: number
  ticketsPerGroup?: number
  description?: string
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * App event entity
 * Aligned with: models.py Events
 */
export type AppEvent = {
  id: string
  eventId?: string
  poster: string
  entry_fee: number | string
  created_at: string
  updated_at: string
  start_time: string | null
  end_time: string | null
  date_of_event: string
  date: string
  location: string
  user_id: string
  comments: EventComment[]
  ticketGroups: EventTicketGroup[]
  title: string
  description: string
  category: string
  userimage: string
  username: string
  display_name: string
}

/**
 * Event creation/update payload
 */
export type AddEventPayload = {
  poster: string
  posterFile?: File | null
  entry_fee: number | string
  created_at: string
  updated_at: string
  start_time: string
  end_time: string
  date_of_event: string | Date | undefined
  location: string
  user_id: string
  comments: EventComment[]
  title: string
  description: string
  category: string
  ticketGroups: EventTicketGroupInput[]
}

/**
 * User event summary
 */
export type UserEvent = {
  id: string
  avatar: string
  course: string
  email: string
}

/**
 * Event category
 */
export type EventCategory = 
  | 'music'
  | 'sports'
  | 'academic'
  | 'social'
  | 'cultural'
  | 'career'
  | 'other'
