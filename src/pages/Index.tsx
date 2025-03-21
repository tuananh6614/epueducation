
import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/ui/hero-section';
import SectionHeading from '@/components/ui/section-heading';
import CourseCard from '@/components/ui/course-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, BarChart, BookOpen, CheckCircle2, Users } from 'lucide-react';
import { featuredCourses, featuredBlogPosts } from '@/data/mockData';
import { Link } from 'react-router-dom';

const Index = () => {
  const features = [
    {
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      title: "Comprehensive Courses",
      description: "Access a wide range of courses taught by industry experts and designed for all skill levels."
    },
    {
      icon: <CheckCircle2 className="h-10 w-10 text-primary" />,
      title: "Interactive Quizzes",
      description: "Test your knowledge with interactive quizzes and assessments for each course module."
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Community Learning",
      description: "Join a community of learners to share insights, ask questions, and collaborate."
    },
    {
      icon: <BarChart className="h-10 w-10 text-primary" />,
      title: "Progress Tracking",
      description: "Monitor your learning progress and achievements with detailed analytics and certificates."
    }
  ];

  return (
    <Layout>
      <HeroSection
        title="Elevate Your Skills with Expert-Led Courses"
        subtitle="Join our platform for interactive learning experiences, comprehensive courses, and knowledge-testing quizzes."
        imageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
        primaryAction={{ label: "Explore Courses", href: "/courses" }}
        secondaryAction={{ label: "Learn More", href: "/about" }}
      />

      {/* Featured Courses Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Featured Courses"
            subtitle="Explore our most popular and highly-rated courses"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div key={course.course_id} className="animate-scale-in opacity-0" style={{animationDelay: `${featuredCourses.indexOf(course) * 100}ms`, animationFillMode: 'forwards'}}>
                <CourseCard course={course} />
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/courses">
                View All Courses <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Why Choose QuizCourseHub"
            subtitle="We provide a complete learning ecosystem designed for your success"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-none bg-transparent glass">
                <CardContent className="p-6">
                  <div className="mb-5">{feature.icon}</div>
                  <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-slide-up" style={{animationDelay: '0ms'}}>
              <div className="text-4xl md:text-5xl font-display font-medium mb-2">100+</div>
              <div className="text-primary-foreground/80">Courses</div>
            </div>
            <div className="animate-slide-up" style={{animationDelay: '100ms'}}>
              <div className="text-4xl md:text-5xl font-display font-medium mb-2">50K+</div>
              <div className="text-primary-foreground/80">Students</div>
            </div>
            <div className="animate-slide-up" style={{animationDelay: '200ms'}}>
              <div className="text-4xl md:text-5xl font-display font-medium mb-2">200+</div>
              <div className="text-primary-foreground/80">Quizzes</div>
            </div>
            <div className="animate-slide-up" style={{animationDelay: '300ms'}}>
              <div className="text-4xl md:text-5xl font-display font-medium mb-2">99%</div>
              <div className="text-primary-foreground/80">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Latest From Our Blog"
            subtitle="Insights, tips, and updates from our education experts"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredBlogPosts.map((post) => (
              <Link key={post.post_id} to={`/blog/${post.post_id}`} className="group">
                <Card className="overflow-hidden glass h-full transition-all duration-300 hover:shadow-xl">
                  <div className="aspect-video overflow-hidden relative">
                    <img 
                      src={post.thumbnail} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} • {post.comments_count} comments
                    </div>
                    <h3 className="text-xl font-medium mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center">
                      <span className="font-medium">Read more</span>
                      <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/blog">
                View All Articles <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-medium mb-6">
              Ready to start your learning journey?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students already learning on our platform. Your next skill is just a click away.
            </p>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/register">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
