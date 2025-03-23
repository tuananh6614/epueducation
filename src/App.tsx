
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

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
import NotFound from '@/pages/NotFound';
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';
import ForgotPassword from '@/components/auth/ForgotPassword';

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/courses/:courseId/lessons/:lessonId" element={
              <ProtectedRoute>
                <LessonView />
              </ProtectedRoute>
            } />
            <Route path="/courses/:courseId/lessons/:lessonId/content" element={
              <ProtectedRoute>
                <LessonContent />
              </ProtectedRoute>
            } />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:postId" element={<BlogDetail />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
