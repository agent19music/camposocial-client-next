"use client"
import React from 'react';
import { useState, useEffect, useRef, useContext } from "react"
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
import { 
  Smile, 
  Send, 
  MoreVertical, 
  ImageIcon, 
  Check, 
  CheckCheck,
  Search,
  VideoIcon,
  Phone,
  Image as ImageIcon2,
  Video as VideoIcon2,
} from 'lucide-react'
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { ChatContext } from '@/context/chatcontext';

// Remove local Message type since we're using the one from ChatContext
  
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

const IMessageDesktop = () => {
  // ... [Previous state definitions remain the same]
  const { 
    sendMessage, 
    getMessages, 
    addReaction, 
    friendId, 
    setFriendId, 
    messages, 
    setMessages,
    chatList = []
} = useContext(ChatContext);
  
    const [input, setInput] = useState("")
    const [replyingTo, setReplyingTo] = useState<number | null>(null)
    const [selectedMedia, setSelectedMedia] = useState<FileList | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const [isTyping, setIsTyping] = useState(false)
    const [batch, setBatch] = useState(1);

    const simulateReceivedMessage = () => {
      setIsTyping(true);
      setTimeout(() => {
          setIsTyping(false);
          const receivedMessage = {
              id: messages.length + 2,
              senderId: "Alice", // Replace with actual sender ID
              content: "That's great to hear!",
              timestamp: new Date(),
              media: null,
              reactions:[],
              isSent: false,
              isRead: false,
              encrypted: false,
          };
          setMessages(prevMessages => [...prevMessages, receivedMessage]);
      }, 3000);
  };

  const handleSend = async () => {
    if (input.trim() || selectedMedia) {
        await sendMessage(input, selectedMedia, replyingTo ?? undefined);
        setInput("");
        setReplyingTo(null);
        setSelectedMedia(null);
        simulateReceivedMessage(); // Simulate receiving a message
    }
};

const handleReaction = (messageId: number, reactionType: string) => {
  addReaction(messageId, reactionType);
};

const handleMediaInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files) {
      setSelectedMedia(event.target.files);
  }
};

const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
  const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
  if (scrollTop === 0) {
      // Reached the top, load more messages
      setBatch(prevBatch => prevBatch + 1);
      const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : undefined;
      getMessages(friendId!, 10 * batch, lastMessageId); // Fetch next batch
  }
};
  
    useEffect(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
      }
    }, [messages])
  
    // const handleSend = () => {
    //   if (input.trim()) {
    //     vibrate();
    //     const newMessage: Message = {
    //       id: messages.length + 1,
    //       sender: "You",
    //       content: input,
    //       timestamp: new Date(),
    //       avatar: "/placeholder.svg?height=40&width=40",
    //       reactions: [],
    //       replyTo: replyingTo,
    //       isSent: true,
    //       isRead: false,
    //     }
  
    //     const lowercaseInput = input.toLowerCase()
    //     Object.entries(keywordEffects).forEach(([keyword, effectElement]) => {
    //       if (lowercaseInput.includes(keyword)) {
    //         newMessage.effect = effectElement
    //         vibrate();
    //       }
    //     })
  
    //     setMessages([...messages, newMessage])
    //     setInput("")
    //     setReplyingTo(null)
  
    //     // Simulate typing indicator
    //     setIsTyping(true)
    //     setTimeout(() => {
    //       setIsTyping(false)
    //       vibrate();
    //       const receivedMessage: Message = {
    //         id: messages.length + 2,
    //         sender: "Alice",
    //         content: "That's great to hear!",
    //         timestamp: new Date(),
    //         avatar: "/placeholder.svg?height=40&width=40",
    //         reactions: [],
    //         isSent: false,
    //         isRead: false,
    //       }
    //       setMessages(prevMessages => [...prevMessages, receivedMessage])
          
    //       setTimeout(() => {
    //         setMessages(prevMessages => 
    //           prevMessages.map(msg => 
    //             msg.isSent && !msg.isRead ? { ...msg, isRead: true } : msg
    //           )
    //         )
    //       }, 1500)
    //     }, 3000)
    //   }
    // }
  
    // const handleReaction = (messageId: number, reaction: string) => {
    //   vibrate();
    //   setMessages(messages.map(msg =>
    //     msg.id === messageId
    //       ? { ...msg, reactions: [...msg.reactions, reaction] }
    //       : msg
    //   ))
    // }
  
    const touchStartY = useRef(0)
    const scrolling = useRef(false)
  
    const handleTouchStart = (e: React.TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }
  
    const handleTouchMove = (e: React.TouchEvent) => {
      if (scrollAreaRef.current) {
        const touchY = e.touches[0].clientY
        const deltaY = touchStartY.current - touchY
  
        if (Math.abs(deltaY) > 5) {
          scrolling.current = true
          scrollAreaRef.current.scrollTop += deltaY
          touchStartY.current = touchY
        }
      }
    }
  
    const handleTouchEnd = () => {
      if (scrolling.current) {
        scrolling.current = false
      }
    }
  
  

  return (
    <div className="fixed inset-0 flex items-stretch bg-slate-100 dark:bg-slate-900">
      {/* Sidebar */}
      <div className="hidden lg:flex flex-col w-80 border-r border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-lg">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input 
              placeholder="Search messages" 
              className="pl-10 bg-slate-100 dark:bg-slate-700 border-none"
            />
          </div>
        </div>
        <ScrollArea className="flex-grow">
          {/* Chat list would go here */}
          <div className="p-2">
          {chatList.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                                onClick={() => setFriendId(user.id.toString())}
                            >
                                <Avatar>
                                    {/* Use user details from chatList */}
                                    <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${user.firstName}`} /> 
                                    <AvatarFallback>{user.firstName}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow min-w-0">
                                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                        {user.firstName} {user.lastName}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                        Latest message preview...
                                    </p>
                                </div>
                                <span className="text-xs text-slate-400">
                                    {format(new Date(), 'HH:mm')}
                                </span>
                            </div>
                        ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-slate-50/90 dark:bg-slate-800/90 py-4 px-6 flex items-center justify-between backdrop-blur-lg border-b">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Alice" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Alice</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isTyping ? "typing..." : "Online"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300">
              <VideoIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-grow px-6" ref={scrollAreaRef}>
      <div className="py-6 max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center items-center h-full"
          >
            <p className="text-lg text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
          </motion.div>
        ) : (
          messages?.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.8,
                type: "spring",
                bounce: 0.3,
              }}
              className={`mb-6 ${message.isSent ? "flex justify-end" : "flex justify-start items-end gap-2"}`}
            >
              {!message.isSent && (
                <Avatar className="h-6 w-6 hidden sm:block">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt={message.senderId} />
                  <AvatarFallback>{message.senderId[0]}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`relative max-w-[60%] ${
                  message.isSent
                    ? "bg-blue-500 text-white rounded-2xl rounded-tr-sm"
                    : "bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm"
                } p-3 px-4 shadow-sm group`}
              >
                {message.replyTo && (
                  <div className="text-xs mb-2 p-2 rounded bg-black/5 dark:bg-white/5">
                    Replying to: {messages.find((m) => m.id === message.replyTo)?.content}
                  </div>
                )}
                {message.media &&
                  message.media.map((mediaItem, index) => (
                    <div key={index} className="mt-2">
                      {mediaItem.type === "image" && (
                        <img
                          src={mediaItem.url || "/placeholder.svg"}
                          alt={`Attachment ${index}`}
                          className="max-w-full h-auto rounded-lg"
                        />
                      )}
                      {mediaItem.type === "video" && (
                        <video src={mediaItem.url} controls className="max-w-full h-auto rounded-lg" />
                      )}
                    </div>
                  ))}
                <p className="leading-relaxed text-base">{message.content}</p>
                <div className="flex justify-between items-end mt-1 gap-2">
                  <div className="flex gap-1 flex-wrap">
                    {message.reactions?.map((reaction, index) => (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        key={index}
                        className="text-xs bg-white/10 dark:bg-black/20 rounded-full px-1.5 py-0.5"
                      >
                        {typeof reaction === 'string' ? reaction : reaction.reactionType}
                      </motion.span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs opacity-70">{format(message.timestamp, "HH:mm")}</span>
                    {message.isSent &&
                      (message.isRead ? (
                        <CheckCheck className="h-3 w-3 text-blue-300" />
                      ) : (
                        <Check className="h-3 w-3" />
                      ))}
                  </div>
                </div>
                {/* Effect animation removed as it's not part of the ChatContext Message type */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => handleReaction(message.id, "👍")}>👍 Like</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleReaction(message.id, "❤️")}>❤️ Love</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleReaction(message.id, "😂")}>😂 Laugh</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))
        )}
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
                  repeat: Number.POSITIVE_INFINITY,
                  delay: dot * 0.2,
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </ScrollArea>

        {/* Input Area */}
        <div className="bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-lg border-t p-6">
          {replyingTo && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-sm text-slate-600 dark:text-slate-300 mb-3 flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg max-w-4xl mx-auto"
            >
              <span className="truncate">Replying to: {messages.find(m => m.id === replyingTo)?.content}</span>
              <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
            </motion.div>
          )}
          <div className="flex gap-3 items-center bg-white dark:bg-slate-800 rounded-full p-2 pr-3 shadow-sm max-w-4xl mx-auto">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Smile className="h-5 w-5" />
            </Button>
            <Input
              placeholder="iMessage"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-grow border-0 focus:ring-0 bg-transparent text-base"
            />

<input
                            type="file"
                            id="imageInput"
                            accept="image/*, video/*"
                            multiple
                            className="hidden"
                            onChange={handleMediaInputChange}
                        />
                        <label htmlFor="imageInput">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ImageIcon2 className="h-5 w-5" />
                            </Button>
                        </label>

                        {/* Add Video Input - You can customize the icon as needed */}
                        <input
                            type="file"
                            id="videoInput"
                            accept="video/*"
                            className="hidden"
                            onChange={handleMediaInputChange}
                        />
                        <label htmlFor="videoInput">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <VideoIcon2 className="h-5 w-5" />
                            </Button>
                        </label>

            <Button variant="ghost" size="icon" className="rounded-full">
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Button 
              onClick={handleSend} 
              size="icon" 
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IMessageDesktop;