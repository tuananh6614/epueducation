
import { useState, ChangeEvent, FormEvent } from "react";
import { User } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface ProfileFormProps {
  user: User | null;
  updateUser: (user: User) => void;
}

const ProfileForm = ({ user, updateUser }: ProfileFormProps) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    full_name: user?.full_name || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(user?.profile_picture || null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Bạn chưa đăng nhập');
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      // Không gửi username vì không thay đổi
      formDataToSend.append('email', formData.email);
      formDataToSend.append('full_name', formData.full_name);
      
      if (profilePicture) {
        formDataToSend.append('profile_picture', profilePicture);
      }

      const response = await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        // Cập nhật state và local UI
        updateUser(data.data);
        
        // Cập nhật preview hình ảnh với đường dẫn mới từ server
        if (data.data.profile_picture) {
          setPicturePreview(data.data.profile_picture);
        }
        
        // Reset trạng thái file đã chọn
        setProfilePicture(null);
        
        toast.success('Cập nhật thông tin thành công');
      } else {
        throw new Error(data.message || 'Cập nhật thất bại');
      }
    } catch (error: any) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      toast.error(error.message || 'Cập nhật thông tin thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center mb-6">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={picturePreview || ''} alt={user?.username || 'User profile'} />
          <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || 'ND'}</AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col items-center">
          <Label htmlFor="profile_picture" className="cursor-pointer bg-primary text-white px-4 py-2 rounded-md">
            Chọn ảnh đại diện
          </Label>
          <Input
            id="profile_picture"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {profilePicture && (
            <p className="text-sm text-gray-500 mt-2">{profilePicture.name}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Tên người dùng</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            readOnly
            disabled
            className="bg-gray-100 cursor-not-allowed"
            placeholder="Nhập tên người dùng"
          />
          <p className="text-xs text-gray-500 italic">Tên người dùng không thể thay đổi</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="full_name">Họ và tên</Label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name || ''}
            onChange={handleChange}
            placeholder="Nhập họ và tên đầy đủ"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
      </Button>
    </form>
  );
};

export default ProfileForm;
