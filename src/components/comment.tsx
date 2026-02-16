import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FC, useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import type { EventComment, CommentListProps } from "@/types";
import { useEventContext } from "@/context/eventcontext";

function timeDifference(current: Date, previous: Date): string {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current.getTime() - previous.getTime();

  if (elapsed < msPerMinute) {
    return `${Math.round(elapsed / 1000)} seconds ago`;
  } else if (elapsed < msPerHour) {
    return `${Math.round(elapsed / msPerMinute)} minutes ago`;
  } else if (elapsed < msPerDay) {
    return `${Math.round(elapsed / msPerHour)} hours ago`;
  } else if (elapsed < msPerMonth) {
    return `${Math.round(elapsed / msPerDay)} days ago`;
  } else if (elapsed < msPerYear) {
    return `${Math.round(elapsed / msPerMonth)} months ago`;
  } else {
    return `${Math.round(elapsed / msPerYear)} years ago`;
  }
}

const CommentItem: FC<{
  eventId: string;
  comment: EventComment;
  depth?: number;
}> = ({ eventId, comment, depth = 0 }) => {
  const { toggleCommentLike, addCommentReply } = useEventContext();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleLike = async () => {
    await toggleCommentLike(comment.id, eventId);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await addCommentReply(eventId, { text: replyText.trim(), parent_comment_id: comment.id });
    setReplyText("");
    setIsReplying(false);
  };

  return (
    <div className="space-y-2" style={{ marginLeft: depth ? depth * 20 : 0 }}>
      <Card className="p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <Avatar className="w-9 h-9">
            {comment.user?.avatar ? (
              <AvatarImage src={comment.user.avatar} alt={`${comment.user.username}'s avatar`} />
            ) : (
              <AvatarFallback className="bg-gray-300 dark:bg-gray-700 text-white">
                {comment.user?.username?.charAt(0) || "?"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{comment.user?.username || "Anonymous"}</span>
              <small className="text-xs text-gray-500">{comment.createdAt ? timeDifference(new Date(), new Date(comment.createdAt)) : ""}</small>
            </div>
            <p className="text-sm mt-1">{comment.text}</p>
            <div className="flex items-center gap-4 mt-3">
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-1 text-xs ${comment.likedByCurrentUser ? "text-red-500" : "text-gray-500"}`}
              >
                <Heart className={`h-4 w-4 ${comment.likedByCurrentUser ? "fill-red-500" : ""}`} />
                {comment.likesCount}
              </button>
              <button
                type="button"
                onClick={() => setIsReplying(prev => !prev)}
                className="flex items-center gap-1 text-xs text-gray-500"
              >
                <MessageCircle className="h-4 w-4" /> Reply
              </button>
            </div>

            {isReplying && (
              <div className="mt-3 space-y-2">
                <textarea
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={2}
                />
                <div className="flex items-center gap-2">
                  <Button type="button" size="sm" onClick={handleReply} disabled={!replyText.trim()}>
                    Post Reply
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setIsReplying(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {comment.replies?.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              eventId={eventId}
              comment={reply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentList: FC<CommentListProps> = ({ eventId, comments }) => {
  return (
    <div className="space-y-4">
      {comments && comments.map((comment) => (
        <CommentItem
          key={comment.id}
          eventId={eventId}
          comment={comment}
        />
      ))}
      {(!comments || comments.length === 0) && (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
      )}
    </div>
  );
};

export default CommentList;
