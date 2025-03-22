
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Resource, Purchase } from "@/types";
import ProfileForm from "@/components/profile/ProfileForm";
import PasswordForm from "@/components/profile/PasswordForm";
import ResourceList from "@/components/profile/ResourceList";
import { toast } from "sonner";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userStr || !token) {
      navigate('/login');
      return;
    }

    fetchUserData(token);
    fetchPurchasedResources(token);
  }, [navigate]);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải thông tin người dùng');
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      } else {
        throw new Error(data.message || 'Lỗi không xác định');
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin người dùng:', error);
      toast.error('Không thể tải thông tin người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPurchasedResources = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/resources/purchased', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải tài liệu đã mua');
      }

      const data = await response.json();
      if (data.success) {
        setPurchases(data.data.purchases);
        setResources(data.data.resources);
      } else {
        throw new Error(data.message || 'Lỗi không xác định');
      }
    } catch (error) {
      console.error('Lỗi khi tải tài liệu đã mua:', error);
      toast.error('Không thể tải tài liệu đã mua');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Cập nhật thông tin người dùng trong localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const storedUser = JSON.parse(userStr);
      localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        username: updatedUser.username,
        email: updatedUser.email,
        full_name: updatedUser.full_name
      }));
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-16 min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-primary">Đang tải...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 md:px-0 min-h-screen">
        <h1 className="text-3xl font-bold mb-8">Trang cá nhân</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user?.profile_picture || ''} />
                    <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || 'ND'}</AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-xl font-bold">{user?.full_name || user?.username}</h2>
                  <p className="text-gray-500">{user?.email}</p>
                  
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg w-full text-center">
                    <p className="text-sm text-gray-600">Số dư tài khoản</p>
                    <p className="text-xl font-bold">{user?.balance?.toLocaleString()} VNĐ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-3">
            <Tabs defaultValue="info">
              <TabsList className="w-full">
                <TabsTrigger value="info" className="flex-1">Thông tin cá nhân</TabsTrigger>
                <TabsTrigger value="password" className="flex-1">Đổi mật khẩu</TabsTrigger>
                <TabsTrigger value="resources" className="flex-1">Tài liệu đã mua</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <ProfileForm user={user} updateUser={updateUser} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="password" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <PasswordForm />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="resources" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <ResourceList resources={resources} purchases={purchases} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
