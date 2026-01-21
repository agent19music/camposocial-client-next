'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { AuthContext } from './authcontext'
import toast from 'react-hot-toast'

interface PollOption {
    id: number
    option_text: string
    vote_count?: number
    percentage?: number
    is_user_choice?: boolean
    order_index: number
}

interface Poll {
    id: string
    title: string
    description?: string
    category: string
    poll_type: 'single' | 'multiple'
    is_anonymous: boolean
    total_votes: number
    has_voted: boolean
    show_results?: boolean
    ends_at: string | null
    is_expired: boolean
    options: PollOption[]
    creator?: {
        id: number
        username: string
        display_name: string
        avatar?: string
    }
    created_at: string
}

interface CreatePollData {
    title: string
    description?: string
    options: string[]
    duration_hours?: number
    group_id?: string
    category?: string
    is_anonymous?: boolean
}

interface PollContextProps {
    createPoll: (data: CreatePollData) => Promise<{ success: boolean; poll?: Poll; error?: string }>
    vote: (pollId: string, optionId: number) => Promise<{ success: boolean; results?: PollOption[]; error?: string }>
    getPollDetails: (pollId: string) => Promise<Poll | null>
    getPolls: (groupId?: string, activeOnly?: boolean) => Promise<Poll[]>
    getTrendingPolls: () => Promise<Poll[]>
}

const PollContext = createContext<PollContextProps | undefined>(undefined)

export function PollProvider({ children }: { children: React.ReactNode }) {
    const { authToken } = useContext(AuthContext)
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT

    const createPoll = useCallback(async (data: CreatePollData) => {
        try {
            const response = await fetch(`${apiEndpoint}/polls`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (response.ok) {
                return { success: true, poll: result.poll }
            } else {
                return { success: false, error: result.error || 'Failed to create poll' }
            }
        } catch (error) {
            console.error('Error creating poll:', error)
            return { success: false, error: 'Network error' }
        }
    }, [apiEndpoint, authToken])

    const vote = useCallback(async (pollId: string, optionId: number) => {
        try {
            const response = await fetch(`${apiEndpoint}/polls/${pollId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ option_id: optionId }),
            })

            const result = await response.json()

            if (response.ok) {
                return { success: true, results: result.results, totalVotes: result.total_votes }
            } else {
                toast.error(result.error || 'Failed to vote')
                return { success: false, error: result.error || 'Failed to vote' }
            }
        } catch (error) {
            console.error('Error voting:', error)
            return { success: false, error: 'Network error' }
        }
    }, [apiEndpoint, authToken])

    const getPollDetails = useCallback(async (pollId: string): Promise<Poll | null> => {
        try {
            const response = await fetch(`${apiEndpoint}/polls/${pollId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            })

            if (response.ok) {
                return await response.json()
            }
            return null
        } catch (error) {
            console.error('Error fetching poll details:', error)
            return null
        }
    }, [apiEndpoint, authToken])

    const getPolls = useCallback(async (groupId?: string, activeOnly: boolean = true): Promise<Poll[]> => {
        try {
            const params = new URLSearchParams()
            if (groupId) params.append('group_id', groupId)
            params.append('active_only', activeOnly.toString())

            const response = await fetch(`${apiEndpoint}/polls?${params}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                return data.polls || []
            }
            return []
        } catch (error) {
            console.error('Error fetching polls:', error)
            return []
        }
    }, [apiEndpoint, authToken])

    const getTrendingPolls = useCallback(async (): Promise<Poll[]> => {
        try {
            const response = await fetch(`${apiEndpoint}/polls/trending`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                return data.trending_polls || []
            }
            return []
        } catch (error) {
            console.error('Error fetching trending polls:', error)
            return []
        }
    }, [apiEndpoint, authToken])

    return (
        <PollContext.Provider value={{
            createPoll,
            vote,
            getPollDetails,
            getPolls,
            getTrendingPolls,
        }}>
            {children}
        </PollContext.Provider>
    )
}

export function usePoll() {
    const context = useContext(PollContext)
    if (!context) {
        throw new Error('usePoll must be used within a PollProvider')
    }
    return context
}

export { PollContext }
export type { Poll, PollOption, CreatePollData }
