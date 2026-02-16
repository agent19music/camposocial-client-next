"use client"

import React from 'react'
import { useContext, useEffect, useState } from 'react'
import { YapContext } from '@/context/yapcontext'
import { AuthContext } from '@/context/authcontext'
import { MainYap } from '@/components/singleyap/mainyap'
import { ReplyInput } from '@/components/singleyap/replyinput'
import { ReplyList } from '@/components/singleyap/replylist'
import Header from '@/components/header'
import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import WhoToFollow from '@/components/whotofollow'
import TrendingHashtags from '@/components/trending-hashtags'
import { SingleYapClientProps, Reply } from '@/types'

export default function SingleYapClient({ initialYap, slug }: SingleYapClientProps) {
  const { selectedYap, addReply, yapReplies, setYapReplies, fetchYapById } = useContext(YapContext)
  const { currentUser, isAuthenticated } = useContext(AuthContext)
  const router = useRouter()
  const [isLoadingYap, setIsLoadingYap] = useState(false)

  // Extract yap ID from slug (remove the nanoid part)
  const extractYapIdFromSlug = (slug: string): string => {
    if (typeof slug !== 'string') return '';
    // The slug format is: yapId-nanoid
    // Find the last hyphen and take everything before it
    const lastHyphenIndex = slug.lastIndexOf('-');
    if (lastHyphenIndex === -1) return slug;
    return slug.substring(0, lastHyphenIndex);
  }

  // Track the current yap ID to detect changes
  const [currentYapId, setCurrentYapId] = useState<string | null>(null)

  // Effect to fetch yap when slug changes - always fetch fresh data
  useEffect(() => {
    if (!slug) return;

    const yapId = extractYapIdFromSlug(slug);

    // Always fetch if the yap ID changed or we don't have replies
    if (yapId !== currentYapId) {
      setCurrentYapId(yapId);
      setIsLoadingYap(true);
      // Clear old data immediately
      setYapReplies([]);

      fetchYapById(yapId, slug).finally(() => {
        setIsLoadingYap(false);
      });
    }
  }, [slug, currentYapId, fetchYapById, setYapReplies])

  const handleNewReply = async (content: string) => {
    if (!selectedYap || !currentUser) return;

    try {
      await addReply(selectedYap.id, content);
      // The context will handle optimistic updates
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  }

  const handleBack = () => {
    router.back();
  }

  if (isLoadingYap) {
    return (
      <div className="w-screen h-screen lg:container mx-auto p-4">
        <Header />
        <main className="mobile-content-padding lg:pb-4">
          <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-6rem)]">
            <div className="flex-1 flex flex-col min-w-0 lg:border-x lg:border-dashed lg:border-border/[0.12]">
              <div className="w-full max-w-2xl mx-auto">
                <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-dashed border-border/[0.12] p-4 z-10 flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={handleBack} className="hover:bg-muted/50 rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <h1 className="text-xl font-bold">Yap</h1>
                </div>
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block lg:w-80 flex-shrink-0 lg:pl-5">
              <div className="sticky top-4 space-y-0">
                <div className="pb-4 border-b border-dashed border-border/[0.12]"><TrendingHashtags /></div>
                <div className="pt-4"><WhoToFollow /></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!selectedYap && !initialYap) {
    return (
      <div className="w-screen h-screen lg:container mx-auto p-4">
        <Header />
        <main className="mobile-content-padding lg:pb-4">
          <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-6rem)]">
            <div className="flex-1 flex flex-col min-w-0 lg:border-x lg:border-dashed lg:border-border/[0.12]">
              <div className="w-full max-w-2xl mx-auto">
                <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-dashed border-border/[0.12] p-4 z-10 flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={handleBack} className="hover:bg-muted/50 rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <h1 className="text-xl font-bold">Yap</h1>
                </div>
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">Yap not found</p>
                    <button onClick={() => router.back()} className="text-primary hover:underline">Go back</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block lg:w-80 flex-shrink-0 lg:pl-5">
              <div className="sticky top-4 space-y-0">
                <div className="pb-4 border-b border-dashed border-border/[0.12]"><TrendingHashtags /></div>
                <div className="pt-4"><WhoToFollow /></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen lg:container mx-auto p-4">
      <Header />
      <main className="mobile-content-padding lg:pb-4">
        <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-6rem)]">
          {/* Main Content - center column with dashed vertical borders */}
          <div className="flex-1 flex flex-col min-w-0 lg:border-x lg:border-dashed lg:border-border/[0.12]">
              <div className="w-full max-w-2xl mx-auto">
                {/* Header with back button - dashed bottom divider */}
                <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-dashed border-border/[0.12] p-4 z-10 flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="hover:bg-muted/50 rounded-full"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <h1 className="text-xl font-bold">Yap</h1>
                </div>

                {/* Main Yap Content */}
                <div className="border-b border-dashed border-border/[0.12]">
                  <MainYap />
                </div>

                {/* Reply Input */}
                {isAuthenticated && (
                  <div className="px-4 border-b border-dashed border-border/[0.12] py-2">
                    <ReplyInput onReply={handleNewReply} />
                  </div>
                )}

                {/* Replies Section */}
                <div className="pb-4">
                  {yapReplies.length > 0 ? (
                    <>
                      <div className="px-4 py-2 border-b border-dashed border-border/[0.12]">
                        <span className="text-sm font-medium text-muted-foreground">
                          {yapReplies.filter(r => !r.parent_reply_id).length} {yapReplies.filter(r => !r.parent_reply_id).length === 1 ? 'Reply' : 'Replies'}
                        </span>
                      </div>
                      <ReplyList replies={yapReplies.filter((r): r is Reply & { user: NonNullable<Reply['user']> } => r.user !== undefined && !r.parent_reply_id)} />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
                    </div>
                  )}
                </div>
              </div>
          </div>

          {/* Right sidebar - with dashed dividers between sections */}
          {isAuthenticated && (
            <div className="hidden lg:block lg:w-80 flex-shrink-0 lg:pl-5">
              <div className="sticky top-4 space-y-0">
                <div className="pb-4 border-b border-dashed border-border/[0.12]">
                  <TrendingHashtags />
                </div>
                <div className="pt-4">
                  <WhoToFollow />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
