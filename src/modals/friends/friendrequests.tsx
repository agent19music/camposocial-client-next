import { useContext } from "react";
import { toast } from "react-hot-toast";
import { FriendshipContext } from "@/context/friendshipcontext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FriendRequest {
  id: string;
  username: string;
  photoUrl: string;
  timestamp: Date;
}

export function ReceivedRequestsModal({ requests }: { requests: FriendRequest[] }) {
  const { acceptFriendRequest, rejectFriendRequest } = useContext(FriendshipContext);

  const handleAccept = async (id: string, name: string) => {
    try {
      await acceptFriendRequest(id);
      toast.success(`${name} is now your friend!`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id: string, name: string) => {
    try {
      await rejectFriendRequest(id);
      toast.success(`Rejected friend request from ${name}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No pending friend requests
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={request.photoUrl} alt={request.username} />
                <AvatarFallback>{request.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{request.username}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(request.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleAccept(request.id, request.username)}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReject(request.id, request.username)}
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
