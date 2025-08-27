import React, { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, Repeat, Bookmark, MoreHorizontal } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"
import { useContext } from 'react'
import { YapContext } from '@/context/yapcontext'

const Tweet = ({ author, content, timestamp }: { author: string, content: string, timestamp: string }) => (
  <Card className="mb-4">
    <CardHeader className="flex flex-row items-center gap-4">
      <Avatar>
        <AvatarImage src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${author}`} />
        <AvatarFallback>{author[0]}</AvatarFallback>
      </Avatar>
      <div>
        <h2 className="text-lg font-semibold">{author}</h2>
        <p className="text-sm text-muted-foreground">{timestamp}</p>
      </div>
    </CardHeader>
    <CardContent>
      <p>{content}</p>
    </CardContent>
    <CardFooter className="flex justify-between">
      <Button variant="ghost" size="sm">
        <MessageCircle className="w-4 h-4 mr-2" />
        Reply
      </Button>
      <Button variant="ghost" size="sm">
        <Repeat className="w-4 h-4 mr-2" />
        Retweet
      </Button>
      <Button variant="ghost" size="sm">
        <Heart className="w-4 h-4 mr-2" />
        Like
      </Button>
      <Button variant="ghost" size="sm">
        <Bookmark className="w-4 h-4 mr-2" />
        Bookmark
      </Button>
    </CardFooter>
  </Card>
)

const Reply = ({ author, content, timestamp }: { author: string, content: string, timestamp: string }) => {
  const [isAlertOpen, setIsAlertOpen] = React.useState(false)
  const [alertContent, setAlertContent] = React.useState({ title: '', description: '' })

  const handleAlert = (title: string, description: string) => {
    setAlertContent({ title, description })
    setIsAlertOpen(true)
  }

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${author}`} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-semibold">{author}</h3>
            <p className="text-xs text-muted-foreground">{timestamp}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => handleAlert('Mute Account', 'Are you sure you want to mute this account?')}>
              Mute this account
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleAlert('Report Tweet', 'Are you sure you want to report this tweet?')}>
              Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p>{content}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" size="sm">
          <MessageCircle className="w-4 h-4 mr-2" />
          Reply
        </Button>
        <Button variant="ghost" size="sm">
          <Repeat className="w-4 h-4 mr-2" />
          Retweet
        </Button>
        <Button variant="ghost" size="sm">
          <Heart className="w-4 h-4 mr-2" />
          Like
        </Button>
        <Button variant="ghost" size="sm">
          <Bookmark className="w-4 h-4 mr-2" />
          Bookmark
        </Button>
      </CardFooter>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
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
    </Card>
  )
}

const ReplyInput = ({ onReply }: { onReply: (content: string) => void }) => {
  const [replyText, setReplyText] = useState('')

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(replyText)
      setReplyText('')
    }
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src="https://api.dicebear.com/6.x/avataaars/svg?seed=CurrentUser" />
            <AvatarFallback>CU</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <Textarea
              placeholder="Tweet your reply"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0"
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-muted-foreground">
                {replyText.length}/280
              </div>
              <Button onClick={handleReply} disabled={!replyText.trim()}>
                Reply
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Component() {
    const {selectedYap} = useContext(YapContext)
  const [replies, setReplies] = useState(selectedYap?.replies || []) 

  const handleNewReply = (content: string) => {
    const newReply = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      user: {
        id: "temp-user-id",
        username: "Current User",
        display_name: "Current User",
        avatar: ""
      },
      content,
    }
    setReplies([newReply, ...replies])
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Tweet
        author={selectedYap?.display_name || ""}
        content={selectedYap?.content || ""}
        timestamp="2h ago"
      />
      <Separator className="my-4" />
      <h2 className="text-xl font-semibold mb-4">Replies</h2>
      <ReplyInput onReply={handleNewReply} />
      {replies.map((reply, index) => (
        <Reply
          key={index}
          author={reply.user.display_name}
          content={reply.content}
          timestamp={reply.created_at}
        />
      ))}
    </div>
  )
}