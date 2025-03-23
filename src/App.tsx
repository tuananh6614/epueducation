
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import About from '@/pages/About';
import Courses from '@/pages/Courses';
import CourseDetail from '@/pages/CourseDetail';
import LessonView from '@/pages/LessonView';
import LessonContent from '@/pages/LessonContent';
import Blog from '@/pages/Blog';
import BlogDetail from '@/pages/BlogDetail';
import Resources from '@/pages/Resources';
import Profile from '@/pages/Profile';
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';
import ForgotPassword from '@/components/auth/ForgotPassword';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { NotificationWrapper } from '@/components/notifications/NotificationWrapper';
import AdminDeposits from '@/pages/AdminDeposits';
import PaymentResult from '@/pages/PaymentResult';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <NotificationWrapper>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/lessons/:id" element={<LessonView />} />
            <Route path="/lesson-content/:id" element={<LessonContent />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/payment-result" element={<PaymentResult />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute children={undefined} />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin-deposits" element={<AdminDeposits />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </BrowserRouter>
      </NotificationWrapper>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
