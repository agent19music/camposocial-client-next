import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FC } from "react";

interface Comment {
  image: string | null;
  username: string;
  text: string;
  dateCreated: string;
}

interface CommentListProps {
  comments: Comment[];
}

const CommentList: FC<CommentListProps> = ({ comments }) => {
  const timeDifference = (current: Date, previous: Date): string => {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    // Convert Date objects to timestamps
    const elapsed = current.getTime() - previous.getTime();

    if (elapsed < msPerMinute) {
      return Math.round(elapsed / 1000) + ' seconds ago';
    } else if (elapsed < msPerHour) {
      return Math.round(elapsed / msPerMinute) + ' minutes ago';
    } else if (elapsed < msPerDay) {
      return Math.round(elapsed / msPerHour) + ' hours ago';
    } else if (elapsed < msPerMonth) {
      return Math.round(elapsed / msPerDay) + ' days ago';
    } else if (elapsed < msPerYear) {
      return Math.round(elapsed / msPerMonth) + ' months ago';
    } else {
      return Math.round(elapsed / msPerYear) + ' years ago';
    }
  };

  return (
    <div className="overflow-auto" style={{ maxHeight: "250px" }}>
      {comments &&
        comments.map(({ image, username, text, dateCreated }) => {
          const timeAgo = timeDifference(new Date(), new Date(dateCreated));
          return (
            <Card key={dateCreated} className="my-2 p-4 shadow-md rounded-lg flex gap-4 dark:border-gray-700">
              <Avatar className="w-8 h-8 rounded-full">
                {image ? (
                  <AvatarImage src={`${image}`} alt={`${username}'s avatar`} />
                ) : (
                  <AvatarFallback className="bg-gray-300 dark:bg-gray-700 text-white">
                    <i className="fas fa-user"></i>
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col justify-between">
                <small className="text-gray-500 dark:text-gray-300">{username}</small>
                <p className="text-black dark:text-white text-sm">{text}</p>
                <small className="text-gray-400 dark:text-gray-400">{timeAgo}</small>
              </div>
            </Card>
          );
        })}
    </div>
  );
};

export default CommentList;
