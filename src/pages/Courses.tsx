
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import SectionHeading from '@/components/ui/section-heading';
import CourseCard from '@/components/ui/course-card';
import { allCourses } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Extract all unique categories
  const allCategories = Array.from(
    new Set(allCourses.flatMap((course) => course.categories || []))
  ).sort();

  // Filter courses based on search term and selected categories
  const filteredCourses = allCourses.filter((course) => {
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <SectionHeading
          title="Khám phá khóa học của chúng tôi"
          subtitle="Tìm hiểu nhiều khóa học được thiết kế để giúp bạn đạt được mục tiêu học tập"
          className="mb-12"
        />

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

        {/* Courses Grid */}
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
      </div>
    </Layout>
  );
};

export default Courses;
