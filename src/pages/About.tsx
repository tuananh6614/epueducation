
import React from 'react';
import Layout from '@/components/layout/Layout';
import SectionHeading from '@/components/ui/section-heading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Lightbulb, Goal, Mail, Phone, MapPin } from 'lucide-react';

const About = () => {
  const team = [
    {
      name: 'Nguyễn Văn A',
      role: 'Nhà sáng lập & CEO',
      bio: 'Chuyên gia giáo dục với hơn 10 năm kinh nghiệm phát triển các nền tảng học tập trực tuyến.',
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
      name: 'Trần Thị B',
      role: 'Giám đốc nội dung',
      bio: 'Tiến sĩ Giáo dục với niềm đam mê tạo ra các khóa học dễ tiếp cận và hiệu quả.',
      image: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    {
      name: 'Lê Văn C',
      role: 'Trưởng phòng Công nghệ',
      bio: 'Kỹ sư phần mềm với hơn 8 năm xây dựng các nền tảng học tập tương tác.',
      image: 'https://randomuser.me/api/portraits/men/3.jpg',
    },
    {
      name: 'Phạm Thị D',
      role: 'Quản lý cộng đồng',
      bio: 'Chuyên gia truyền thông với niềm đam mê tạo dựng cộng đồng học tập năng động.',
      image: 'https://randomuser.me/api/portraits/women/4.jpg',
    },
  ];

  const faqs = [
    {
      question: 'QuizCourseHub là gì?',
      answer: 'QuizCourseHub là nền tảng học tập trực tuyến cung cấp các khóa học chất lượng cao, bài kiểm tra, tài nguyên và cộng đồng học tập cho người dùng. Chúng tôi tập trung vào việc tạo ra trải nghiệm học tập tương tác và hiệu quả.',
    },
    {
      question: 'Làm thế nào để bắt đầu học?',
      answer: 'Để bắt đầu, bạn chỉ cần đăng ký tài khoản miễn phí, sau đó duyệt qua danh mục khóa học và đăng ký khóa học bạn quan tâm. Sau khi đăng ký, bạn có thể truy cập ngay vào nội dung khóa học.',
    },
    {
      question: 'Các khóa học có chứng chỉ không?',
      answer: 'Có, hầu hết các khóa học của chúng tôi đều cung cấp chứng chỉ hoàn thành. Sau khi hoàn thành tất cả các bài học và vượt qua bài kiểm tra cuối cùng, bạn sẽ nhận được chứng chỉ số mà bạn có thể chia sẻ trên hồ sơ nghề nghiệp của mình.',
    },
    {
      question: 'Tôi có thể truy cập khóa học trên thiết bị di động không?',
      answer: 'Có, nền tảng của chúng tôi hoạt động tốt trên tất cả các thiết bị, bao gồm máy tính để bàn, máy tính xách tay, máy tính bảng và điện thoại thông minh. Bạn có thể học bất cứ lúc nào, bất cứ nơi đâu.',
    },
    {
      question: 'Làm thế nào để liên hệ với hỗ trợ?',
      answer: 'Bạn có thể liên hệ với đội ngũ hỗ trợ của chúng tôi thông qua biểu mẫu liên hệ trên trang web, email support@quizcoursehub.com, hoặc qua các kênh mạng xã hội của chúng tôi. Chúng tôi thường phản hồi trong vòng 24 giờ.',
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="mb-20 text-center max-w-4xl mx-auto">
          <SectionHeading
            title="Về QuizCourseHub"
            subtitle="Sứ mệnh của chúng tôi là cung cấp nền giáo dục chất lượng cao, dễ tiếp cận cho mọi người, mọi nơi"
            align="center"
            className="mb-8"
          />
          <p className="text-lg text-muted-foreground mb-10">
            Được thành lập vào năm 2020, QuizCourseHub đã nhanh chóng trở thành một trong những nền tảng học tập trực tuyến hàng đầu tại Việt Nam, phục vụ hơn 50,000 học viên với hơn 200 khóa học chất lượng cao.
          </p>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="mission" className="mb-20">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="mission" className="text-center py-3">
              <div className="flex flex-col items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                <span>Sứ mệnh</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="vision" className="text-center py-3">
              <div className="flex flex-col items-center gap-2">
                <Goal className="h-5 w-5" />
                <span>Tầm nhìn</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="values" className="text-center py-3">
              <div className="flex flex-col items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Giá trị cốt lõi</span>
              </div>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="mission" className="p-6 bg-muted/40 rounded-lg">
            <h3 className="text-2xl font-medium mb-4">Sứ mệnh của chúng tôi</h3>
            <p className="mb-4">
              Chúng tôi tin rằng giáo dục chất lượng cao nên dễ tiếp cận với tất cả mọi người. Sứ mệnh của chúng tôi là phá vỡ rào cản truyền thống và cung cấp trải nghiệm học tập hiệu quả, tương tác và cá nhân hóa cho người học ở mọi lứa tuổi và nền tảng.
            </p>
            <p>
              Thông qua nền tảng của mình, chúng tôi kết nối học viên với các chuyên gia hàng đầu trong nhiều lĩnh vực, cung cấp các công cụ học tập hiện đại và xây dựng cộng đồng hỗ trợ nơi người học có thể phát triển cùng nhau.
            </p>
          </TabsContent>
          <TabsContent value="vision" className="p-6 bg-muted/40 rounded-lg">
            <h3 className="text-2xl font-medium mb-4">Tầm nhìn của chúng tôi</h3>
            <p className="mb-4">
              Chúng tôi hướng tới việc trở thành nền tảng giáo dục trực tuyến hàng đầu ở Việt Nam, nơi mọi người có thể tìm thấy các khóa học chất lượng cao để phát triển kỹ năng, mở rộng kiến thức và đạt được mục tiêu của họ.
            </p>
            <p>
              Tầm nhìn của chúng tôi là một thế giới nơi học tập suốt đời trở thành một phần tự nhiên của cuộc sống, nơi mọi người được trao quyền để theo đuổi đam mê và phát triển tiềm năng đầy đủ của họ thông qua giáo dục.
            </p>
          </TabsContent>
          <TabsContent value="values" className="p-6 bg-muted/40 rounded-lg">
            <h3 className="text-2xl font-medium mb-4">Giá trị cốt lõi của chúng tôi</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 p-1.5 rounded-full text-primary mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Chất lượng</h4>
                  <p className="text-muted-foreground">Chúng tôi cam kết cung cấp nội dung và trải nghiệm giáo dục chất lượng cao.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 p-1.5 rounded-full text-primary mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Tiếp cận</h4>
                  <p className="text-muted-foreground">Chúng tôi tin rằng giáo dục nên dễ tiếp cận và phù hợp với mọi người.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 p-1.5 rounded-full text-primary mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Đổi mới</h4>
                  <p className="text-muted-foreground">Chúng tôi liên tục khám phá các phương pháp và công nghệ mới để cải thiện trải nghiệm học tập.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 p-1.5 rounded-full text-primary mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Cộng đồng</h4>
                  <p className="text-muted-foreground">Chúng tôi tin vào sức mạnh của việc học tập cộng đồng và hỗ trợ lẫn nhau.</p>
                </div>
              </li>
            </ul>
          </TabsContent>
        </Tabs>

        {/* Team Section */}
        <section className="mb-20">
          <SectionHeading
            title="Đội ngũ của chúng tôi"
            subtitle="Gặp gỡ những người đam mê và tài năng đang cùng nhau xây dựng QuizCourseHub"
            align="center"
            className="mb-12"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <Card key={member.name} className="text-center">
                <CardHeader className="pt-8 px-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-medium">{member.name}</h3>
                  <p className="text-primary font-medium">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20">
          <SectionHeading
            title="Câu hỏi thường gặp"
            subtitle="Tìm câu trả lời cho những câu hỏi phổ biến về QuizCourseHub"
            align="center"
            className="mb-12"
          />
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <SectionHeading
            title="Liên hệ với chúng tôi"
            subtitle="Chúng tôi luôn sẵn sàng trả lời mọi câu hỏi của bạn"
            align="center"
            className="mb-12"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader className="pb-2">
                <div className="mx-auto bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-lg">Email</h3>
              </CardHeader>
              <CardContent>
                <p className="text-primary">info@quizcoursehub.com</p>
                <p className="text-muted-foreground text-sm mt-1">Phản hồi trong vòng 24 giờ</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader className="pb-2">
                <div className="mx-auto bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-lg">Điện thoại</h3>
              </CardHeader>
              <CardContent>
                <p className="text-primary">+84 123 456 789</p>
                <p className="text-muted-foreground text-sm mt-1">Thứ Hai - Thứ Sáu, 9:00 - 17:00</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader className="pb-2">
                <div className="mx-auto bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-lg">Địa chỉ</h3>
              </CardHeader>
              <CardContent>
                <p className="text-primary">123 Đường Nguyễn Huệ</p>
                <p className="text-muted-foreground text-sm mt-1">Quận 1, TP. Hồ Chí Minh</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
