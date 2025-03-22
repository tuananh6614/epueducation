
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { Course } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the Link navigation
    
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
    
    // If logged in, navigate to course detail
    navigate(`/courses/${course.course_id}`);
  };

  return (
    <Link to={`/courses/${course.course_id}`} onClick={handleEnrollClick}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl h-full glass">
        <div className="relative aspect-video overflow-hidden">
          <div
            className={`absolute inset-0 bg-muted animate-pulse ${
              imageLoaded ? 'hidden' : 'block'
            }`}
          />
          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e'}
            alt={course.title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {course.isFeatured && (
            <Badge className="absolute top-3 left-3 bg-primary/90 hover:bg-primary">
              Featured
            </Badge>
          )}
          <Badge className="absolute bottom-3 right-3 bg-green-500/90 hover:bg-green-500">
            Free
          </Badge>
        </div>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            {course.categories?.slice(0, 2).map((category) => (
              <Badge key={category} variant="outline" className="bg-muted/50">
                {category}
              </Badge>
            ))}
          </div>
          <h3 className="font-medium text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
            {course.description}
          </p>
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">{course.enrolled || 0} students</div>
          </div>
        </CardContent>
        <CardFooter className="px-5 pb-5 pt-0 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {course.duration || '30+ hours'}
          </div>
          <div className="text-sm font-medium">By {course.instructorName || 'Instructor'}</div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CourseCard;
