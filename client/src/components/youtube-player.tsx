import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, ThumbsUp, ThumbsDown, Share, MessageCircle } from "lucide-react";

interface YoutubePlayerProps {
  videoId: string | null;
  title: string;
  onClose: () => void;
}

export default function YoutubePlayer({ videoId, title, onClose }: YoutubePlayerProps) {
  const [comment, setComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(true);

  if (!videoId) return null;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <Card className="fixed inset-4 z-50 bg-card border border-border shadow-2xl" data-testid="youtube-player">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="text-lg font-semibold" data-testid="youtube-player-title">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="youtube-player-close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Video Player */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="relative flex-1 bg-black">
              <iframe
                src={embedUrl}
                title={title}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                data-testid="youtube-iframe"
              />
            </div>

            {/* Video Controls */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-4 text-sm">
                  <span className="flex items-center space-x-1">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    <span data-testid="youtube-likes">1.2K likes</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    <span>12 dislikes</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Share className="h-4 w-4 text-blue-500" />
                    <span>Share</span>
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    data-testid="youtube-like-button"
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    {isLiked ? "Liked" : "Like"}
                  </Button>
                  <Button variant="outline" size="sm" data-testid="youtube-share-button">
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Toggle Comments */}
              <Button
                variant="ghost"
                onClick={() => setShowComments(!showComments)}
                className="w-full justify-start"
                data-testid="youtube-toggle-comments"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {showComments ? "Hide Comments" : "Show Comments"}
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="w-full lg:w-96 border-l border-border flex flex-col">
              <div className="p-4 border-b border-border">
                <h4 className="font-semibold mb-3">Comments</h4>
                
                {/* Add Comment */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    data-testid="youtube-comment-input"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setComment("")}
                      data-testid="youtube-comment-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={!comment.trim()}
                      data-testid="youtube-comment-submit"
                    >
                      Comment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>YouTube comments integration</p>
                  <p className="text-sm">Comments will be loaded from YouTube API</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
