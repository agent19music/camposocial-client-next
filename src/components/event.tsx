"use client"
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { FC, useState } from "react";
import CommentList from "./comment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CircleUser } from "lucide-react";
import { useContext } from "react";
import { EventContext } from "@/context/eventcontext";
// interface EventCardProps {
//   poster: string;
//   username: string;
//   userimage:string|null
//   title: string;
//   description: string;
//   date: string;
//   entry_fee: string;
//   comments: any[];
//   eventId: string;
//   handleSubmit: (e: React.MouseEvent<HTMLButtonElement>, eventId: string, comment: string) => void;
//   event:
// }


  const EventCard= ({ poster, title, description, date, entry_fee, comments, eventId, handleSubmit, userimage, username, event}: any) => {
  const [localCommentText, setLocalCommentText] = useState<string>("");
  const {navigateToSingleEventView} = useContext(EventContext)
  

  return (
    <Card className="my-4 p-6 shadow-lg rounded-lg max-w-4xl mx-auto relative hover:cursor-pointer" 
    onClick={() => navigateToSingleEventView(event)}
    >
        
        <div className="absolute top-0 left-2 flex items-center space-x-2 p-2  ">
          <Avatar className="w-8 h-8 ">
            {userimage ? (
              <AvatarImage src={`${userimage}`} alt={`${username}'s avatar`} />
            ) : (
              <AvatarFallback className="bg-gray-50">
                <CircleUser className="h-5 w-5" />
              </AvatarFallback>
            )}
          </Avatar>
          <span className="">{username}</span>
        </div>

    <div className="flex flex-col md:flex-row gap-6 ">
                
      <div className="md:w-2/3 w-full relative my-7">
        {/* Image section */}
        <Image
          src={poster}
          alt={title}
          width={300}
          height={400}
          className="rounded-lg object-cover w-full h-full"
          priority={true} // Improves loading for above-the-fold images
        />
  
        {/* Avatar and Username (Moved outside of the image) */}
       
      </div>
  
      {/* Content section */}
      <div className="flex flex-col justify-between md:w-2/3">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-4 ">{description}</p>
          <div className="flex justify-between items-center mt-4 text-sm ">
            <span>
              <i className="far fa-calendar"></i> Date: {date}
            </span>
            <span>
              <i className="fas fa-money-check"></i> Entry: {entry_fee}
            </span>
          </div>
        </div>
  
        {/* Comment Section */}
        <div className="mt-6">
          <h3 className="text-lg font-bold">COMMENTS:</h3>
          <CommentList comments={comments} />
  
          <div className="flex items-center bg-white border border-gray-300 rounded-full mt-4 p-2">
            <input
              type="text"
              placeholder="Add a comment..."
              className="w-full bg-transparent text-black focus:outline-none px-4 py-2"
              value={localCommentText}
              onChange={(e) => setLocalCommentText(e.target.value)}
            />
            <button
              className="ml-2 text-black hover:text-blue-500 focus:outline-none"
              onClick={(e) => {
                handleSubmit(e, eventId, localCommentText);
                setLocalCommentText('');
              }}
            >
              <i className="fas fa-arrow-up"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Card>
  
  );
};

export default EventCard;
