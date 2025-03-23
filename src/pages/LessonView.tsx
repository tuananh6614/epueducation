
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, BookOpen, Video, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthCheck } from '@/utils/authCheck';
import { Lesson } from '@/types';

const fetchLessonDetail = async (courseId: string, lessonId: string): Promise<any> => {
  const response = await fetch(`http://localhost:5000/api/courses/${courseId}/lessons/${lessonId}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Không thể tải chi tiết bài học');
  }
  
  return data.data;
};

const fetchCourseDetail = async (courseId: string): Promise<any> => {
  const response = await fetch(`http://localhost:5000/api/courses/${courseId}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Không thể tải chi tiết khóa học');
  }
  
  return data.data;
};

const fetchEnrollmentStatus = async (courseId: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    const response = await fetch(`http://localhost:5000/api/courses/${courseId}/enrollment-status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.isEnrolled;
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    return false;
  }
};

const LessonView = () => {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const checkAuth = useAuthCheck();
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  useEffect(() => {
    // Check if the user is authenticated and enrolled in the course
    if (!checkAuth('xem bài học này')) {
      return;
    }
    
    if (courseId) {
      fetchEnrollmentStatus(courseId).then(status => {
        setIsEnrolled(status);
      });
    }
  }, [courseId, checkAuth]);
  
  const { 
    data: lesson, 
    isLoading: isLoadingLesson, 
    isError: isErrorLesson 
  } = useQuery({
    queryKey: ['lesson', courseId, lessonId],
    queryFn: () => fetchLessonDetail(courseId || '', lessonId || ''),
    enabled: !!courseId && !!lessonId,
  });
  
  const { 
    data: course, 
    isLoading: isLoadingCourse, 
    isError: isErrorCourse 
  } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourseDetail(courseId || ''),
    enabled: !!courseId,
  });
  
  const isLoading = isLoadingLesson || isLoadingCourse;
  const isError = isErrorLesson || isErrorCourse;
  
  // Find the previous and next lessons
  const currentLessonIndex = course?.lessons?.findIndex((l: Lesson) => 
    l.lesson_id === Number(lessonId)
  );
  
  const prevLesson = currentLessonIndex > 0 
    ? course?.lessons[currentLessonIndex - 1] 
    : null;
    
  const nextLesson = currentLessonIndex < (course?.lessons?.length - 1) 
    ? course?.lessons[currentLessonIndex + 1] 
    : null;
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Đang tải bài học...</p>
        </div>
      </Layout>
    );
  }
  
  if (isError || !lesson || !course) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Đã xảy ra lỗi</h2>
          <p className="text-red-500 mb-6">Không thể tải bài học</p>
          <Button onClick={() => navigate(`/courses/${courseId}`)}>
            Quay lại khóa học
          </Button>
        </div>
      </Layout>
    );
  }
  
  // Check if the user can access the lesson
  const canAccess = isEnrolled || lesson.is_free;
  
  if (!canAccess) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Bạn chưa đăng ký khóa học này</h2>
          <p className="mb-6">Vui lòng đăng ký khóa học để xem bài học này</p>
          <Button onClick={() => navigate(`/courses/${courseId}`)}>
            Đăng ký khóa học
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to={`/courses/${courseId}`} className="inline-flex items-center text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại khóa học
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-medium mb-4">{lesson.title}</h1>
            
            <Tabs defaultValue="content">
              <TabsList className="mb-4">
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Nội dung
                </TabsTrigger>
                {lesson.video_link && (
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="content" className="animate-fade-in">
                <Card>
                  <CardContent className="p-6 prose max-w-none">
                    {lesson.content ? (
                      <div dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br />') }} />
                    ) : (
                      <p className="text-muted-foreground">Bài học này chưa có nội dung</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="video" className="animate-fade-in">
                {lesson.video_link ? (
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src={lesson.video_link}
                      title={lesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground">Bài học này không có video</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between mt-8">
              {prevLesson ? (
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/courses/${courseId}/lessons/${prevLesson.lesson_id}`)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Bài trước
                </Button>
              ) : (
                <div></div>
              )}
              
              {nextLesson && (
                <Button 
                  onClick={() => navigate(`/courses/${courseId}/lessons/${nextLesson.lesson_id}`)}
                  className="flex items-center gap-2"
                >
                  Bài tiếp theo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Nội dung khóa học</h3>
                <div className="space-y-4">
                  {course.lessons.map((courseLesson: Lesson, index: number) => {
                    const isCurrent = courseLesson.lesson_id === Number(lessonId);
                    
                    return (
                      <div key={courseLesson.lesson_id}>
                        <div className={`flex items-center gap-3 py-2 px-3 rounded-md ${isCurrent ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'}`}>
                          <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                            {index + 1}
                          </span>
                          <Link 
                            to={`/courses/${courseId}/lessons/${courseLesson.lesson_id}`}
                            className="flex-1 hover:underline"
                          >
                            {courseLesson.title}
                          </Link>
                        </div>
                        {index < course.lessons.length - 1 && <Separator className="my-2" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LessonView;
