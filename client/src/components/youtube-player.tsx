import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, ThumbsUp, ThumbsDown, Share, MessageCircle, Minus, Move, Maximize2, Sparkles, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface YoutubePlayerProps {
  videoId: string | null;
  title: string;
  onClose: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

export default function YoutubePlayer({ videoId, title, onClose }: YoutubePlayerProps) {
  const [comment, setComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
  const [minimizedSize, setMinimizedSize] = useState<Size>({ width: 320, height: 180 });
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState<{ position: Position; size: Size } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const playerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  // Close player with Escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevent background scroll when player is open and not minimized
  useEffect(() => {
    if (!isMinimized) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMinimized]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMinimized) return;
    
    setIsDragging(true);
    const rect = playerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && isMinimized) {
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - minimizedSize.width));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - minimizedSize.height));
      setPosition({ x: newX, y: newY });
    } else if (isResizing && isMinimized && resizeStart) {
      const deltaX = e.clientX - resizeStart.position.x;
      const deltaY = e.clientY - resizeStart.position.y;
      
      const newWidth = Math.max(200, Math.min(resizeStart.size.width + deltaX, window.innerWidth - position.x));
      const newHeight = Math.max(150, Math.min(resizeStart.size.height + deltaY, window.innerHeight - position.y));
      
      setMinimizedSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeStart(null);
  };

  // Resize handlers
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!isMinimized) return;
    
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      position: { x: e.clientX, y: e.clientY },
      size: { ...minimizedSize }
    });
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  const handleMinimizeToggle = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      // Reset position when minimizing
      setPosition({ x: 20, y: 20 });
    }
  };

  if (!videoId) return null;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`;

  return (
    <>
      {/* Enhanced Blurred Backdrop with Animated Particles */}
      {!isMinimized && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-xl z-40 transition-all duration-500"
          onClick={onClose}
          data-testid="player-backdrop"
        >
          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map(particle => (
              <div
                key={particle.id}
                className="absolute rounded-full bg-primary/20 animate-float"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  animationDelay: `${particle.delay}s`,
                  animationDuration: `${15 + particle.delay * 5}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Enhanced YouTube Player */}
      <div
        ref={playerRef}
        className={cn(
          "fixed z-50 bg-card/80 backdrop-blur-lg border border-primary/20 shadow-2xl transition-all duration-300",
          isMinimized 
            ? "cursor-move bg-background/90 backdrop-blur-md"
            : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-6xl h-[90vh]",
          isDragging && "scale-105 shadow-xl glass-border-glow"
        )}
        style={
          isMinimized 
            ? { 
                left: position.x, 
                top: position.y,
                width: minimizedSize.width,
                height: minimizedSize.height,
                transform: 'none',
              }
            : {}
        }
        data-testid="youtube-player"
        onMouseDown={isMinimized ? handleMouseDown : undefined}
      >
        {/* Enhanced Border Animation */}
        <div className={cn(
          "absolute inset-0 rounded-lg pointer-events-none z-10 transition-all duration-500",
          isMinimized ? "opacity-0" : "opacity-100"
        )}>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-lg opacity-75 blur-sm animate-pulse-gentle"></div>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-lg rounded-lg"></div>
        </div>

        <Card className="w-full h-full flex flex-col bg-transparent border-none shadow-none">
          <CardContent className="p-0 flex-1 flex flex-col bg-transparent relative z-20">
            {/* Enhanced Header */}
            <div className={cn(
              "flex justify-between items-center border-b border-primary/20 bg-card/50 backdrop-blur-lg transition-all duration-300",
              isMinimized ? 'p-2 cursor-move' : 'p-4'
            )}>
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-glow">
                  <Sparkles className="h-4 w-4 text-white animate-spin-slow" />
                </div>
                <h3 
                  className={cn(
                    "font-semibold truncate flex-1 text-gradient",
                    isMinimized ? 'text-sm' : 'text-xl'
                  )}
                  data-testid="youtube-player-title"
                >
                  {isMinimized ? title.slice(0, 30) + (title.length > 30 ? '...' : '') : title}
                </h3>
              </div>
              <div className="flex gap-2">
                {isMinimized && (
                  <div
                    className="h-7 w-7 flex items-center justify-center text-muted-foreground cursor-move hover-lift hover:bg-primary/10 rounded-lg transition-all duration-200"
                    title="Drag to move"
                    onMouseDown={handleMouseDown}
                  >
                    <Move className="h-3 w-3" />
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMinimizeToggle}
                  className={cn(
                    "hover-lift glass border-primary/20 hover:bg-primary/10 transition-all duration-200",
                    isMinimized ? "h-7 w-7" : "h-9 w-9"
                  )}
                  data-testid="minimize-button"
                  title={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? (
                    <Maximize2 className="h-3 w-3 animate-pulse-gentle" />
                  ) : (
                    <Minus className="h-3 w-3 animate-pulse-gentle" />
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className={cn(
                    "hover-lift glass border-primary/20 hover:bg-destructive/10 hover:text-destructive transition-all duration-200",
                    isMinimized ? "h-7 w-7" : "h-9 w-9"
                  )}
                  data-testid="youtube-player-close"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Player Content */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-transparent">
              {/* Enhanced Video Player Container */}
              <div className={cn(
                "flex flex-col relative",
                isMinimized ? 'w-full h-full' : 'flex-1 min-h-0'
              )}>
                <div className={cn(
                  "relative bg-black rounded-none",
                  isMinimized ? 'w-full h-full' : 'flex-1 rounded-b-lg overflow-hidden'
                )}>
                  <iframe
                    src={embedUrl}
                    title={title}
                    className={cn(
                      "border-0",
                      isMinimized ? 'w-full h-full' : 'absolute inset-0 w-full h-full'
                    )}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    data-testid="youtube-iframe"
                    key={`player-${videoId}`}
                  />
                  
                  {/* Enhanced Resize Handle */}
                  {isMinimized && (
                    <div
                      ref={resizeHandleRef}
                      className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize bg-gradient-to-tl from-primary to-purple-500 rounded-tl-lg border border-primary/50 hover:from-purple-500 hover:to-primary transition-all duration-200 shadow-lg"
                      onMouseDown={handleResizeMouseDown}
                      title="Drag to resize"
                    />
                  )}
                </div>

                {/* Enhanced Video Controls */}
                {!isMinimized && (
                  <div className="p-6 border-t border-primary/20 bg-card/50 backdrop-blur-lg">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex space-x-6 text-sm">
                        <span className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary/5 hover-lift transition-all duration-200">
                          <ThumbsUp className="h-4 w-4 text-green-500 animate-pulse-gentle" />
                          <span data-testid="youtube-likes" className="font-semibold">1.2K likes</span>
                        </span>
                        <span className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary/5 hover-lift transition-all duration-200">
                          <ThumbsDown className="h-4 w-4 text-red-500 animate-pulse-gentle" />
                          <span className="font-semibold">12 dislikes</span>
                        </span>
                        <span className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary/5 hover-lift transition-all duration-200">
                          <Share className="h-4 w-4 text-blue-500 animate-pulse-gentle" />
                          <span className="font-semibold">Share</span>
                        </span>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          variant={isLiked ? "default" : "outline"}
                          size="sm"
                          onClick={() => setIsLiked(!isLiked)}
                          className={cn(
                            "hover-lift transition-all duration-300",
                            isLiked && "glass bg-green-500/20 border-green-500/30"
                          )}
                          data-testid="youtube-like-button"
                        >
                          <ThumbsUp className="mr-2 h-4 w-4 animate-pulse-gentle" />
                          {isLiked ? (
                            <span className="flex items-center">
                              Liked <Sparkles className="ml-2 h-3 w-3 animate-spin-slow" />
                            </span>
                          ) : (
                            "Like"
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover-lift glass border-primary/20 transition-all duration-300"
                          data-testid="youtube-share-button"
                        >
                          <Share className="mr-2 h-4 w-4 animate-pulse-gentle" />
                          Share
                        </Button>
                      </div>
                    </div>

                    {/* Enhanced Toggle Comments */}
                    <Button
                      variant="ghost"
                      onClick={() => setShowComments(!showComments)}
                      className="w-full justify-start hover-lift glass border-primary/20 hover:bg-primary/10 transition-all duration-300 py-3 rounded-xl"
                      data-testid="youtube-toggle-comments"
                    >
                      <MessageCircle className="mr-3 h-5 w-5 text-primary animate-pulse-gentle" />
                      <span className="font-semibold">
                        {showComments ? "Hide Comments" : "Show Comments"}
                      </span>
                      <Sparkles className={cn(
                        "ml-auto h-4 w-4 animate-spin-slow transition-opacity duration-300",
                        showComments ? "opacity-100" : "opacity-0"
                      )} />
                    </Button>
                  </div>
                )}
              </div>

              {/* Enhanced Comments Section */}
              {!isMinimized && showComments && (
                <div className="w-full lg:w-96 border-l border-primary/20 flex flex-col glass backdrop-blur-lg">
                  <div className="p-6 border-b border-primary/20 bg-card/50">
                    <h4 className="font-semibold mb-4 text-lg flex items-center space-x-2">
                      <MessageCircle className="h-5 w-5 text-primary animate-pulse-gentle" />
                      <span>Comments</span>
                      <div className="w-2 h-2 bg-primary rounded-full animate-ping ml-1"></div>
                    </h4>
                    
                    {/* Enhanced Add Comment */}
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        className="glass border-primary/20 focus:border-primary transition-all duration-300 resize-none"
                        data-testid="youtube-comment-input"
                      />
                      <div className="flex justify-end space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setComment("")}
                          className="hover-lift hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                          data-testid="youtube-comment-cancel"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={!comment.trim()}
                          className="hover-lift glass border-primary/20 disabled:opacity-50 transition-all duration-300"
                          data-testid="youtube-comment-submit"
                        >
                          <Sparkles className="mr-2 h-4 w-4 animate-spin-slow" />
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Comments List */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="text-center text-muted-foreground py-12">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-gentle">
                        <MessageCircle className="h-8 w-8 text-primary animate-pulse-gentle" />
                      </div>
                      <p className="text-lg font-semibold mb-2">YouTube Comments</p>
                      <p className="text-sm flex items-center justify-center space-x-1">
                        <span>Real comments will load here</span>
                        <Heart className="h-4 w-4 text-primary animate-pulse" />
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}