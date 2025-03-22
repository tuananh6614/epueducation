
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, Clock, PlayCircle, BarChart, CheckCircle, User, Globe, Loader2 } from 'lucide-react';
import { Course } from '@/types';
import NotFound from './NotFound';
import { useToast } from '@/hooks/use-toast';

// Hàm để fetch chi tiết khóa học từ API
const fetchCourseDetail = async (courseId: string): Promise<any> => {
  const response = await fetch(`http://localhost:5000/api/courses/${courseId}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Không thể tải chi tiết khóa học');
  }
  
  return data.data;
};

// Hàm để fetch khóa học liên quan từ API
const fetchRelatedCourses = async (): Promise<Course[]> => {
  const response = await fetch('http://localhost:5000/api/courses');
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Không thể tải khóa học liên quan');
  }
  
  return data.data;
};

// CourseCard component
const CourseCard = ({ course }: { course: Course }) => {
  return (
    <Card className="h-full">
      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
        <img 
          src={course.thumbnail} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2 mb-2">
          {course.categories?.slice(0, 2).map((category, idx) => (
            <Badge key={idx} variant="outline">
              {category}
            </Badge>
          ))}
        </div>
        <h3 className="text-xl font-medium mb-2 line-clamp-2">
          <Link to={`/courses/${course.course_id}`} className="hover:text-primary">
            {course.title}
          </Link>
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {course.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Badge variant="outline" className="bg-green-500/20 hover:bg-green-500/30 text-green-700">Free</Badge>
          </div>
          <div className="font-medium">{course.enrolled} students</div>
        </div>
      </CardContent>
    </Card>
  );
};

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch course details
  const { 
    data: courseDetail, 
    isLoading: isLoadingDetail, 
    isError: isErrorDetail,
    error: errorDetail
  } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourseDetail(courseId || ''),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch related courses
  const { 
    data: relatedCourses = [], 
    isLoading: isLoadingRelated 
  } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchRelatedCourses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Filter related courses
  const filteredRelatedCourses = relatedCourses
    .filter(c => c.course_id !== Number(courseId))
    .filter(c => 
      c.categories?.some(cat => courseDetail?.categories?.includes(cat))
    )
    .slice(0, 3);
  
  // Show loading state
  if (isLoadingDetail) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Đang tải chi tiết khóa học...</p>
        </div>
      </Layout>
    );
  }
  
  // Show error state
  if (isErrorDetail || !courseDetail) {
    const errorMessage = errorDetail instanceof Error 
      ? errorDetail.message 
      : 'Không thể tải chi tiết khóa học';
      
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Đã xảy ra lỗi</h2>
          <p className="text-red-500 mb-6">{errorMessage}</p>
          <Button onClick={() => navigate('/courses')}>
            Quay lại danh sách khóa học
          </Button>
        </div>
      </Layout>
    );
  }
  
  // Mock data for the course
  const courseDetails = {
    lessons: courseDetail.lessons?.length || 0,
    duration: courseDetail.duration || '36 giờ',
    level: 'Trung cấp',
    language: 'Tiếng Việt',
    lastUpdated: '2 tháng trước',
    whatYouWillLearn: [
      'Xây dựng ứng dụng web hiện đại và có tính phản hồi',
      'Hiểu các khái niệm và mô hình lập trình cốt lõi',
      'Làm việc hiệu quả với cơ sở dữ liệu và API',
      'Triển khai ứng dụng lên môi trường sản xuất',
      'Áp dụng các biện pháp tốt nhất để đảm bảo bảo mật và hiệu suất',
      'Hợp tác với các nhà phát triển khác sử dụng công cụ chuyên nghiệp'
    ],
    curriculum: [
      {
        title: 'Bắt đầu',
        lessons: courseDetail.lessons?.slice(0, 3).map(lesson => ({
          title: lesson.title,
          duration: lesson.duration ? `${lesson.duration} phút` : '10 phút',
          isPreview: lesson.is_free
        })) || []
      },
      {
        title: 'Khái niệm cốt lõi',
        lessons: courseDetail.lessons?.slice(3, 7).map(lesson => ({
          title: lesson.title,
          duration: lesson.duration ? `${lesson.duration} phút` : '20 phút',
          isPreview: lesson.is_free
        })) || []
      },
      {
        title: 'Xây dựng dự án',
        lessons: courseDetail.lessons?.slice(7).map(lesson => ({
          title: lesson.title,
          duration: lesson.duration ? `${lesson.duration} phút` : '30 phút',
          isPreview: lesson.is_free
        })) || []
      }
    ],
    reviews: [
      {
        id: 1,
        name: 'Nguyễn Văn An',
        rating: 5,
        date: '2 tuần trước',
        comment: 'Khóa học này vượt quá mong đợi của tôi. Nội dung được cấu trúc tốt và giảng viên giải thích các khái niệm phức tạp theo cách dễ hiểu.'
      },
      {
        id: 2,
        name: 'Trần Thị Bình',
        rating: 4,
        date: '1 tháng trước',
        comment: 'Khóa học tuyệt vời với các ví dụ thực tế. Tôi đánh giá cao cách tiếp cận thực hành và các dự án thực tế giúp củng cố hiểu biết của tôi.'
      },
      {
        id: 3,
        name: 'Lê Minh Chí',
        rating: 5,
        date: '2 tháng trước',
        comment: 'Một trong những khóa học tốt nhất tôi từng học trực tuyến. Rất toàn diện và giảng viên có kiến thức sâu rộng về chủ đề.'
      }
    ]
  };

  const handleEnrollClick = () => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để đăng ký khóa học này.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    // If logged in, show success message
    toast({
      title: "Đăng ký thành công",
      description: `Bạn đã đăng ký khóa học "${courseDetail.title}" thành công.`,
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-muted/30 pt-10 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Course Info */}
            <div className="w-full md:w-3/5 animate-slide-up">
              <div className="flex flex-wrap gap-2 mb-4">
                {courseDetail.categories?.map((category: string) => (
                  <Badge key={category} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-4 leading-tight">
                {courseDetail.title}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-6">
                {courseDetail.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mb-8 text-sm">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Giảng viên: <strong>{courseDetail.instructorName || 'Giảng viên'}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <span><strong>{courseDetail.enrolled || 0}</strong> học viên</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{courseDetails.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{courseDetails.language}</span>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleEnrollClick}
              >
                Đăng ký học miễn phí
              </Button>
            </div>
            
            {/* Course Preview */}
            <div className="w-full md:w-2/5 animate-slide-up animation-delay-200">
              <div className="aspect-video rounded-lg overflow-hidden shadow-xl relative">
                <img 
                  src={courseDetail.thumbnail || 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e'} 
                  alt={courseDetail.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Button size="lg" variant="outline" className="rounded-full text-white border-white hover:bg-white/20">
                    <PlayCircle className="h-6 w-6 mr-2" />
                    Xem trước
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Details Tabs */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start mb-8 border-b rounded-none bg-transparent pb-px overflow-x-auto">
            <TabsTrigger value="overview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Chương trình học
            </TabsTrigger>
            <TabsTrigger value="instructor" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Giảng viên
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-medium mb-6">Những gì bạn sẽ học</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                  {courseDetails.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                
                <h2 className="text-2xl font-medium mb-6">Mô tả khóa học</h2>
                <div className="prose max-w-none mb-8">
                  <p className="mb-4">
                    Khóa học toàn diện này được thiết kế để đưa bạn vào hành trình khám phá các khái niệm cốt lõi và ứng dụng thực tế của {courseDetail.title}. Dù bạn là người mới bắt đầu muốn xây dựng nền tảng vững chắc hay chuyên gia có kinh nghiệm muốn trau dồi kỹ năng, khóa học này cung cấp những hiểu biết giá trị và trải nghiệm thực hành.
                  </p>
                  <p className="mb-4">
                    Trong suốt chương trình học, bạn sẽ làm việc trên các dự án thực tế giúp áp dụng các khái niệm đã học. Cách tiếp cận từng bước của chúng tôi đảm bảo rằng bạn không chỉ hiểu các khía cạnh lý thuyết mà còn có được kinh nghiệm thực tế có thể áp dụng trong hành trình chuyên môn của bạn.
                  </p>
                  <p>
                    Khi kết thúc khóa học này, bạn sẽ phát triển được một bộ kỹ năng mạnh mẽ giúp bạn tự tin giải quyết các dự án và thách thức trong lĩnh vực này. Hãy tham gia cùng chúng tôi và thực hiện bước đầu tiên hướng tới việc làm chủ {courseDetail.title}.
                  </p>
                </div>
              </div>
              
              <div className="md:col-span-1">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Khóa học bao gồm</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="h-5 w-5 text-muted-foreground" />
                        <span>{courseDetails.lessons} bài học video</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span>{courseDetails.duration} tổng thời lượng</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                        <span>Tài nguyên toàn diện</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <BarChart className="h-5 w-5 text-muted-foreground" />
                        <span>Theo dõi tiến độ</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <span>Truy cập trọn đời</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="curriculum" className="animate-fade-in">
            <h2 className="text-2xl font-medium mb-6">Chương trình khóa học</h2>
            <div className="space-y-4">
              {courseDetails.curriculum.map((section, index) => (
                <Accordion type="single" collapsible key={index}>
                  <AccordionItem value={`section-${index}`} className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 bg-muted/30 hover:bg-muted/50">
                      <div className="flex justify-between items-center w-full text-left pr-4">
                        <span className="font-medium">{section.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {section.lessons.length} bài học • {
                            section.lessons.reduce((total, lesson) => {
                              const minutes = parseInt(lesson.duration.split(' ')[0]);
                              return total + minutes;
                            }, 0)
                          } phút
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 pt-0">
                      <div className="divide-y">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="flex justify-between items-center p-4 hover:bg-muted/10">
                            <div className="flex items-center gap-3">
                              <PlayCircle className="h-5 w-5 text-muted-foreground" />
                              <span>{lesson.title}</span>
                              {lesson.isPreview && (
                                <Badge variant="outline" className="ml-2">Xem trước</Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="instructor" className="animate-fade-in">
            <div className="max-w-3xl">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-32 h-32 rounded-full overflow-hidden shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
                    alt={courseDetail.instructorName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-medium mb-2">{courseDetail.instructorName}</h2>
                  <p className="text-primary mb-4">Giảng viên chuyên gia</p>
                  <p className="text-muted-foreground mb-6">
                    Một nhà giáo dục nhiệt huyết với hơn 10 năm kinh nghiệm trong ngành, chuyên về {courseDetail.categories?.[0]}. Với nền tảng trong cả lý thuyết học thuật và ứng dụng thực tế, {courseDetail.instructorName?.split(' ')[0]} mang đến một góc nhìn độc đáo trong giảng dạy kết hợp kiến thức lý thuyết với những hiểu biết từ thực tế.
                  </p>
                  <Button variant="outline">Xem hồ sơ</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Recommended Courses */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-medium mb-8">Khóa học liên quan</h2>
          {isLoadingRelated ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredRelatedCourses.length > 0 ? (
                filteredRelatedCourses.map((relatedCourse) => (
                  <div key={relatedCourse.course_id} className="animate-scale-in opacity-0" style={{animationDelay: `${filteredRelatedCourses.indexOf(relatedCourse) * 100}ms`, animationFillMode: 'forwards'}}>
                    <CourseCard course={relatedCourse} />
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-muted-foreground">Không có khóa học liên quan</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-medium mb-6">
            Sẵn sàng bắt đầu học?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn học viên đang học khóa học này và nâng cao kỹ năng của bạn ngay hôm nay.
          </p>
          <Button 
            size="lg" 
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleEnrollClick}
          >
            Đăng ký học miễn phí
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetail;
