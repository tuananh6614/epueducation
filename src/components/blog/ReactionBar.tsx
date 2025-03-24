
import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Image, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuthCheck } from '@/utils/authCheck';

interface Reaction {
  emoji: string;
  name: string;
}

interface ReactionBarProps {
  postId: number;
  likesCount: number;
  commentsCount: number;
  isAuthor: boolean;
  onOpenReactions: () => void;
  onAddMedia: () => void;
  onOpenEditDialog: () => void;
  onShowAllComments: () => void;
  selectedReaction: string | null;
  liked: boolean;
  onReaction: (reactionName: string) => void;
}

const emojiReactions: Reaction[] = [
  { emoji: "❤️", name: "heart" },
  { emoji: "👍", name: "like" },
  { emoji: "😆", name: "haha" },
  { emoji: "😮", name: "wow" },
  { emoji: "😢", name: "sad" },
  { emoji: "😡", name: "angry" }
];

const ReactionBar: React.FC<ReactionBarProps> = ({
  postId,
  likesCount,
  commentsCount,
  isAuthor,
  onOpenReactions,
  onAddMedia,
  onOpenEditDialog,
  onShowAllComments,
  selectedReaction,
  liked,
  onReaction
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const { toast } = useToast();
  const checkAuth = useAuthCheck();
  
  const getEmojiByReaction = (reaction: string | null) => {
    if (!reaction) return null;
    return emojiReactions.find(r => r.name === reaction)?.emoji || null;
  };
  
  const getReactionName = (reaction: string | null) => {
    if (!reaction) return "Thích";
    
    switch(reaction) {
      case "heart": return "Yêu thích";
      case "like": return "Thích";
      case "haha": return "Haha";
      case "wow": return "Wow";
      case "sad": return "Buồn";
      case "angry": return "Phẫn nộ";
      default: return "Thích";
    }
  };
  
  return (
    <div className="flex flex-col border-t border-b py-2 mb-6">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 text-primary rounded-full p-1.5">
            {selectedReaction ? (
              <span className="text-sm">{getEmojiByReaction(selectedReaction)}</span>
            ) : (
              <ThumbsUp className="h-3 w-3" />
            )}
          </div>
          <span className="text-sm text-muted-foreground">{likesCount || 0}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {commentsCount > 0 && (
            <span>{commentsCount} bình luận</span>
          )}
        </div>
      </div>
      
      <Separator />
      <div className="flex items-center justify-between py-1">
        <div className="relative flex-1">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-center gap-2 hover:bg-accent rounded-md py-2"
            onClick={() => setShowReactions(!showReactions)}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setTimeout(() => setShowReactions(false), 500)}
          >
            {selectedReaction ? (
              <span className="text-xl mr-1">{getEmojiByReaction(selectedReaction)}</span>
            ) : (
              <ThumbsUp className={`h-5 w-5 ${liked ? 'fill-primary text-primary' : ''}`} />
            )}
            <span>{getReactionName(selectedReaction)}</span>
          </Button>
          
          {showReactions && (
            <div 
              className="absolute bottom-full left-0 transform translate-y-[-8px] flex items-center gap-1 p-2 bg-background border rounded-full shadow-md z-10 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200"
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
            >
              {emojiReactions.map((reaction) => (
                <button
                  key={reaction.name}
                  className="p-2 cursor-pointer text-2xl hover:scale-125 transition-transform duration-200"
                  onClick={() => {
                    if (checkAuth('thích bài viết')) {
                      onReaction(reaction.name);
                    }
                  }}
                  title={getReactionName(reaction.name)}
                >
                  {reaction.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          className="flex-1 flex items-center justify-center gap-2 hover:bg-accent rounded-md py-2"
          onClick={() => {
            onShowAllComments();
            // Focus on comment input
            setTimeout(() => {
              document.getElementById('comment-input')?.focus();
            }, 100);
          }}
        >
          <MessageSquare className="h-5 w-5" />
          <span>Bình luận</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="flex-1 flex items-center justify-center gap-2 hover:bg-accent rounded-md py-2"
          onClick={() => {
            if (checkAuth('thêm ảnh/video')) {
              onAddMedia();
            }
          }}
        >
          <Image className="h-5 w-5" />
          <span>Ảnh/Video</span>
        </Button>
        
        {isAuthor && (
          <Button 
            variant="ghost" 
            className="flex-1 flex items-center justify-center gap-2 hover:bg-accent rounded-md py-2"
            onClick={onOpenEditDialog}
          >
            <Pencil className="h-5 w-5" />
            <span>Chỉnh sửa</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReactionBar;
