/**
 * Gamification types aligned with backend UserPoints, Achievement, PointTransaction models
 * @module gamification.types
 */

// ============================================================================
// Points Types
// ============================================================================

/**
 * User points entity
 * Aligned with: models.py UserPoints
 */
export type UserPoints = {
  id: number
  user_id: number
  points_total: number
  current_level: number
  level_progress: number
  streak_days: number
  last_activity_date: string
}

/**
 * Points action type
 */
export type PointsActionType =
  | 'post_yap'
  | 'receive_like'
  | 'receive_reply'
  | 'receive_retweet'
  | 'create_poll'
  | 'vote_poll'
  | 'daily_login'
  | 'streak_bonus'
  | 'achievement_unlocked'
  | 'badge_purchased'

/**
 * Point transaction
 * Aligned with: models.py PointTransaction
 */
export type PointTransaction = {
  id: number
  user_id: number
  action_type: PointsActionType
  points_amount: number
  reference_id?: string
  reference_type?: string
  created_at: string
}

// ============================================================================
// Achievement Types
// ============================================================================

/**
 * Achievement category
 */
export type AchievementCategory = 'social' | 'content' | 'engagement' | 'community' | 'special'

/**
 * Achievement entity
 * Aligned with: models.py Achievement
 */
export type Achievement = {
  id: number
  name: string
  description: string
  icon_url: string
  category: AchievementCategory
  points_reward: number
  requirement_type: string
  requirement_value: number
  is_hidden: boolean
}

/**
 * User achievement (unlocked achievement)
 * Aligned with: models.py UserAchievement
 */
export type UserAchievement = {
  id: number
  user_id: number
  achievement_id: number
  achievement: Achievement
  unlocked_at: string
  progress_value: number
  is_claimed: boolean
}

// ============================================================================
// Level Types
// ============================================================================

/**
 * User level info
 */
export type UserLevel = {
  level: number
  name: string
  minPoints: number
  maxPoints: number
  perks: string[]
}

/**
 * Level progress
 */
export type LevelProgress = {
  currentLevel: UserLevel
  nextLevel: UserLevel | null
  currentPoints: number
  pointsToNextLevel: number
  progressPercentage: number
}

// ============================================================================
// Leaderboard Types
// ============================================================================

/**
 * Leaderboard entry
 */
export type LeaderboardEntry = {
  rank: number
  user: {
    id: string
    username: string
    display_name: string
    avatar: string
  }
  points: number
  level: number
}

/**
 * Leaderboard timeframe
 */
export type LeaderboardTimeframe = 'daily' | 'weekly' | 'monthly' | 'all_time'

/**
 * Leaderboard response
 */
export type LeaderboardResponse = {
  timeframe: LeaderboardTimeframe
  entries: LeaderboardEntry[]
  currentUserRank?: number
}

// ============================================================================
// Trending Types
// ============================================================================

/**
 * Trending topic
 * Aligned with: models.py TrendingTopic
 */
export type TrendingTopic = {
  id: number
  topic_type: 'hashtag' | 'keyword' | 'user'
  topic_value: string
  mention_count: number
  trend_score: number
  time_window: string
  created_at: string
}
