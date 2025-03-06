"use client"

import { useContext, useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MoreHorizontal, MessageCircle, UserPlus, Search } from 'lucide-react'
import { Home, Calendar, PartyPopper, Users, UserPlus2, Bell } from 'lucide-react'
import Header from '@/components/header'
import SideNav from '@/components/sidenav'
import { UserContext } from "@/context/usercontext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ReceivedRequestsModal } from "@/modals/friends/friendrequests"

interface Friend {
  id: number
  username: string
  photoUrl: string
  course: string
}

interface Suggestion {
  id: number
  username: string
  photoUrl: string
  mutualFriends: number
  friendshipStatus: 'none' | 'friend' | 'request_sent' | 'request_received'
}



interface User {
  id: number
  username: string
  photoUrl: string
}

interface FriendRequest {
  id: number;
  username: string;
  photoUrl: string;
}

const FriendCard = ({ friend, removeFriend, blockFriend }: { friend: Friend, removeFriend: (id: number) => void, blockFriend: (id: number) => void }) => {
  const [showAlert, setShowAlert] = useState<"unfriend" | "block" | null>(null)
  const router = useRouter()

  const handleBlock = (friendId: number) => {
    // Handle block action here
    blockFriend(friendId);
  };

  return (
    <Card className="mb-4">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={friend.photoUrl} alt={friend.username} />
            <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{friend.username}</h3>
            <p className="text-sm text-gray-500">{friend.course}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:text-green-500"
            onClick={() => router.push(`/messages/${friend.id}`)}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setShowAlert("unfriend")}>Unfriend</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setShowAlert("block")}>Block</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      <AlertDialog open={showAlert !== null} onOpenChange={() => setShowAlert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {showAlert === "unfriend" ? "Unfriend" : "Block"} {friend.username}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {showAlert === "unfriend" ? "unfriend" : "block"} {friend.username}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (showAlert === "unfriend") {
                removeFriend(friend.id);
              } else if (showAlert === "block") {
                handleBlock(friend.id);
              }
              setShowAlert(null);
            }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

const SuggestionCard = ({
  suggestion,
  sendFriendRequest,
  acceptFriendRequest
}: {
  suggestion: Suggestion;
  sendFriendRequest: (id: number) => void;
  acceptFriendRequest: (id: number) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonClick = () => {
    setIsLoading(true);
    if (suggestion.friendshipStatus === 'none') {
      sendFriendRequest(suggestion.id);
    } else if (suggestion.friendshipStatus === 'request_received') {
      acceptFriendRequest(suggestion.id);
    }
    setIsLoading(false);
  };

  const renderButtonContent = () => {
    if (suggestion.friendshipStatus === 'friend') {
      return (
        <span className="text-green-500 flex items-center">
          <MessageCircle className="mr-2 h-4 w-4" />
          Friend
        </span>
      );
    } else if (suggestion.friendshipStatus === 'request_sent') {
      return <span className="text-gray-500">Pending</span>;
    } else if (suggestion.friendshipStatus === 'request_received') {
      return 'Accept';
    }
    return 'Add Friend';
  };

  return (
    <Card className="mb-4">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={suggestion.photoUrl} alt={suggestion.username} />
            <AvatarFallback>{suggestion.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{suggestion.username}</h3>
            <p className="text-sm text-gray-500">{suggestion.mutualFriends} mutual friends</p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="hover:text-green-500"
          onClick={handleButtonClick}
          disabled={suggestion.friendshipStatus === 'friend'}
        >
          {renderButtonContent()}
        </Button>
      </CardContent>
    </Card>
  );
};


const SearchResultCard = ({ user, onAddFriend }: { user: User; onAddFriend: () => void }) => {
  return (
    <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.photoUrl} alt={user.username} />
          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{user.username}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={onAddFriend}>
        <UserPlus className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function Component() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [activeModal, setActiveModal] = useState<string | null>(null)
  
  const {users, sendFriendRequest, friends, removeFriend, blockUser} = useContext(UserContext);


  const transformedUsers: Suggestion[] = users?.users?.map(user => ({
    id: user.id,
    username: user.username,
    photoUrl: user.photoUrl || "/placeholder.svg?height=40&width=40", // Use a default image if none is provided
    mutualFriends: user.mutual_friends || 0, // Default to 0 if mutualFriends is not provided
    friendshipStatus: user.friendship_status || 'none', // Default to 'none' if friendshipStatus is not provided
  }));


  const suggestions: Suggestion[] = [
    ...(Array.isArray(transformedUsers) && transformedUsers.length > 0 ? transformedUsers : [])
    
  ]

  const receivedRequests: FriendRequest[] = [
    { id: 1, username: "Grace", photoUrl: "/placeholder.svg?height=40&width=40" },
    { id: 2, username: "Henry", photoUrl: "/placeholder.svg?height=40&width=40" },
  ]



  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setSearchResults([])
    } else {
      const results = allUsers.filter(user =>
        user.username.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(results)
    }
  }

  const handleAddFriend = (user: User) => {
    console.log(`Added ${user.username} as a friend`)
    // Here you would typically update the friends list and remove from suggestions
  }

  const handleAcceptRequest = (id: number) => {
    console.log(`Accepted friend request from user with id ${id}`)
    // Implement the logic to accept the friend request
  }

  const handleRejectRequest = (id: number) => {
    console.log(`Rejected friend request from user with id ${id}`)
    // Implement the logic to reject the friend request
  }

  const eventLinks = [
    { label: "Friends", icon: <Users className="h-4 w-4" />, onClick: () => setActiveModal("friends") },
    { label: "Suggestions", icon: <UserPlus className="h-4 w-4" />, onClick: () => setActiveModal("suggestions") },
    { label: "Requests", icon: <Bell className="h-4 w-4" />, onClick: () => setActiveModal("requests") },
  ];

  return (
    <div className="w-screen h-screen lg:container mx-auto p-4">
    <Header />
    <div className="flex flex-col md:flex-row">
      {/* Left SideNav */}
      <SideNav links={eventLinks} />
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search users"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            {searchResults.length > 0 ? (
              <div className="max-h-[300px] overflow-auto">
                {searchResults.map((user) => (
                  <SearchResultCard
                    key={user.id}
                    user={user}
                    onAddFriend={() => handleAddFriend(user)}
                  />
                ))}
              </div>
            ) : (
              <p className="p-2 text-sm text-gray-500">No users found</p>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <Dialog open={activeModal === "friends"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Friends</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {friends?.map((friend) => (
              <FriendCard key={friend.id} friend={friend} removeFriend={removeFriend} blockFriend={blockUser} />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "suggestions"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>People You May Know</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {suggestions?.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} sendFriendRequest={sendFriendRequest} />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "requests"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Friend Requests</DialogTitle>
          </DialogHeader>
          <ReceivedRequestsModal
            requests={receivedRequests}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
          />
        </DialogContent>
      </Dialog>
    </div>
    </div>
    </div>
  )
}

