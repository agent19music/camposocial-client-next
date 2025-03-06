"use client";

import { useState, useEffect, useRef, useContext, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatContext } from "@/context/chatcontext";
import { generateConversationId } from "@/lib/utils";
import { AuthContext } from "@/context/authcontext";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import Header from "@/components/header";
import SideNav from "@/components/sidenav";
import { Users, UserPlus, MessageSquare, Bell, Home } from "lucide-react";

const MessageChatPage = () => {
  const params = useParams();
  const conversationId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { currentUser } = useContext(AuthContext);
  
  const {
    messages,
    setMessages,
    sendMessage,
    getMessages,
    addReaction,
    setFriendId,
    chatList
  } = useContext(ChatContext);

  // Extract friend ID from the conversation ID
  const [friendId, setLocalFriendId] = useState<string | null>(null);
  // Friend details state
  const [friend, setFriend] = useState<{ name: string; avatar: string; isOnline: boolean } | null>(null);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [selectedMedia, setSelectedMedia] = useState<FileList | null>(null);

  // Extract the friend ID from the conversation ID
  useEffect(() => {
    if (conversationId && currentUser) {
      // If the conversation ID contains an underscore, it's in the format user1_user2
      if (conversationId.includes('_')) {
        const userIds = conversationId.split('_');
        // Find which ID is not the current user's ID
        const extractedFriendId = userIds[0] === currentUser.id ? userIds[1] : userIds[0];
        setLocalFriendId(extractedFriendId);
      } else {
        // For backward compatibility or if using raw IDs
        setLocalFriendId(conversationId);
      }
    }
  }, [conversationId, currentUser]);

  // Set the friend ID in the chat context and fetch friend details
  useEffect(() => {
    if (friendId) {
      setFriendId(friendId);
      loadInitialMessages();
      fetchFriendDetails();
    }

    return () => {
      // Clear the messages and friendId when unmounting
      setMessages([]);
      setFriendId(null);
    };
  }, [friendId]);

  // Fetch friend details from the chat list or from API
  const fetchFriendDetails = async () => {
    if (!friendId) return;
    
    setErrorMessage(null);
    
    // Try to get friend details from chat list first
    if (chatList && chatList.length > 0) {
      const foundFriend = chatList.find(chat => chat.id === friendId);
      if (foundFriend) {
        setFriend({
          name: `${foundFriend.firstName} ${foundFriend.lastName}`,
          avatar: foundFriend.avatar || "/placeholder.svg",
          isOnline: false // We'll need to implement a webhook or polling to update this
        });
        return;
      }
    }
    
    // If not in chat list, fetch from API
    try {
      const response = await fetch(`http://127.0.0.1:5000/users/${friendId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setFriend({
          name: `${userData.first_name} ${userData.last_name}`,
          avatar: userData.avatar || "/placeholder.svg",
          isOnline: userData.is_online || false
        });
      } else if (response.status === 404) {
        // User not found
        setErrorMessage("User not found");
        setFriend({
          name: "Unknown User",
          avatar: "/placeholder.svg",
          isOnline: false
        });
      } else {
        // Other error
        throw new Error(`Error fetching user: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to fetch friend details:", error);
      // Set default values if fetch fails
      setFriend({
        name: "User",
        avatar: "/placeholder.svg",
        isOnline: false
      });
    }
  };

  // Check if conversation exists before loading messages
  const checkConversationExists = async (): Promise<boolean> => {
    if (!friendId) return false;
    
    try {
      // Try to use the conversation-exists endpoint if available
      const response = await fetch(`http://127.0.0.1:5000/conversation-exists/${friendId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.exists;
      } else if (response.status === 404) {
        // Endpoint doesn't exist, fallback to loading messages
        // If we get a small batch of messages (or none), we'll know it's empty
        console.warn("conversation-exists endpoint not found, falling back to message check");
        return true; // Proceed with loading messages
      } else {
        console.error("Error checking if conversation exists:", response.status);
        return true; // Proceed with loading messages as fallback
      }
    } catch (error) {
      console.error("Failed to check if conversation exists:", error);
      return true; // Proceed with loading messages as fallback
    }
  };

  const loadInitialMessages = async () => {
    if (!friendId) return;
    
    setLoading(true);
    setErrorMessage(null);
    
    try {
      // Check if conversation exists first to avoid unnecessary loading
      const conversationExists = await checkConversationExists();
      
      if (!conversationExists) {
        // No messages exist, set canLoadMore to false
        setCanLoadMore(false);
        setLoading(false);
        return;
      }
      
      // Proceed to load messages
      const fetchedMessages = await getMessages(friendId, 20);
      
      // Check if this is a new conversation (no messages)
      if (fetchedMessages.length === 0) {
        setCanLoadMore(false);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      setErrorMessage("Failed to load messages. Please try again.");
      setCanLoadMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Function to load older messages when scrolling to the top
  const loadOlderMessages = async () => {
    if (!canLoadMore || loading || !friendId) return;
    
    setLoading(true);
    setErrorMessage(null);
    
    try {
      const oldestMessageId = messages.length > 0 ? messages[0].id : undefined;
      const olderMessages = await getMessages(friendId, 20, oldestMessageId);
      
      if (olderMessages.length === 0) {
        setCanLoadMore(false);
      }
    } catch (error) {
      console.error("Failed to load older messages:", error);
      setErrorMessage("Failed to load older messages. Please try again.");
      setCanLoadMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle scroll event to load older messages
  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    
    const { scrollTop } = scrollAreaRef.current;
    
    if (scrollTop === 0 && canLoadMore) {
      loadOlderMessages();
    }
  };

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener("scroll", handleScroll);
      return () => scrollArea.removeEventListener("scroll", handleScroll);
    }
  }, [messages, canLoadMore]);

  const handleSend = async () => {
    if ((input.trim() === "" && !selectedMedia) || !friendId) return;

    try {
      // Send message
      await sendMessage(input, selectedMedia, replyingTo || undefined);

      // Reset input and selections
      setInput("");
      setReplyingTo(null);
      setSelectedMedia(null);
      setErrorMessage(null);
    } catch (error) {
      console.error("Failed to send message:", error);
      setErrorMessage("Failed to send message. Please try again.");
    }
    
    // No typing simulation needed anymore
  };

  const handleReaction = async (messageId: number, reaction: string) => {
    try {
      await addReaction(messageId, reaction);
    } catch (error) {
      console.error("Failed to add reaction:", error);
      setErrorMessage("Failed to add reaction. Please try again.");
    }
  };

  const handleMediaInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedMedia(event.target.files);
    }
  };

  // Prepare messages for the ChatMessages component
  const formattedMessages = messages.map(message => ({
    id: message.id,
    sender: message.senderId,
    content: message.content,
    timestamp: message.timestamp,
    avatar: "/placeholder.svg",
    reactions: message.reactions.map(r => r.reactionType),
    replyTo: message.replyTo,
    isSent: message.isSent,
    isRead: message.isRead,
    media: message.media
  }));

  // Define navigation links for the sidenav
  const navLinks = [
    {
      label: "Messages",
      icon: <MessageSquare className="h-5 w-5" />,
      onClick: () => router.push('/messages'),
      badgeCount: undefined
    },
    {
      label: "Friends",
      icon: <UserPlus className="h-5 w-5" />,
      onClick: () => router.push('/friends'),
      badgeCount: undefined
    },
    {
      label: "Home",
      icon: <Home className="h-5 w-5" />,
      onClick: () => router.push('/'),
      badgeCount: undefined
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900">
      <Header />
      <div className="flex flex-1 pt-2">
        <div className="hidden md:block w-64 border-r">
          <SideNav links={navLinks} />
        </div>
        <div className="flex-1 flex flex-col">
          <ChatHeader friend={friend || undefined} />
      
      {/* Error message display */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mx-4 mt-2">
          <span className="block sm:inline">{errorMessage}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setErrorMessage(null)}
          >
            <span className="sr-only">Dismiss</span>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && messages.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
          <p className="text-gray-500">Loading messages...</p>
        </div>
      ) : (
        <ChatMessages 
          messages={formattedMessages}
          isTyping={false}
          handleReaction={handleReaction}
          scrollAreaRef={scrollAreaRef}
        />
      )}
      
      {/* Empty conversation state */}
      {canLoadMore === false && messages.length === 0 && !loading && (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500">No messages yet. Start a conversation!</p>
        </div>
      )}
      
      <ChatInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        messages={formattedMessages}
        handleMediaInputChange={handleMediaInputChange}
      />
        </div>
      </div>
    </div>
  );
};

export default MessageChatPage;

