'use client'

import React, { useState, useContext, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Eye, EyeOff, Star, Settings, RefreshCw } from "lucide-react"
import { AuthContext } from "@/context/authcontext"
import toast from "react-hot-toast"
import Image from 'next/image'
import { UserBadgeManagement, BadgeType, BadgeSource, BadgeManagementProps } from '@/types'

export default function BadgeManagement({ userId, onUpdate }: BadgeManagementProps) {
  const { authToken } = useContext(AuthContext)
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
  
  const [allBadges, setAllBadges] = useState<UserBadgeManagement[]>([])
  const [displayedBadges, setDisplayedBadges] = useState<UserBadgeManagement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchUserBadges = useCallback(async (showToast = false) => {
    if (!userId || !authToken) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`${apiEndpoint}/badges/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched badges:', data) // Debug log
        setAllBadges(data.all_badges || [])
        setDisplayedBadges(data.displayed_badges || [])
        if (showToast) {
          toast.success('Badges refreshed')
        }
      } else {
        const error = await response.json().catch(() => ({}))
        console.error('Failed to load badges:', error)
        toast.error('Failed to load badges')
      }
    } catch (error) {
      console.error('Error fetching user badges:', error)
      toast.error('Failed to load badges')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [userId, authToken, apiEndpoint])

  // Refresh badges function for manual refresh
  const refreshBadges = async () => {
    setIsRefreshing(true)
    await fetchUserBadges(true)
  }

  useEffect(() => {
    if (userId && authToken) {
      fetchUserBadges()
    }
  }, [userId, authToken, fetchUserBadges])

  const toggleBadgeDisplay = (badgeId: number) => {
    const badge = allBadges.find(b => b.id === badgeId)
    if (!badge) return

    if (badge.is_displayed) {
      // Remove from displayed
      setDisplayedBadges(prev => prev.filter(b => b.id !== badgeId))
      setAllBadges(prev => prev.map(b => 
        b.id === badgeId ? { ...b, is_displayed: false } : b
      ))
    } else {
      // Add to displayed (max 3)
      if (displayedBadges.length >= 3) {
        toast.error('You can only display up to 3 badges at once')
        return
      }
      
      const updatedBadge = { ...badge, is_displayed: true }
      setDisplayedBadges(prev => [...prev, updatedBadge])
      setAllBadges(prev => prev.map(b => 
        b.id === badgeId ? updatedBadge : b
      ))
    }
  }

  const moveBadgeUp = (badgeId: number) => {
    const currentIndex = displayedBadges.findIndex(b => b.id === badgeId)
    if (currentIndex <= 0) return

    const newDisplayedBadges = [...displayedBadges]
    const [badge] = newDisplayedBadges.splice(currentIndex, 1)
    newDisplayedBadges.splice(currentIndex - 1, 0, badge)
    
    setDisplayedBadges(newDisplayedBadges)
  }

  const moveBadgeDown = (badgeId: number) => {
    const currentIndex = displayedBadges.findIndex(b => b.id === badgeId)
    if (currentIndex >= displayedBadges.length - 1) return

    const newDisplayedBadges = [...displayedBadges]
    const [badge] = newDisplayedBadges.splice(currentIndex, 1)
    newDisplayedBadges.splice(currentIndex + 1, 0, badge)
    
    setDisplayedBadges(newDisplayedBadges)
  }

  const saveBadgeSettings = async () => {
    setIsSaving(true)
    try {
      const displayedBadgeIds = displayedBadges.map(b => b.id)
      
      const response = await fetch(`${apiEndpoint}/badges/manage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayed_badge_ids: displayedBadgeIds
        })
      })

      if (response.ok) {
        toast.success('Badge settings updated!')
        if (onUpdate) {
          onUpdate()
        }
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update badge settings')
      }
    } catch (error) {
      console.error('Error saving badge settings:', error)
      toast.error('Failed to update badge settings')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Helper to get badge type label
  const getBadgeTypeLabel = (type?: BadgeType) => {
    switch (type) {
      case 'uni': return 'University'
      case 'free': return 'Free'
      case 'commercial': return 'Premium'
      default: return 'Badge'
    }
  }

  // Helper to get source label  
  const getSourceLabel = (source?: BadgeSource) => {
    switch (source) {
      case 'auto_award': return 'Auto-awarded'
      case 'purchase': return 'Purchased'
      case 'admin_grant': return 'Granted'
      case 'promotion': return 'Promotional'
      default: return ''
    }
  }

  if (allBadges.length === 0 && !isLoading) {
    return null // Don't show if user has no badges
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Manage Badges ({allBadges.length})</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                refreshBadges()
              }}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading badges...
            </div>
          ) : (
            <>
              {/* Currently Displayed Badges */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Currently Displayed ({displayedBadges.length}/3)</h4>
                  <Button 
                    onClick={saveBadgeSettings}
                    disabled={isSaving}
                    size="sm"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
                
                {displayedBadges.length > 0 ? (
                  <div className="space-y-2">
                    {displayedBadges.map((badge, index) => (
                      <Card key={badge.id} className="border-purple-200 bg-purple-50">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8">
                              <Image
                                src={badge.image_url}
                                alt={badge.name}
                                fill
                                className="object-contain"
                                unoptimized={badge.is_animated}
                              />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{badge.name}</span>
                                {badge.is_animated && (
                                  <Badge variant="secondary" className="text-xs">
                                    Animated
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Position {index + 1}
                              </div>
                            </div>
                            
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveBadgeUp(badge.id)}
                                disabled={index === 0}
                                className="h-8 w-8 p-0"
                              >
                                ↑
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveBadgeDown(badge.id)}
                                disabled={index === displayedBadges.length - 1}
                                className="h-8 w-8 p-0"
                              >
                                ↓
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleBadgeDisplay(badge.id)}
                                className="h-8 w-8 p-0"
                              >
                                <EyeOff className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No badges currently displayed</p>
                    <p className="text-xs">Select badges below to display them</p>
                  </div>
                )}
              </div>

              {/* All Badges */}
              <div className="space-y-3">
                <h4 className="font-medium">All Your Badges</h4>
                <div className="grid gap-2">
                  {allBadges.map((badge) => (
                    <Card key={badge.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8">
                            <Image
                              src={badge.image_url}
                              alt={badge.name}
                              fill
                              className="object-contain"
                              unoptimized={badge.is_animated}
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{badge.name}</span>
                              {badge.is_animated && (
                                <Badge variant="secondary" className="text-xs">
                                  Animated
                                </Badge>
                              )}
                              {badge.is_displayed && (
                                <Badge variant="default" className="text-xs">
                                  Displayed
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Purchased {formatDate(badge.purchased_at)}
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBadgeDisplay(badge.id)}
                            disabled={!badge.is_displayed && displayedBadges.length >= 3}
                            className="h-8 w-8 p-0"
                          >
                            {badge.is_displayed ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
