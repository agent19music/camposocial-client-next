"use client"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Heart, MessageCircle, MoreVertical, Repeat2, Share2 } from "lucide-react"
import SideNav from "@/components/sidenav"
import { Home,Calendar, PartyPopper } from "lucide-react";
import Header from "@/components/header"



export default function Component() {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  const handleBlock = () => {
    setIsBlocked(true)
    setIsFollowing(false)
    // Here you would typically call an API to block the account
    console.log("Blocked @johndoe")
  }

  const handleMute = () => {
    setIsMuted(true)
    // Here you would typically call an API to mute the account
    console.log("Muted @johndoe")
  }



  return (
    <div className="container flex-row ">
    <Header/>
    <div className="mx-auto py-8">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-center sm:flex-row sm:items-start">
            <Avatar className="w-32 h-32 mb-4 sm:mb-0 sm:mr-4">
              <AvatarImage src="/yoruichipfp.jpg?height=128&width=128" alt="@johndoe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">John Doe</h1>
              <p className="text-muted-foreground">@johndoe</p>
              <div className="flex gap-4 mt-2">
                <p><span className="font-bold">1,234</span> Following</p>
                <p><span className="font-bold">5,678</span> Followers</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleFollow} variant={isFollowing ? "outline" : "default"}>
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Block this account
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will block all tweets from this account and you won&apos;t be able to see their profile.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBlock}>Block Account</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Mute this account
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will mute all tweets from this account. You can unmute the account at any time.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleMute}>Mute Account</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Card>
      <Tabs defaultValue="tweets" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tweets">Tweets</TabsTrigger>
          <TabsTrigger value="replies">Replies</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
        </TabsList>
        <TabsContent value="tweets">
          <TweetList />
        </TabsContent>
        <TabsContent value="replies">
          <TweetList />
        </TabsContent>
        <TabsContent value="likes">
          <TweetList />
        </TabsContent>
      </Tabs>
    </div>
    </div>
  )
}

function TweetList() {
  return (
    <div className="space-y-4">
      <TweetCard
        name="John Doe"
        username="@johndoe"
        content="Just had an amazing day at the beach! 🏖️ #SummerVibes"
        timestamp="2h ago"
      />
      <TweetCard
        name="John Doe"
        username="@johndoe"
        content="Excited to announce my new project! Stay tuned for more details. 🚀 #NewBeginnings "
        timestamp="1d ago"
      />
      <TweetCard
        name="John Doe"
        username="@johndoe"
        content="Just finished reading an incredible book. Highly recommend 'The Alch+emist' by Paulo Coelho. 📚 #BookRecommendation lorem ipsum Tattoo order-flow footage grenade claymore mine refrigerator assault drone man ablative digital semiotics. Media table augmented reality savant neural man cyber-otaku receding saturation point geodesic singularity smart-car narrative bomb. Geodesic otaku augmented reality youtube denim 3D-printed rebar lights. Saturation point free-market range-rover into garage market drugs vehicle towards rifle alcohol industrial grade. Beef noodles otaku courier shanty town dome dead film papier-mache meta-artisanal faded. Cartel-space shrine urban DIY beef noodles media tube cyber-systemic. Film gang girl marketing sunglasses otaku nodality stimulate bicycle industrial grade shoes fetishism range-rover post-market. Decay rebar apophenia long-chain hydrocarbons network assassin cartel human disposable. Ablative math-advert pen post-tower A.I. into neural motion industrial grade hotdog j-pop camera. Shibuya market gang faded singularity network decay plastic hotdog systemic knife. Weathered saturation point digital carbon singularity physical soul-delay beef noodles vehicle j-pop assassin engine DIY Chiba. Vinyl uplink shoes lights Kowloon marketing faded shanty town refrigerator alcohol numinous. BASE jump human narrative A.I. concrete long-chain hydrocarbons pen engine ablative wristwatch nodality courier. Cyber-San Francisco voodoo god ablative artisanal construct-space assassin woman sub-orbital augmented reality camera DIY nano. Military-grade Legba garage range-rover city A.I. silent tiger-team receding tower pre-Shibuya futurity neon dolphin courier assault. Fluidity construct numinous garage marketing sign jeans human Kowloon military-grade computer realism.  "
        timestamp="3d ago"
      />
    </div>
  )
}

interface TweetCardProps {
  name: string;
  username: string;
  content: string;
  timestamp: string;
}

function TweetCard({ name, username, content, timestamp }: TweetCardProps) {
  const [isMuted, setIsMuted] = useState(false)

  const handleMute = () => {
    setIsMuted(true)
    // Here you would typically call an API to mute the account
    console.log(`Muted ${username}`)
  }

  const handleReport = () => {
    // Here you would typically call an API to report the tweet
    console.log(`Reported tweet from ${username}`)
  }

  const handleNotInterested = () => {
    // Here you would typically call an API to mark as not interested
    console.log(`Marked as not interested: ${username}`)
  }

  return (
    <Card className="">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt={username} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{username}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Mute this account
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mute all tweets from this account. You can unmute the account at any time.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleMute}>Mute Account</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <DropdownMenuItem onSelect={handleReport}>
                Report
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleNotInterested}>
                Not interested
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p>{content}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" size="icon">
          <MessageCircle className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Repeat2 className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Heart className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Share2 className="w-5 h-5" />
        </Button>
        <span className="text-sm text-muted-foreground">{timestamp}</span>
      </CardFooter>
    </Card>
  )
}