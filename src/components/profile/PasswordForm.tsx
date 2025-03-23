
import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp với xác nhận mật khẩu');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Bạn chưa đăng nhập');
      }

      // Thay đổi từ /api/user/change-password thành /api/users/change-password
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Đổi mật khẩu thành công');
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(data.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error: any) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      toast.error(error.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="newPassword">Mật khẩu mới</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
      </Button>
    </form>
  );
};

export default PasswordForm;
