
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import './App.css';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/Index'));
const AboutPage = lazy(() => import('./pages/About'));
const CoursesPage = lazy(() => import('./pages/Courses'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetail'));
const LessonContentPage = lazy(() => import('./pages/LessonContent'));
const LessonViewPage = lazy(() => import('./pages/LessonView'));
const BlogPage = lazy(() => import('./pages/Blog'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetail'));
const ResourcesPage = lazy(() => import('./pages/Resources'));
const LoginPage = lazy(() => import('./components/auth/Login'));
const RegisterPage = lazy(() => import('./components/auth/Register'));
const ForgotPasswordPage = lazy(() => import('./components/auth/ForgotPassword'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

// Protected route for authenticated users
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'));

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />
              <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonContentPage />} />
              <Route path="/lessons/view/:lessonId" element={<LessonViewPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:postId" element={<BlogDetailPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        
        {/* Add the Sonner Toaster component for notifications */}
        <Toaster position="top-right" expand={false} richColors closeButton />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
