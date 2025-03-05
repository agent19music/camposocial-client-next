import { useState, useContext } from "react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"  // Assume lucide-react has the Star icon
import { AuthContext } from "@/context/authcontext"

type Review = {
  productId: string
  rating: number
  comment: string
}

export default function ReviewForm({ productId }: { productId: string }) {
  const [review, setReview] = useState("")
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {authToken}  = useContext(AuthContext)
  

  const handleSubmitReview = async () => {
    if (!review || rating === 0) {
      toast.error("Please provide both a rating and a comment")
      return
    }

    const reviewData: Review = {
      rating,
      text: review,
    }

    console.log(reviewData);
    

    try {
      setIsSubmitting(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/product/${productId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(reviewData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit review")
      }

      toast.success("Review submitted successfully")
      setReview("")
      setRating(0)
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Leave a Review</h2>
        <div className="flex items-center space-x-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
            >
              <Star className="w-6 h-6 md:w-8 md:h-8 fill-current" />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Write your review here..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="mb-4 dark:bg-foreground/10"
        />
        <Button onClick={handleSubmitReview} disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </CardContent>
    </Card>
  )
}
