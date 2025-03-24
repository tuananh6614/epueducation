
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { BlogPost } from '@/types';

interface PostHeaderProps {
  post: BlogPost;
}

const PostHeader: React.FC<PostHeaderProps> = ({ post }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
      <div className="flex items-center gap-4 mb-6">
        <Avatar>
          <AvatarImage src={post.author_avatar || `https://ui-avatars.com/api/?name=${post.author_fullname || post.author}&background=random`} />
          <AvatarFallback>{(post.author_fullname || post.author)?.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{post.author_fullname || post.author}</div>
          <div className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostHeader;
