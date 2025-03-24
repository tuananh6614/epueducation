
import React from 'react';
import { BlogPost } from '@/types';

interface PostContentProps {
  post: BlogPost;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  return (
    <>
      {post.thumbnail && (
        <div className="aspect-video w-full rounded-lg overflow-hidden mb-8">
          <img 
            src={post.thumbnail} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="prose max-w-none mb-10">
        <div className="mb-4 text-lg whitespace-pre-wrap">
          {post.content.split(/!\[.*?\]\((.*?)\)/).map((part, index, array) => {
            // If this is an even index, it's text content
            if (index % 2 === 0) {
              // Check for video tags and render them properly
              const videoParts = part.split(/<video src="(.*?)" controls width="100%"><\/video>/);
              return (
                <React.Fragment key={`text-${index}`}>
                  {videoParts.map((videoPart, vIndex, vArray) => {
                    if (vIndex % 2 === 0) {
                      return <span key={`text-part-${vIndex}`}>{videoPart}</span>;
                    } else {
                      return (
                        <div key={`video-${vIndex}`} className="my-4">
                          <video src={videoPart} controls width="100%" className="rounded-lg"></video>
                        </div>
                      );
                    }
                  })}
                </React.Fragment>
              );
            } else {
              // This is an image URL
              return (
                <div key={`img-${index}`} className="my-4">
                  <img 
                    src={array[index]} 
                    alt="Hình ảnh bài viết" 
                    className="rounded-lg max-w-full"
                  />
                </div>
              );
            }
          })}
        </div>
      </div>
    </>
  );
};

export default PostContent;
