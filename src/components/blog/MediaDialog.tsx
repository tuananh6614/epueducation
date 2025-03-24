
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, type: 'image' | 'video') => void;
}

const MediaDialog: React.FC<MediaDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const handleSubmit = () => {
    if (mediaUrl.trim()) {
      onSubmit(mediaUrl, mediaType);
      setMediaUrl('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm ảnh hoặc video</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              type="button" 
              variant={mediaType === 'image' ? 'default' : 'outline'}
              onClick={() => setMediaType('image')}
              className="flex-1"
            >
              Ảnh
            </Button>
            <Button 
              type="button" 
              variant={mediaType === 'video' ? 'default' : 'outline'}
              onClick={() => setMediaType('video')}
              className="flex-1"
            >
              Video
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="media-url">Đường dẫn {mediaType === 'image' ? 'ảnh' : 'video'}</Label>
            <Input 
              id="media-url" 
              placeholder={mediaType === 'image' ? 'https://example.com/image.jpg' : 'https://example.com/video.mp4'}
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
          <Button type="button" onClick={handleSubmit}>Thêm vào bài viết</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MediaDialog;
