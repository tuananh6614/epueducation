
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface EditedPost {
  title: string;
  content: string;
  thumbnail: string | null;
}

interface EditPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editedPost: EditedPost;
  onPostChange: (post: EditedPost) => void;
  onSave: () => void;
}

const EditPostDialog: React.FC<EditPostDialogProps> = ({ 
  isOpen, 
  onClose, 
  editedPost, 
  onPostChange, 
  onSave 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Chỉnh sửa bài viết</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Tiêu đề</Label>
            <Input 
              id="edit-title" 
              value={editedPost.title}
              onChange={(e) => onPostChange({...editedPost, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-content">Nội dung</Label>
            <Textarea 
              id="edit-content" 
              className="min-h-32"
              value={editedPost.content}
              onChange={(e) => onPostChange({...editedPost, content: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-thumbnail">Link ảnh (không bắt buộc)</Label>
            <Input 
              id="edit-thumbnail" 
              placeholder="https://example.com/image.jpg"
              value={editedPost.thumbnail || ''}
              onChange={(e) => onPostChange({...editedPost, thumbnail: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
          <Button type="button" onClick={onSave}>Cập nhật</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostDialog;
