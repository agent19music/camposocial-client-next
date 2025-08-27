"use client"

import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { MessageCircle, Repeat2, Heart, Share2, MoreHorizontal } from "lucide-react"
import { cn } from '@/lib/utils'
 interface Reply {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar: string;
  };
}

export const ReplyComponent = ({ reply }: { reply: Reply }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [alertContent, setAlertContent] = useState({ title: '', description: '' })

  const handleAlert = (title: string, description: string) => {
    setAlertContent({ title, description })
    setIsAlertOpen(true)
  }

  return (
    <article className="px-4 py-3 hover:bg-accent/50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${reply.user.display_name}`} />
          <AvatarFallback>{reply.user.display_name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[15px]">
              <span className="font-bold">{reply.user.display_name}</span>
              <span className="text-muted-foreground">· {reply.created_at}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 dark:hover:bg-gray-700">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[280px] dark:bg-gray-800 dark:border-gray-700">
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 dark:hover:bg-gray-700"
                  onSelect={() =>
                    handleAlert(
                      "Block this account?",
                      "They will not be able to follow you or view your posts, and you will not see posts from this account."
                    )
                  }
                >
                  Block @{reply.user.display_name}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="dark:hover:bg-gray-700"
                  onSelect={() =>
                    handleAlert(
                      "Report post?",
                      "Help us understand what's happening with this post."
                    )
                  }
                >
                  Report post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-[15px] mt-1 break-words">{reply.content}</p>

          <div className="flex justify-between mt-3 max-w-md">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary group p-2 h-8 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <MessageCircle className="w-[18px] h-[18px] mr-2 group-hover:text-primary dark:group-hover:text-primary" />
              <span className="text-sm group-hover:text-primary dark:group-hover:text-primary">12</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-green-500 group p-2 h-8 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <Repeat2 className="w-[18px] h-[18px] mr-2 group-hover:text-green-500 dark:group-hover:text-green-500" />
              <span className="text-sm group-hover:text-green-500 dark:group-hover:text-green-500">4</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "group p-2 h-8",
                isLiked 
                  ? "text-red-500" 
                  : "text-muted-foreground hover:text-red-500 dark:text-gray-400 dark:hover:bg-gray-700"
              )}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart
                className={cn(
                  "w-[18px] h-[18px] mr-2",
                  isLiked ? "fill-current" : "group-hover:text-red-500 dark:group-hover:text-red-500"
                )}
              />
              <span className="text-sm group-hover:text-red-500 dark:group-hover:text-red-500">23</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary group p-2 h-8 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <Share2 className="w-[18px] h-[18px] mr-2 group-hover:text-primary dark:group-hover:text-primary" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>{alertContent.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertContent.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  )
}
