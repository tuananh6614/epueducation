
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ProtectedRoute: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để truy cập trang này",
        variant: "destructive",
      });
    } else {
      setIsAuthenticated(true);
    }
  }, [toast]);

  if (isAuthenticated === null) {
    // Still checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Đang tải...</div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the outlet (child routes)
  return <Outlet />;
};

export default ProtectedRoute;
