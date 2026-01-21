"use client"
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { FC, useState, useContext } from "react";
import CommentList from "./comment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CircleUser, Edit, Trash2, MoreVertical } from "lucide-react";
import { EventContext } from "@/context/eventcontext";
import { AuthContext } from "@/context/authcontext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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


const EventCard = ({ poster, title, description, date, entry_fee, comments, eventId, handleSubmit, userimage, username, event, user_id, ticketGroups = [] }: any) => {
  const [localCommentText, setLocalCommentText] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { navigateToSingleEventView, deleteEvent, setOnchange, onchange } = useContext(EventContext);
  const { currentUser } = useContext(AuthContext);

  const isEventOwner = currentUser?.id === user_id;

  const handleDelete = async () => {
    const success = await deleteEvent(eventId.toString());
    if (success) {
      setShowDeleteDialog(false);
      setOnchange(!onchange);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or dropdowns
    if ((e.target as HTMLElement).closest('button, [role="menuitem"]')) {
      return;
    }
    navigateToSingleEventView(event);
  };


  return (
    <>
      <Card className="my-4 p-6 shadow-lg rounded-lg max-w-4xl mx-auto relative hover:cursor-pointer"
        onClick={handleCardClick}
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

        {/* Event Owner Actions */}
        {isEventOwner && (
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  toast('Edit functionality coming soon!');
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

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
              <h1 className="text-2xl font-semibold" style={{ fontFamily: ' Helvetica' }}>{title}</h1>
              <p className="mt-4 ">{description}</p>
              <div className="flex flex-col gap-2 mt-4 text-sm ">
                <span>
                  <i className="far fa-calendar"></i> Date: {date}
                </span>
                {event?.location && (
                  <span>
                    <i className="fas fa-map-marker-alt"></i> Location: {event.location}
                  </span>
                )}
                <span>
                  <i className="fas fa-money-check"></i> Entry: {entry_fee}
                </span>
              </div>

              {/* Get Tickets Button - links to external ticket platform */}
              {event?.ticket_link && (
                <div className="mt-6">
                  <a
                    href={event.ticket_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
                  >
                    <i className="fas fa-ticket-alt"></i>
                    Get Tickets
                  </a>
                </div>
              )}
            </div>

            {/* Comment Section */}
            <div className="mt-6">
              {/* <h3 className="text-lg font-bold" style={{ fontFamily: ' Helvetica' }}>Comments:</h3> */}
              <CommentList eventId={eventId} comments={comments} />

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              &quot;{title}&quot; and all its comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventCard;
