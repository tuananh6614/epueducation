
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const useAuthCheck = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const checkAuth = (action: string): boolean => {
    const user = localStorage.getItem('user');
    
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: `Vui lòng đăng nhập để ${action}.`,
        variant: "destructive",
      });
      navigate('/login');
      return false;
    }
    
    return true;
  };
  
  return checkAuth;
};
