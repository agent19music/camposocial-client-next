/**
 * Generates a unique conversation ID from two user IDs.
 * Sorts the IDs to ensure the same conversation ID is generated
 * regardless of which user initiates the chat.
 * 
 * @param userId1 - The ID of the first user (current user)
 * @param userId2 - The ID of the second user (friend)
 * @returns A consistent, unique conversation ID
 */
export function generateConversationId(userId1: string, userId2: string): string {
  // Sort the IDs to ensure consistency regardless of order
  const sortedIds = [userId1, userId2].sort();
  
  // Join the sorted IDs to create a unique conversation identifier
  // Using a separator that's unlikely to appear in IDs
  return `${sortedIds[0]}_${sortedIds[1]}`;
}

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const d = new Date(date)
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(d)
}