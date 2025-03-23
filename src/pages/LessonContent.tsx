
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Save } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lesson } from '@/types';

const LessonContent = () => {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessonContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}/lessons/${lessonId}`);
        const data = await response.json();
        
        if (data.success) {
          setLesson(data.data);
          setContent(data.data.content || '');
        } else {
          toast({
            title: "Lỗi",
            description: data.message || "Không thể tải nội dung bài học",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Lỗi kết nối",
          description: "Không thể kết nối đến máy chủ",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId && lessonId) {
      fetchLessonContent();
    }
  }, [courseId, lessonId, toast]);

  const handleSaveContent = async () => {
    if (!courseId || !lessonId) return;

    try {
      setIsSaving(true);
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Lưu thành công",
          description: "Nội dung bài học đã được cập nhật",
        });
      } else {
        toast({
          title: "Lỗi",
          description: data.message || "Không thể lưu nội dung bài học",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến máy chủ",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Đang tải nội dung bài học...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium">{lesson?.title || 'Nội dung bài học'}</h1>
          <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
            Quay lại khóa học
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa nội dung bài học</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung bài học ở đây..."
              className="min-h-[300px] mb-4"
            />
            <Button 
              onClick={handleSaveContent} 
              disabled={isSaving}
              className="w-full md:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default LessonContent;
