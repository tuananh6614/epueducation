
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { BlogPost, Comment } from '@/types';
import { useAuthCheck } from '@/utils/authCheck';
import { useToast } from '@/hooks/use-toast';

// Import các component đã tách
import PostHeader from '@/components/blog/PostHeader';
import PostContent from '@/components/blog/PostContent';
import ReactionBar from '@/components/blog/ReactionBar';
import CommentSection from '@/components/blog/CommentSection';
import MediaDialog from '@/components/blog/MediaDialog';
import EditPostDialog from '@/components/blog/EditPostDialog';

const BlogDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedPost, setEditedPost] = useState<{title: string, content: string, thumbnail: string | null}>({
    title: '',
    content: '',
    thumbnail: null
  });
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  
  const checkAuth = useAuthCheck();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/blog/posts/${postId}`);
        const data = await response.json();
        
        if (data.success) {
          console.log('Post data:', data.data);
          setPost(data.data);
          setComments(data.data.comments || []);
          
          const userString = localStorage.getItem('user');
          if (userString) {
            const user = JSON.parse(userString);
            const isPostAuthor = user.id === data.data.author_id;
            setIsAuthor(isPostAuthor);
          }
          
          setEditedPost({
            title: data.data.title,
            content: data.data.content,
            thumbnail: data.data.thumbnail
          });
        } else {
          setError('Không tìm thấy bài viết hoặc đã có lỗi xảy ra');
        }
      } catch (error) {
        console.error('Error fetching post details:', error);
        setError('Không thể kết nối đến máy chủ, vui lòng thử lại sau');
      } finally {
        setLoading(false);
      }
    };
    
    const checkLikeStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`http://localhost:5000/api/likes/check?post_id=${postId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (data.success) {
          setLiked(data.liked);
          setSelectedReaction(data.reaction || null);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };
    
    fetchPostDetails();
    checkLikeStatus();
  }, [postId]);
  
  const handleReaction = async (reaction: string) => {
    if (checkAuth('thích bài viết')) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5000/api/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            post_id: Number(postId),
            reaction: reaction 
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setLiked(data.liked);
          setSelectedReaction(data.liked ? reaction : null);
          
          if (post) {
            setPost({
              ...post,
              likes_count: data.liked 
                ? (post.likes_count || 0) + 1 
                : Math.max((post.likes_count || 0) - 1, 0)
            });
          }
          
          toast({
            title: "Thành công",
            description: data.liked ? `Đã ${reaction === 'like' ? 'thích' : 'bày tỏ cảm xúc'} bài viết` : "Đã bỏ thích bài viết",
          });
        }
      } catch (error) {
        console.error('Error reacting to post:', error);
        toast({
          title: "Lỗi",
          description: "Không thể thích bài viết, vui lòng thử lại sau",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleEditPost = async () => {
    if (!checkAuth('chỉnh sửa bài viết')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/blog/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedPost)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPost({
          ...post!,
          title: editedPost.title,
          content: editedPost.content,
          thumbnail: editedPost.thumbnail
        });
        
        setIsEditDialogOpen(false);
        
        toast({
          title: "Thành công",
          description: "Bài viết đã được cập nhật",
        });
      } else {
        toast({
          title: "Lỗi",
          description: data.message || "Không thể cập nhật bài viết",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật bài viết, vui lòng thử lại sau",
        variant: "destructive",
      });
    }
  };
  
  const handleAddMedia = () => {
    if (!checkAuth('thêm ảnh/video')) {
      return;
    }

    setIsMediaDialogOpen(true);
  };

  const handleSubmitMedia = (mediaUrl: string, mediaType: 'image' | 'video') => {
    if (!mediaUrl.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập URL hợp lệ",
        variant: "destructive"
      });
      return;
    }

    try {
      const newContent = post?.content + `\n\n${mediaType === 'image' 
        ? `![Hình ảnh](${mediaUrl})` 
        : `<video src="${mediaUrl}" controls width="100%"></video>`}`;
      
      setEditedPost({
        ...editedPost,
        content: newContent
      });
      
      // Auto-submit the edit
      const token = localStorage.getItem('token');
      
      fetch(`http://localhost:5000/api/blog/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editedPost,
          content: newContent
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setPost({
            ...post!,
            content: newContent
          });
          
          toast({
            title: "Thành công",
            description: `Đã thêm ${mediaType === 'image' ? 'hình ảnh' : 'video'} vào bài viết`,
          });
        }
      })
      .catch(error => {
        console.error('Error updating post with media:', error);
        toast({
          title: "Lỗi",
          description: "Không thể thêm phương tiện, vui lòng thử lại sau",
          variant: "destructive",
        });
      });
      
      setIsMediaDialogOpen(false);
    } catch (error) {
      console.error('Error adding media:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm phương tiện, vui lòng thử lại sau",
        variant: "destructive",
      });
    }
  };
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkAuth('bình luận')) {
      return;
    }
    
    if (!commentText.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/blog/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: commentText,
          post_id: Number(postId)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Comment response:', data);
        setComments([data.data, ...comments]);
        setCommentText('');
        
        if (post) {
          setPost({
            ...post,
            comments_count: (post.comments_count || 0) + 1
          });
        }
        
        toast({
          title: "Thành công",
          description: "Bình luận của bạn đã được đăng",
        });

        // Auto-expand comments when user adds a new one
        setShowAllComments(true);
      } else {
        toast({
          title: "Lỗi",
          description: data.message || "Không thể đăng bình luận",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể đăng bình luận, vui lòng thử lại sau",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!checkAuth('xóa bình luận')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/blog/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setComments(comments.filter(comment => comment.comment_id !== commentId));
        
        if (post) {
          setPost({
            ...post,
            comments_count: Math.max((post.comments_count || 0) - 1, 0)
          });
        }
        
        toast({
          title: "Thành công",
          description: "Bình luận đã được xóa",
        });
      } else {
        toast({
          title: "Lỗi",
          description: data.message || "Không thể xóa bình luận",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa bình luận, vui lòng thử lại sau",
        variant: "destructive",
      });
    }
  };

  const getCurrentUserId = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      return user.id;
    }
    return null;
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải bài viết...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold">Bài viết không tồn tại</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <PostHeader post={post} />
          
          <PostContent post={post} />
          
          <ReactionBar 
            postId={parseInt(postId as string)}
            likesCount={post.likes_count || 0}
            commentsCount={post.comments_count || comments.length}
            isAuthor={isAuthor}
            onOpenReactions={() => {}}
            onAddMedia={handleAddMedia}
            onOpenEditDialog={() => setIsEditDialogOpen(true)}
            onShowAllComments={() => setShowAllComments(true)}
            selectedReaction={selectedReaction}
            liked={liked}
            onReaction={handleReaction}
          />
          
          <CommentSection 
            comments={comments}
            commentText={commentText}
            setCommentText={setCommentText}
            showAllComments={showAllComments}
            setShowAllComments={setShowAllComments}
            handleCommentSubmit={handleCommentSubmit}
            handleDeleteComment={handleDeleteComment}
            currentUserId={getCurrentUserId()}
          />
          
          <MediaDialog 
            isOpen={isMediaDialogOpen} 
            onClose={() => setIsMediaDialogOpen(false)}
            onSubmit={handleSubmitMedia}
          />
          
          <EditPostDialog 
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            editedPost={editedPost}
            onPostChange={setEditedPost}
            onSave={handleEditPost}
          />
        </div>
      </div>
    </Layout>
  );
};

export default BlogDetail;
