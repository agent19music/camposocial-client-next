"use client"

import React, {useContext} from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AuthContext } from '@/context/authcontext'

export const ReplyInput = ({ onReply }) => {
  const [replyText, setReplyText] = React.useState('')
  const maxLength = 280
  const {currentUser} = useContext(AuthContext)
  console.log('====================================');
  console.log(currentUser);
  console.log('====================================');

  return (
    <>
    {
      currentUser &&   <div className="flex gap-3 py-3 dark:text-gray-100">

      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={`${currentUser?.avatar}`} />
        <AvatarFallback className="dark:bg-gray-700 dark:text-gray-200">{`${currentUser?.username[0]}`}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Textarea
          placeholder="Post your reply"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value.slice(0, maxLength))}
          className="min-h-[120px] resize-none border-none focus-visible:ring-0 p-2 text-[17px] dark:text-white dark:bg-foreground/10 dark:placeholder:text-gray-400 placeholder:text-muted-foreground"
        />
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-muted-foreground dark:text-gray-400">
            {replyText.length}/{maxLength}
          </div>
          <Button 
            onClick={() => {
              if (replyText.trim()) {
                onReply(replyText)
                setReplyText('')
              }
            }} 
            disabled={!replyText.trim()}
            className="rounded-full dark:hover:bg-primary/80"
          >
            Reply
          </Button>
        </div>
      </div>
    </div>
    }</>
  
  )
}