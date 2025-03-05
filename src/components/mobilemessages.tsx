"use client"
import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Smile, Send, MoreVertical, ImageIcon, Check, CheckCheck } from 'lucide-react'
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

type Message = {
  id: number
  sender: string
  content: string
  timestamp: Date
  avatar: string
  reactions: string[]
  replyTo?: number
  isSent: boolean
  isRead: boolean
  effect?: JSX.Element
}

const createKeywordEffect = (emoji: string): JSX.Element => (
  <motion.div
    className="absolute pointer-events-none"
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.5 }}
    transition={{ duration: 1.5 }}
  >
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute text-3xl"
        initial={{ 
          x: 0,
          y: 0,
          rotate: 0
        }}
        animate={{ 
          x: (Math.random() - 0.5) * 100,
          y: -100 - Math.random() * 100,
          rotate: (Math.random() - 0.5) * 180,
          opacity: [1, 0],
          scale: [1, 0.2],
        }}
        transition={{ 
          duration: 2 + Math.random() * 1.5,
          ease: "easeOut",
        }}
      >
        {emoji}
      </motion.div>
    ))}
  </motion.div>
)

const keywordEffects: { [key: string]: JSX.Element } ={
  "i love you": createKeywordEffect("❤️"),
  "congratulations": createKeywordEffect("🎉"),
  "happy birthday": createKeywordEffect("🎂"),
  "wow": createKeywordEffect("✨"),
  "haha": createKeywordEffect("😂"),
  "good luck": createKeywordEffect("🍀"),
  "thank you": createKeywordEffect("🙏"),
  "you're welcome": createKeywordEffect("😊"),
  "good morning": createKeywordEffect("☀️"),
  "good night": createKeywordEffect("🌙"),
  "take care": createKeywordEffect("💖"),
  "get well soon": createKeywordEffect("🩹"),
  "so sorry": createKeywordEffect("😔"),
  "good job": createKeywordEffect("👍"),
  "well done": createKeywordEffect("👏"),
  "amazing": createKeywordEffect("🤩"),
  "fantastic": createKeywordEffect("💯"),
  "great": createKeywordEffect("👍"), // Reusing 👍 for similar meaning
  "awesome": createKeywordEffect("🔥"),
  "best wishes": createKeywordEffect("🌟"),
  "miss you": createKeywordEffect("🥺"),
  "welcome": createKeywordEffect("👋"),
  "hello": createKeywordEffect("👋"), // Reusing 👋 for similar meaning
  "hi": createKeywordEffect("👋"),   // Reusing 👋 for similar meaning
  "goodbye": createKeywordEffect("👋"), // Reusing 👋 for similar meaning
  "bye": createKeywordEffect("👋"),    // Reusing 👋 for similar meaning
  "cheers": createKeywordEffect("🍻"),
  "happy holidays": createKeywordEffect("🎄"),
  "merry christmas": createKeywordEffect("🎅"),
  "happy new year": createKeywordEffect("🎆"),
  "happy easter": createKeywordEffect("🐰"),
  "happy halloween": createKeywordEffect("🎃"),
  "happy thanksgiving": createKeywordEffect("🦃"),
    "lets go": createKeywordEffect("🚀"),
    "no problem": createKeywordEffect("😄"),
    "np": createKeywordEffect("😄"),
    "perfect": createKeywordEffect("✅"),
    "yes": createKeywordEffect("✅"),
    "congrats": createKeywordEffect("🎉"), //short version
    "happy bday": createKeywordEffect("🎂"), //short version
    "kisses": createKeywordEffect("😘"),
};

const vibrate = () => {
  if (navigator.vibrate) {
    navigator.vibrate([15, 10, 15]);
  }
};

export default function IMessageWeb() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "Alice", content: "Hey there! How's it going?", timestamp: new Date(2023, 5, 10, 10, 30), avatar: "/placeholder.svg?height=40&width=40", reactions: [], isSent: false, isRead: true },
    { id: 2, sender: "You", content: "Not bad, just working on a new project. You?", timestamp: new Date(2023, 5, 10, 10, 32), avatar: "/placeholder.svg?height=40&width=40", reactions: [], isSent: true, isRead: true },
    { id: 3, sender: "Alice", content: "That's cool! I'm just relaxing at home.", timestamp: new Date(2023, 5, 10, 10, 35), avatar: "/placeholder.svg?height=40&width=40", reactions: [], isSent: false, isRead: true },
  ])
  const [input, setInput] = useState("")
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isInputVisible, setIsInputVisible] = useState(true)
  const [lastScrollTop, setLastScrollTop] = useState(0)
  const [isScrollingDown, setIsScrollingDown] = useState(false)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (input.trim()) {
      vibrate();
      const newMessage: Message = {
        id: messages.length + 1,
        sender: "You",
        content: input,
        timestamp: new Date(),
        avatar: "/placeholder.svg?height=40&width=40",
        reactions: [],
        replyTo: replyingTo,
        isSent: true,
        isRead: false,
      }

      const lowercaseInput = input.toLowerCase()
      Object.entries(keywordEffects).forEach(([keyword, effectElement]) => {
        if (lowercaseInput.includes(keyword)) {
          newMessage.effect = effectElement
          vibrate();
        }
      })

      setMessages([...messages, newMessage])
      setInput("")
      setReplyingTo(null)

      // Simulate typing indicator
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        vibrate();
        const receivedMessage: Message = {
          id: messages.length + 2,
          sender: "Alice",
          content: "That's great to hear!",
          timestamp: new Date(),
          avatar: "/placeholder.svg?height=40&width=40",
          reactions: [],
          isSent: false,
          isRead: false,
        }
        setMessages(prevMessages => [...prevMessages, receivedMessage])
        
        setTimeout(() => {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.isSent && !msg.isRead ? { ...msg, isRead: true } : msg
            )
          )
        }, 1500)
      }, 3000)
    }
  }

  const handleReaction = (messageId: number, reaction: string) => {
    vibrate();
    setMessages(messages.map(msg =>
      msg.id === messageId
        ? { ...msg, reactions: [...msg.reactions, reaction] }
        : msg
    ))
  }

  const touchStartY = useRef(0)
  const scrolling = useRef(false)
  const scrollThreshold = 15 // Minimum scroll distance to trigger hide/show

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (scrollAreaRef.current) {
      const touchY = e.touches[0].clientY
      const deltaY = touchStartY.current - touchY
      const currentScrollTop = scrollAreaRef.current.scrollTop

      if (Math.abs(deltaY) > 5) {
        scrolling.current = true
        scrollAreaRef.current.scrollTop += deltaY
        
        // Detect scroll direction and manage input visibility
        if (currentScrollTop > lastScrollTop + scrollThreshold) {
          // Scrolling down
          if (!isScrollingDown) {
            setIsScrollingDown(true)
            setIsInputVisible(false)
          }
        } else if (currentScrollTop < lastScrollTop - scrollThreshold) {
          // Scrolling up
          if (isScrollingDown) {
            setIsScrollingDown(false)
            setIsInputVisible(true)
          }
        }
        
        setLastScrollTop(currentScrollTop)
        touchStartY.current = touchY
      }
    }
  }

  const handleTouchEnd = () => {
    if (scrolling.current) {
      scrolling.current = false
    }
  }

  // Add scroll event listener for mouse wheel scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (scrollAreaRef.current) {
        const currentScrollTop = scrollAreaRef.current.scrollTop
        
        if (currentScrollTop > lastScrollTop + scrollThreshold) {
          // Scrolling down
          if (!isScrollingDown) {
            setIsScrollingDown(true)
            setIsInputVisible(false)
          }
        } else if (currentScrollTop < lastScrollTop - scrollThreshold) {
          // Scrolling up
          if (isScrollingDown) {
            setIsScrollingDown(false)
            setIsInputVisible(true)
          }
        }
        
        setLastScrollTop(currentScrollTop)
      }
    }

    const scrollRef = scrollAreaRef.current
    if (scrollRef) {
      scrollRef.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (scrollRef) {
        scrollRef.removeEventListener('scroll', handleScroll)
      }
    }
  }, [lastScrollTop, isScrollingDown])


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 sm:p-4">
    <Card className="w-full h-full sm:h-[600px] md:h-[700px] lg:h-[800px] max-w-[100%] sm:max-w-[400px] mx-auto flex flex-col relative overflow-hidden">
      {/* Header - Fixed at top */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-slate-50/90 dark:bg-slate-800/90 py-3 px-4 flex items-center justify-between backdrop-blur-lg border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Alice" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Alice</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTyping ? "typing..." : "Online"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages Area - Scrollable */}
      <div 
        className="flex-grow overflow-y-auto overscroll-behavior-y-contain mt-16 mb-20 px-4"
        ref={scrollAreaRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: '-ms-autohiding-scrollbar'
        }}
      >
        <div className="py-4 max-w-[89%] mx-auto">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.8,
                type: "spring",
                bounce: 0.3
              }}
              className={`mb-6 ${message.isSent ? 'flex justify-end' : 'flex justify-start'}`}
            >
              <div 
                className={`relative max-w-[85%] ${
                  message.isSent 
                    ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm ml-8' 
                    : 'bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm mr-8'
                } p-3 px-4 shadow-sm group`}
              >
                {message.replyTo && (
                  <div className="text-xs mb-2 p-2 rounded bg-black/5 dark:bg-white/5">
                    Replying to: {messages.find(m => m.id === message.replyTo)?.content.substring(0, 20)}...
                  </div>
                )}
                <p className="leading-relaxed text-base">{message.content}</p>
                <div className="flex justify-between items-end mt-1 gap-2">
                  <div className="flex gap-1 flex-wrap">
                    {message.reactions.map((reaction, index) => (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        key={index}
                        className="text-xs bg-white/10 dark:bg-black/20 rounded-full px-1.5 py-0.5"
                      >
                        {reaction}
                      </motion.span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs opacity-70">
                      {format(message.timestamp, 'HH:mm')}
                    </span>
                    {message.isSent && (
                      message.isRead ? (
                        <CheckCheck className="h-3 w-3 text-blue-300" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {message.effect && (
                    <div className={`absolute ${message.isSent ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-1/2 -translate-y-1/2`}>
                      {message.effect}
                    </div>
                  )}
                </AnimatePresence>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => handleReaction(message.id, "👍")}>
                      👍 Like
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleReaction(message.id, "❤️")}>
                      ❤️ Love
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleReaction(message.id, "😂")}>
                      😂 Laugh
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-2 ml-4"
            >
              {[1, 2, 3].map((dot) => (
                <motion.div
                  key={dot}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: dot * 0.2,
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 z-10 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-lg border-t p-4"
        initial={{ y: 0 }}
        animate={{ y: isInputVisible ? 0 : '100%' }}
        transition={{ duration: 0.3 }}
      >
        {replyingTo && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-sm text-slate-600 dark:text-slate-300 mb-3 flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg"
          >
            <span className="truncate">Replying to: {messages.find(m => m.id === replyingTo)?.content.substring(0, 20)}...</span>
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
          </motion.div>
        )}
        <div className="flex gap-2 items-center bg-white dark:bg-slate-800 rounded-full p-1 pr-2 shadow-sm max-w-[95%] mx-auto">
          <Button variant="ghost" size="icon" className="rounded-full shrink-0">
            <Smile className="h-5 w-5" />
          </Button>
          <Input
            placeholder="iMessage"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-grow border-0 focus:ring-0 bg-transparent text-base"
          />
          <Button variant="ghost" size="icon" className="rounded-full shrink-0">
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button 
            onClick={handleSend} 
            size="icon" 
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>
    </Card>
  </div>
  )
}