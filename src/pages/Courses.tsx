
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import SectionHeading from '@/components/ui/section-heading';
import CourseCard from '@/components/ui/course-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { Course } from '@/types';
import { useToast } from '@/hooks/use-toast';
import AddSampleCourse from '@/components/admin/AddSampleCourse';

// Hàm để fetch dữ liệu khóa học từ API
const fetchCourses = async (): Promise<Course[]> => {
  const response = await fetch('http://localhost:5000/api/courses');
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Không thể tải danh sách khóa học');
  }
  
  return data.data;
};

const Courses = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [isAdmin] = useState(() => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
    return user && user.username === 'admin';
  });

  // Fetch courses using React Query
  const { data: courses = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract all unique categories
  useEffect(() => {
    if (courses.length > 0) {
      const categories = Array.from(
        new Set(courses.flatMap((course) => course.categories || []))
      ).sort();
      setAllCategories(categories);
    }
  }, [courses]);

  // Filter courses based on search term and selected categories
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (course.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesCategories = selectedCategories.length === 0 || 
                             course.categories?.some(category => selectedCategories.includes(category));
    
    return matchesSearch && matchesCategories;
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => 
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
  };

  const handleRefreshCourses = () => {
    refetch();
    toast({
      title: "Đang làm mới danh sách khóa học",
      description: "Đang tải dữ liệu mới nhất từ máy chủ",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
          <SectionHeading
            title="Khám phá khóa học của chúng tôi"
            subtitle="Tìm hiểu nhiều khóa học được thiết kế để giúp bạn đạt được mục tiêu học tập"
            className="mb-0"
          />
          <div className="flex items-center gap-2">
            {isAdmin && <AddSampleCourse />}
            <Button onClick={handleRefreshCourses} variant="outline" size="sm">
              Làm mới danh sách
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                className="pl-10 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="md:w-auto flex items-center gap-2"
              onClick={() => setFiltersVisible(!filtersVisible)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Bộ lọc
              {selectedCategories.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedCategories.length}
                </Badge>
              )}
            </Button>
            {(searchTerm || selectedCategories.length > 0) && (
              <Button 
                variant="ghost" 
                className="md:w-auto flex items-center gap-2"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
                Xóa
              </Button>
            )}
          </div>

          {filtersVisible && (
            <div className="bg-muted/40 p-6 rounded-lg mb-6 animate-scale-in">
              <h3 className="font-medium mb-4">Danh mục</h3>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Đang tải khóa học...</p>
          </div>
        )}

        {isError && (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <h3 className="text-xl font-medium mb-2 text-red-700">Đã xảy ra lỗi</h3>
            <p className="text-red-600 mb-4">
              {error instanceof Error ? error.message : 'Không thể tải danh sách khóa học'}
            </p>
            <Button variant="destructive" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        )}

        {/* Courses Grid */}
        {!isLoading && !isError && (
          <>
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course) => (
                  <div key={course.course_id} className="animate-scale-in opacity-0" style={{animationDelay: `${filteredCourses.indexOf(course) * 100}ms`, animationFillMode: 'forwards'}}>
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium mb-2">Không tìm thấy khóa học</h3>
                <p className="text-muted-foreground mb-6">
                  Hãy điều chỉnh tìm kiếm hoặc bộ lọc của bạn
                </p>
                <Button onClick={clearFilters}>Xóa tất cả bộ lọc</Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Courses;
