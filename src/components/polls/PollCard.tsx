'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { usePoll } from '@/context/pollcontext'
import { Poll, PollOption, PollCardProps } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, Clock, BarChart3 } from 'lucide-react'

export default function PollCard({ pollId, initialPoll, compact = false }: PollCardProps) {
    const { getPollDetails, vote } = usePoll()
    const [poll, setPoll] = useState<Poll | null>(initialPoll || null)
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [isVoting, setIsVoting] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)
    const [isLoading, setIsLoading] = useState(!initialPoll)

    // Fetch poll details if not provided
    useEffect(() => {
        if (!initialPoll && pollId) {
            setIsLoading(true)
            getPollDetails(pollId).then((data) => {
                if (data) {
                    setPoll(data)
                    setHasVoted(data.has_voted)
                }
                setIsLoading(false)
            })
        } else if (initialPoll) {
            setHasVoted(initialPoll.has_voted)
        }
    }, [pollId, initialPoll, getPollDetails])

    // Calculate time remaining
    const getTimeRemaining = useCallback(() => {
        if (!poll?.ends_at) return null

        const endDate = new Date(poll.ends_at)
        const now = new Date()
        const diff = endDate.getTime() - now.getTime()

        if (diff <= 0) return 'Final results'

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        if (hours >= 24) {
            const days = Math.floor(hours / 24)
            return `${days}d left`
        }
        if (hours > 0) {
            return `${hours}h ${minutes}m left`
        }
        return `${minutes}m left`
    }, [poll?.ends_at])

    const [timeRemaining, setTimeRemaining] = useState<string | null>(null)

    // Update time remaining every minute
    useEffect(() => {
        setTimeRemaining(getTimeRemaining())
        const interval = setInterval(() => {
            setTimeRemaining(getTimeRemaining())
        }, 60000)
        return () => clearInterval(interval)
    }, [getTimeRemaining])

    const handleVote = async () => {
        if (!selectedOption || !poll || hasVoted || poll.is_expired) return

        // Store previous state for rollback on error
        const previousPoll = poll
        const previousHasVoted = hasVoted

        // Calculate optimistic percentages immediately
        const newTotalVotes = poll.total_votes + 1
        const optimisticOptions = poll.options.map(opt => {
            const newVoteCount = opt.id === selectedOption 
                ? (opt.vote_count || 0) + 1 
                : (opt.vote_count || 0)
            const newPercentage = newTotalVotes > 0 
                ? (newVoteCount / newTotalVotes) * 100 
                : 0
            return {
                ...opt,
                vote_count: newVoteCount,
                percentage: newPercentage,
                is_user_choice: opt.id === selectedOption
            }
        })

        // Optimistic update - show results immediately
        setPoll({
            ...poll,
            has_voted: true,
            show_results: true,
            total_votes: newTotalVotes,
            options: optimisticOptions
        })
        setHasVoted(true)
        setIsVoting(true)

        try {
            const result = await vote(poll.id, selectedOption)
            if (result.success && result.results) {
                // Update with server data (mainly for accurate vote counts)
                setPoll(prev => prev ? {
                    ...prev,
                    total_votes: (result as any).totalVotes || prev.total_votes,
                    options: prev.options.map(opt => {
                        const updatedOpt = result.results?.find(r => r.id === opt.id)
                        if (updatedOpt) {
                            return {
                                ...opt,
                                vote_count: updatedOpt.vote_count,
                                percentage: updatedOpt.percentage
                            }
                        }
                        return opt
                    })
                } : null)
            } else {
                // Revert on failure
                setPoll(previousPoll)
                setHasVoted(previousHasVoted)
            }
        } catch (error) {
            // Revert optimistic update on error
            setPoll(previousPoll)
            setHasVoted(previousHasVoted)
            console.error('Vote failed:', error)
        } finally {
            setIsVoting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-4 border rounded-xl bg-muted/30 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                <div className="space-y-2">
                    <div className="h-10 bg-muted rounded" />
                    <div className="h-10 bg-muted rounded" />
                </div>
            </div>
        )
    }

    if (!poll) return null

    // Defensive check: ensure options is an array
    const pollOptions = poll.options || []
    const showResults = hasVoted || poll.is_expired || poll.show_results

    // If no options, show a message
    if (pollOptions.length === 0) {
        return (
            <div className={cn(
                "mt-3 p-4 border rounded-xl bg-muted/20",
                compact && "p-3"
            )}>
                <p className="text-sm text-muted-foreground">
                    {poll.title}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                    No poll options available
                </p>
            </div>
        )
    }

    return (
        <div 
            className={cn(
                "mt-3 p-4 border rounded-xl bg-muted/20",
                compact && "p-3"
            )}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Poll options */}
            <div className="space-y-2">
                {pollOptions.map((option) => (
                    <div
                        key={option.id}
                        onClick={() => !showResults && !isVoting && setSelectedOption(option.id)}
                        className={cn(
                            "relative rounded-lg overflow-hidden transition-all",
                            showResults
                                ? "cursor-default"
                                : "cursor-pointer hover:bg-muted/50",
                            !showResults && selectedOption === option.id && "ring-2 ring-primary ring-offset-1",
                            !showResults && "border border-border p-3"
                        )}
                    >
                        {showResults ? (
                            // Results view with progress bar
                            <div className="relative">
                                {/* Progress bar background */}
                                <div
                                    className={cn(
                                        "absolute inset-0 rounded-lg transition-all",
                                        option.is_user_choice
                                            ? "bg-primary/20"
                                            : "bg-muted/50"
                                    )}
                                    style={{ width: `${option.percentage || 0}%` }}
                                />
                                {/* Content */}
                                <div className="relative flex items-center justify-between p-3">
                                    <div className="flex items-center gap-2">
                                        {option.is_user_choice && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
                                        <span className={cn(
                                            "text-sm",
                                            option.is_user_choice && "font-semibold"
                                        )}>
                                            {option.option_text}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        {option.percentage?.toFixed(1) || 0}%
                                    </span>
                                </div>
                            </div>
                        ) : (
                            // Voting view
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-4 h-4 rounded-full border-2 flex-shrink-0",
                                    selectedOption === option.id
                                        ? "border-primary bg-primary"
                                        : "border-muted-foreground"
                                )}>
                                    {selectedOption === option.id && (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm">{option.option_text}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Vote button (only show if not voted) */}
            {!showResults && (
                <Button
                    onClick={handleVote}
                    disabled={!selectedOption || isVoting}
                    className="w-full mt-3"
                    variant="outline"
                >
                    {isVoting ? 'Voting...' : 'Vote'}
                </Button>
            )}

            {/* Poll footer */}
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    <span>{poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}</span>
                </div>
                {timeRemaining && (
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{timeRemaining}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
