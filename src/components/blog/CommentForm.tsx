
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (e: React.FormEvent) => void;
  commentText: string;
  setCommentText: (text: string) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, commentText, setCommentText }) => {
  // Lấy thông tin avatar người dùng từ localStorage
  const getUserAvatar = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      return user.profile_picture || `https://ui-avatars.com/api/?name=${user.username || 'User'}&background=random`;
    }
    return `https://ui-avatars.com/api/?name=User&background=random`;
  };

  return (
    <div className="mb-6 flex gap-3 items-start bg-muted/30 p-4 rounded-lg">
      <Avatar className="mt-1">
        <AvatarImage src={getUserAvatar()} />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      <form onSubmit={onSubmit} className="flex-grow relative">
        <div className="flex-grow relative rounded-full bg-background overflow-hidden">
          <Input
            id="comment-input"
            placeholder="Viết bình luận của bạn..." 
            className="pr-10 border-none shadow-none rounded-full"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary disabled:text-muted-foreground disabled:cursor-not-allowed"
            disabled={!commentText.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
