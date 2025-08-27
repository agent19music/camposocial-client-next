export const YapStats = ({ replies, retweets, likes, bookmarks }: { replies: number, retweets: number, likes: number, bookmarks: number }) => {
    return (
      <div className="flex gap-4 py-4">
        <div className="flex gap-1">
          <span className="font-bold">{replies}</span>
          <span className="text-muted-foreground">Replies</span>
        </div>
        <div className="flex gap-1">
          <span className="font-bold">{retweets}</span>
          <span className="text-muted-foreground">Reposts</span>
        </div>
        <div className="flex gap-1">
          <span className="font-bold">{likes}</span>
          <span className="text-muted-foreground">Likes</span>
        </div>
        <div className="flex gap-1">
          <span className="font-bold">{bookmarks}</span>
          <span className="text-muted-foreground">Bookmarks</span>
        </div>
      </div>
    )
  }