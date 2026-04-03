import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Star, Send, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { toast } from "sonner";
import type { Review } from "@/lib/data";

const sentimentIcon = {
  positive: <ThumbsUp className="h-4 w-4 text-accent" />,
  negative: <ThumbsDown className="h-4 w-4 text-destructive" />,
  neutral: <Minus className="h-4 w-4 text-muted-foreground" />,
};

function classifySentiment(text: string): Review["sentiment"] {
  const positive = ["love", "great", "amazing", "beautiful", "perfect", "excellent", "best", "wonderful", "fantastic", "good", "happy", "recommend"];
  const negative = ["bad", "terrible", "awful", "hate", "worst", "poor", "disappointed", "horrible", "ugly", "waste"];
  const lower = text.toLowerCase();
  const posCount = positive.filter((w) => lower.includes(w)).length;
  const negCount = negative.filter((w) => lower.includes(w)).length;
  if (posCount > negCount) return "positive";
  if (negCount > posCount) return "negative";
  return "neutral";
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const masked = user.length > 2 ? user[0] + "***" + user[user.length - 1] : user[0] + "***";
  return `${masked}@${domain}`;
}

const StarRating = ({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => !readOnly && onChange?.(star)}
        className={`transition-colors ${readOnly ? "cursor-default" : "cursor-pointer"}`}
        aria-label={`${star} star`}
      >
        <Star
          className={`h-4 w-4 ${star <= value ? "fill-accent text-accent" : "text-muted-foreground"}`}
        />
      </button>
    ))}
  </div>
);

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([
    { id: "1", username: "s***r@gmail.com", reviewText: "Absolutely love the silk dress! The quality is amazing and it fits perfectly.", sentiment: "positive", date: "2026-03-01", rating: 5 },
    { id: "2", username: "b***u@yahoo.com", reviewText: "The hydrating serum is good but could be better for very dry skin.", sentiment: "neutral", date: "2026-02-28", rating: 3 },
    { id: "3", username: "p***a@outlook.com", reviewText: "The cashmere sweater is wonderfully soft. Highly recommend it!", sentiment: "positive", date: "2026-02-20", rating: 5 },
    { id: "4", username: "r***i@gmail.com", reviewText: "Linen blazer looks great but the sizing runs a bit small.", sentiment: "neutral", date: "2026-02-15", rating: 3 },
  ]);
  const [email, setEmail] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !reviewText.trim() || rating === 0) {
      toast.error("Please fill in all fields and select a star rating");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    const sentiment = classifySentiment(reviewText);
    const review: Review = {
      id: Date.now().toString(),
      username: maskEmail(email.trim()),
      reviewText: reviewText.trim(),
      sentiment,
      date: new Date().toISOString().split("T")[0],
      rating,
    };
    setReviews([review, ...reviews]);
    setEmail("");
    setReviewText("");
    setRating(0);
    toast.success(`Review submitted! Sentiment: ${sentiment}`);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <h1 className="font-display text-4xl font-light">Reviews</h1>
        <p className="mt-2 text-sm text-muted-foreground">Share your experience with our products</p>

        {/* Summary bar */}
        <div className="mt-6 flex items-center gap-4 border p-4 bg-secondary/40">
          <span className="font-display text-4xl font-light">{avgRating}</span>
          <div>
            <StarRating value={Math.round(Number(avgRating))} readOnly />
            <p className="mt-1 text-xs text-muted-foreground">{reviews.length} reviews</p>
          </div>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-3">
          {/* Form */}
          <div>
            <h2 className="font-display text-xl font-medium">Write a Review</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="your@email.com"
                />
                <p className="mt-1 text-xs text-muted-foreground">Your email will be partially hidden</p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Rating</label>
                <div className="mt-2">
                  <StarRating value={rating} onChange={setRating} />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="mt-1 w-full resize-none border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Share your thoughts..."
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 bg-primary px-5 py-2.5 text-xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Send className="h-3.5 w-3.5" /> Submit
              </button>
            </form>
          </div>

          {/* Reviews list */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-xl font-medium">All Reviews ({reviews.length})</h2>
            <div className="mt-4 space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="animate-fade-in border p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <StarRating value={review.rating} readOnly />
                      <span className="text-sm font-medium text-muted-foreground">{review.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {sentimentIcon[review.sentiment]}
                      <span className="text-xs capitalize text-muted-foreground">{review.sentiment}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.reviewText}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{review.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
