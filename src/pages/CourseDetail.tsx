
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { allCourses, featuredLessons } from '@/data/mockData';
import { BookOpen, Clock, Award, PlayCircle, BarChart, CheckCircle, User, Star, Globe } from 'lucide-react';
import { Course } from '@/types';
import NotFound from './NotFound';

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
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm">{course.rating}</span>
          </div>
          <div className="font-medium">${course.price?.toFixed(2)}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Find the course by ID
  const course = allCourses.find((c) => c.course_id === Number(courseId));
  
  if (!course) {
    return <NotFound />;
  }

  // Mock data for the course
  const courseDetails = {
    lessons: 42,
    duration: course.duration || '36 hours',
    level: 'Intermediate',
    language: 'English',
    certificate: true,
    lastUpdated: '2 months ago',
    whatYouWillLearn: [
      'Build modern and responsive web applications',
      'Understand core programming concepts and patterns',
      'Work with databases and APIs effectively',
      'Deploy applications to production environments',
      'Implement best practices for security and performance',
      'Collaborate with other developers using industry tools'
    ],
    curriculum: [
      {
        title: 'Getting Started',
        lessons: [
          { title: 'Course Introduction', duration: '10 min', isPreview: true },
          { title: 'Setting Up Your Environment', duration: '20 min', isPreview: false },
          { title: 'Understanding the Basics', duration: '25 min', isPreview: false }
        ]
      },
      {
        title: 'Core Concepts',
        lessons: [
          { title: 'Fundamental Principles', duration: '30 min', isPreview: true },
          { title: 'Advanced Techniques', duration: '45 min', isPreview: false },
          { title: 'Practical Applications', duration: '40 min', isPreview: false },
          { title: 'Problem Solving Approaches', duration: '35 min', isPreview: false }
        ]
      },
      {
        title: 'Building Projects',
        lessons: [
          { title: 'Project Planning', duration: '25 min', isPreview: false },
          { title: 'Implementation Strategies', duration: '50 min', isPreview: false },
          { title: 'Testing and Debugging', duration: '40 min', isPreview: false },
          { title: 'Deployment and Maintenance', duration: '35 min', isPreview: false }
        ]
      }
    ],
    reviews: [
      {
        id: 1,
        name: 'Alex Thompson',
        rating: 5,
        date: '2 weeks ago',
        comment: 'This course exceeded my expectations. The content is well-structured and the instructor explains complex concepts in a way that\'s easy to understand.'
      },
      {
        id: 2,
        name: 'Sophia Rodriguez',
        rating: 4,
        date: '1 month ago',
        comment: 'Great course with practical examples. I appreciate the hands-on approach and the projects really helped solidify my understanding.'
      },
      {
        id: 3,
        name: 'Marcus Johnson',
        rating: 5,
        date: '2 months ago',
        comment: 'One of the best courses I\'ve taken online. Very comprehensive and the instructor is clearly knowledgeable about the subject matter.'
      }
    ]
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
                {course.categories?.map((category) => (
                  <Badge key={category} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-4 leading-tight">
                {course.title}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-6">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mb-8 text-sm">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Instructor: <strong>{course.instructorName}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span><strong>{course.rating}</strong> ({course.enrolled} students)</span>
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
              
              <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Enroll Now for ${course.price?.toFixed(2)}
              </Button>
            </div>
            
            {/* Course Preview */}
            <div className="w-full md:w-2/5 animate-slide-up animation-delay-200">
              <div className="aspect-video rounded-lg overflow-hidden shadow-xl relative">
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Button size="lg" variant="outline" className="rounded-full text-white border-white hover:bg-white/20">
                    <PlayCircle className="h-6 w-6 mr-2" />
                    Watch Preview
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
              Overview
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Curriculum
            </TabsTrigger>
            <TabsTrigger value="instructor" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Instructor
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Reviews
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-medium mb-6">What You'll Learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                  {courseDetails.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                
                <h2 className="text-2xl font-medium mb-6">Course Description</h2>
                <div className="prose max-w-none mb-8">
                  <p className="mb-4">
                    This comprehensive course is designed to take you on a journey through the core concepts and practical applications of {course.title}. Whether you're a beginner looking to establish a solid foundation or an experienced professional aiming to refine your skills, this course offers valuable insights and hands-on experience.
                  </p>
                  <p className="mb-4">
                    Throughout the curriculum, you'll work on real-world projects that will help you apply the concepts you learn. Our step-by-step approach ensures that you not only understand the theoretical aspects but also gain practical experience that you can leverage in your professional journey.
                  </p>
                  <p>
                    By the end of this course, you'll have developed a robust skill set that will enable you to confidently tackle projects and challenges in this field. Join us and take the first step towards mastering {course.title}.
                  </p>
                </div>
              </div>
              
              <div className="md:col-span-1">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Course Includes</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="h-5 w-5 text-muted-foreground" />
                        <span>{courseDetails.lessons} video lessons</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span>{courseDetails.duration} total duration</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                        <span>Comprehensive resources</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <BarChart className="h-5 w-5 text-muted-foreground" />
                        <span>Progress tracking</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <span>Full lifetime access</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-muted-foreground" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="curriculum" className="animate-fade-in">
            <h2 className="text-2xl font-medium mb-6">Course Curriculum</h2>
            <div className="space-y-4">
              {courseDetails.curriculum.map((section, index) => (
                <Accordion type="single" collapsible key={index}>
                  <AccordionItem value={`section-${index}`} className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 bg-muted/30 hover:bg-muted/50">
                      <div className="flex justify-between items-center w-full text-left pr-4">
                        <span className="font-medium">{section.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {section.lessons.length} lessons • {
                            section.lessons.reduce((total, lesson) => {
                              const minutes = parseInt(lesson.duration.split(' ')[0]);
                              return total + minutes;
                            }, 0)
                          } min
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
                                <Badge variant="outline" className="ml-2">Preview</Badge>
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
                    alt={course.instructorName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-medium mb-2">{course.instructorName}</h2>
                  <p className="text-primary mb-4">Expert Instructor</p>
                  <p className="text-muted-foreground mb-6">
                    A passionate educator with over 10 years of industry experience, specializing in {course.categories?.[0]}. With a background in both academic and practical applications, {course.instructorName?.split(' ')[0]} brings a unique perspective to teaching that blends theoretical knowledge with real-world insights.
                  </p>
                  <Button variant="outline">View Profile</Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="animate-fade-in">
            <div className="max-w-3xl">
              <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                <div className="text-center md:text-left">
                  <div className="text-5xl font-medium mb-2">{course.rating}</div>
                  <div className="flex items-center mb-1 justify-center md:justify-start">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.floor(course.rating || 0) ? 'text-yellow-500' : 'text-muted'}`} fill={i < Math.floor(course.rating || 0) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">Course Rating</div>
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-xl font-medium mb-4">Student Reviews</h3>
                  <div className="space-y-6">
                    {courseDetails.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-0">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">{review.name}</div>
                          <div className="text-sm text-muted-foreground">{review.date}</div>
                        </div>
                        <div className="flex items-center mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500' : 'text-muted'}`} fill={i < review.rating ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button>Load More Reviews</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Recommended Courses */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-medium mb-8">Related Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {allCourses
              .filter(c => c.course_id !== course.course_id)
              .filter(c => 
                c.categories?.some(cat => course.categories?.includes(cat))
              )
              .slice(0, 3)
              .map((relatedCourse) => (
                <div key={relatedCourse.course_id} className="animate-scale-in opacity-0" style={{animationDelay: `${allCourses.indexOf(relatedCourse) * 100}ms`, animationFillMode: 'forwards'}}>
                  <CourseCard course={relatedCourse} />
                </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-medium mb-6">
            Ready to start learning?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students already taking this course and advance your skills today.
          </p>
          <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            Enroll Now for ${course.price?.toFixed(2)}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetail;
