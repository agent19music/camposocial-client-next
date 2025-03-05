import { useContext } from "react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserContext } from "@/context/usercontext"
import { number } from "zod"

interface FriendRequest {
  id: number
  username: string
  photoUrl: string
}

export function ReceivedRequestsModal() {
  const { receivedRequests, addFriend, rejectFriendRequest } = useContext(UserContext)

  const handleAccept = async (id: number, name: string) => {
    try {
      addFriend(id)
      toast.success(`${name} is now your friend !`)
    } catch (error) {
      toast.error(`Failed to add ${name} as a friend`)
      console.error(error)
    }
  }

  const handleReject = async (id: number, name: string) => {
    try {
       rejectFriendRequest(id)
      toast.success(`Rejected friend request from ${name}`)
    } catch (error) {
      toast.error(`Oops Failed to reject friend request`)
      console.error(error)
    }
  }

  return (
    <div className="space-y-4">
      {receivedRequests?.map((request) => (
        <Card key={request.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={request.photoUrl} alt={request.username} />
                <AvatarFallback>{request.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{request.username}</h3>
                <p className="text-sm text-gray-500">{`${request.first_name} ${request.last_name}`}</p>

              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="default" onClick={() => handleAccept(request.id, request.username)}>Accept</Button>
              <Button variant="outline" onClick={() => handleReject(request.id, request.username)}>Reject</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
