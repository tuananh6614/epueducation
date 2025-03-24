
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { Comment } from '@/types';

interface CommentSectionProps {
  comments: Comment[];
  commentText: string;
  setCommentText: (text: string) => void;
  showAllComments: boolean;
  setShowAllComments: (show: boolean) => void;
  handleCommentSubmit: (e: React.FormEvent) => void;
  handleDeleteComment: (commentId: number) => void;
  currentUserId: number | null;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  commentText,
  setCommentText,
  showAllComments,
  setShowAllComments,
  handleCommentSubmit,
  handleDeleteComment,
  currentUserId
}) => {
  const toggleComments = () => {
    setShowAllComments(!showAllComments);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Bình luận</h2>
        {comments.length > 3 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleComments}
            className="flex items-center gap-1 text-muted-foreground"
          >
            {showAllComments ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>Thu gọn</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>Xem tất cả ({comments.length})</span>
              </>
            )}
          </Button>
        )}
      </div>
      
      <CommentForm 
        onSubmit={handleCommentSubmit}
        commentText={commentText}
        setCommentText={setCommentText}
      />
      
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium">Phù hợp nhất</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">Sắp xếp</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mới nhất</DropdownMenuItem>
            <DropdownMenuItem>Cũ nhất</DropdownMenuItem>
            <DropdownMenuItem>Phù hợp nhất</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <CommentList 
        comments={comments}
        showAllComments={showAllComments}
        onToggleComments={toggleComments}
        onDeleteComment={handleDeleteComment}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default CommentSection;
