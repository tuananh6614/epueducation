
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Comment } from '@/types';

interface CommentListProps {
  comments: Comment[];
  showAllComments: boolean;
  onToggleComments: () => void;
  onDeleteComment: (commentId: number) => void;
  currentUserId: number | null;
}

const CommentList: React.FC<CommentListProps> = ({ 
  comments, 
  showAllComments, 
  onToggleComments,
  onDeleteComment,
  currentUserId
}) => {
  const { toast } = useToast();
  
  const getVisibleComments = () => {
    if (showAllComments || comments.length <= 3) {
      return comments;
    } else {
      return comments.slice(0, 3);
    }
  };

  return (
    <div className="space-y-4">
      {getVisibleComments().map((comment) => (
        <div key={comment.comment_id} className="group flex gap-3">
          <Avatar className="h-9 w-9 mt-1">
            <AvatarImage 
              src={comment.author_avatar || `https://ui-avatars.com/api/?name=${comment.author_fullname || comment.author}&background=random`} 
            />
            <AvatarFallback>{(comment.author_fullname || comment.author)?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="bg-muted/30 rounded-2xl px-4 py-2">
              <div className="font-semibold text-sm">{comment.author_fullname || comment.author}</div>
              {comment.content && (
                <p className="text-sm break-words">{comment.content}</p>
              )}
            </div>
            <div className="flex gap-4 mt-1 pl-2 text-xs">
              <button className="text-muted-foreground hover:text-foreground font-medium">Thích</button>
              <button className="text-muted-foreground hover:text-foreground font-medium">Phản hồi</button>
              <span className="text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity self-start pt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(comment.content || '');
                    toast({
                      title: "Đã sao chép",
                      description: "Nội dung bình luận đã được sao chép",
                    });
                  }}
                >
                  Sao chép
                </DropdownMenuItem>
                {comment.user_id === currentUserId && (
                  <>
                    <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDeleteComment(comment.comment_id)}
                    >
                      Xóa
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem>Báo cáo</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
      
      {comments.length > 3 && !showAllComments && (
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-primary"
          onClick={onToggleComments}
        >
          <ChevronDown className="h-4 w-4 mr-2" />
          Xem thêm {comments.length - 3} bình luận
        </Button>
      )}
      
      {comments.length > 3 && showAllComments && (
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-primary"
          onClick={onToggleComments}
        >
          <ChevronDown className="h-4 w-4 mr-2 rotate-180" />
          Thu gọn
        </Button>
      )}
      
      {(!comments || comments.length === 0) && (
        <div className="text-center py-6">
          <p className="text-muted-foreground">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
        </div>
      )}
    </div>
  );
};

export default CommentList;
