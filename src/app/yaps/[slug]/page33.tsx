"use client"
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
import Header from '@/components/header'
import SideNav from '@/components/sidenav'
import { Home,Calendar, PartyPopper, Repeat2, Share2 } from "lucide-react";
import Image from 'next/image'


const YapCard = ({ username, handle, content, avatar, images, videos }) => {
  const [isLiked, setIsLiked] = React.useState(false)
  

  const renderMediaGrid = () => {
    const mediaCount = (images?.length || 0) + (videos?.length || 0)
    if (mediaCount === 0) return null

    let gridClassName = "grid gap-2 mt-3"
    if (mediaCount === 1) gridClassName += " grid-cols-1"
    else if (mediaCount === 2) gridClassName += " grid-cols-2"
    else if (mediaCount === 3) gridClassName += " grid-cols-2"
    else gridClassName += " grid-cols-2"

    return (
      <div className={gridClassName}>
        {images?.map((image, index) => (
          <div key={`image-${index}`} className={`relative rounded-xl max-h-32 overflow-hidden ${mediaCount === 3 && index === 0 ? 'row-span-2' : ''}`}>
            <Image 
              src={image} 
              alt={`Yap media ${index + 1}`} 
              layout="responsive"
              width={200}
              height={mediaCount === 1 ? 280 : 100}
              objectFit="cover"
            />
          </div>
        ))}
        {videos?.map((video, index) => (
          <div key={`video-${index}`} className="relative rounded-xl overflow-hidden max-h-32">
            <video controls className="">
              <source src={video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className="mb-4 hover:bg-gray-50 transition-colors duration-200 hover:cursor-pointer" 
    >
      <CardHeader className="flex flex-row items-start space-y-0 pb-3">
        <Avatar className="w-10 h-10 mr-3">
          <AvatarImage src={avatar} alt={username} />
          <AvatarFallback>{username[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className="font-bold text-sm truncate">{username}</h3>
            <p className="text-sm text-muted-foreground truncate">@{handle}</p>
          </div>
          <p className="text-md mt-1 break-words">{content}</p>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        {renderMediaGrid()}
      </CardContent>

      <CardFooter className="flex justify-between py-2 px-4 border-t">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
          <MessageCircle className="w-4 h-4 mr-1" />
          <span className="text-xs">4.2K</span>
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500">
          <Repeat2 className="w-4 h-4 mr-1" />
          <span className="text-xs">3.1K</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`${isLiked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-xs">15.6K</span>
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
          <Share2 className="w-4 h-4 mr-1" />
          <span className="text-xs">Share</span>
        </Button>
      </CardFooter>
    </Card>
  )
}


const Reply = ({ author, content, timestamp }) => {
  const [isAlertOpen, setIsAlertOpen] = React.useState(false)
  const [alertContent, setAlertContent] = React.useState({ title: '', description: '' })

  const handleAlert = (title, description) => {
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

const ReplyInput = ({ onReply }) => {
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

export default function ViewYap() {
  const {selectedYap} = useContext(YapContext)

  console.log(selectedYap)
  
  const [replies, setReplies] = useState(selectedYap?.replies)

  const timeAgo = (reply) => {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;
  
    const elapsed = new Date() - new Date(reply.timestamp);
  
  
    if (elapsed < msPerMinute) {
      return Math.round(elapsed / 1000) + ' seconds ago';
    } else if (elapsed < msPerHour) {
      return Math.round(elapsed / msPerMinute) + ' minutes ago';
    } else if (elapsed < msPerDay) {
      return Math.round(elapsed / msPerHour) + ' hours ago';
    } else if (elapsed < msPerMonth)   
   {
      return Math.round(elapsed / msPerDay) + ' days ago';
    } else if (elapsed < msPerYear) {
      return Math.round(elapsed / msPerMonth) + ' months ago';
    } else {
      return Math.round(elapsed / msPerYear) + ' years ago';
    }
  };

  const handleNewReply = (content) => {
    const newReply = {
      author: "Current User",
      content,
      timestamp: "Just now"
    }
    setReplies([newReply, ...replies])
  }
  const eventLinks = [
    { href: "/comingsoon", label: "Coming Soon", icon: <Home className="h-4 w-4" /> },
    { href: "/social-events", label: "Social Events", icon: <Calendar className="h-4 w-4" /> },
    { href: "/fun-events", label: "Fun Events", icon: <PartyPopper className="h-4 w-4" /> },
  ];

  return (
    <div className="container mx-auto p-4">
    <Header/>
    <div className="flex  flex-col md:flex-row">
{/* Left SideNav */}
 <div className="md:w-64 flex-shrink-0">
          <SideNav links = {eventLinks} />
        </div>
    <div className='flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-2 justify-center items-center'>
  {selectedYap &&  <YapCard {...selectedYap}/>}
      <Separator className="my-4" />
      <h2 className="text-xl font-semibold mb-4">Replies</h2>
      <ReplyInput onReply={handleNewReply} />
      {replies && replies.map((reply, index) => (
        <Reply
          key={index}
          author={reply.author}
          content={reply.content}
          timestamp={timeAgo({ timestamp: reply.timestamp })}
        />
      ))}
    </div>
    </div>
    </div>
  )
}