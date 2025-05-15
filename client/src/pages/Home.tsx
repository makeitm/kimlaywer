import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Scale,
  Briefcase,
  Clock,
  Coins,
  GraduationCap,
  Info,
  MapPin,
  Phone,
  Scroll,
  User2,
  Home as HomeIcon,
  Youtube
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Form schema
const inquiryFormSchema = z.object({
  name: z.string().min(1, { message: "성함을 입력해주세요" }),
  phone: z.string().min(1, { message: "연락처를 입력해주세요" }),
  email: z.string().email({ message: "올바른 이메일 형식이 아닙니다" }).optional().or(z.literal("")),
  inquiryType: z.string().min(1, { message: "상담 분야를 선택해주세요" }),
  message: z.string().min(10, { message: "최소 10자 이상 입력해주세요" }),
  privacy: z.boolean().refine(val => val === true, {
    message: "개인정보 수집 및 이용에 동의해주세요",
  }),
});

type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

// Services data
const services = [
  {
    id: 1,
    title: "이혼소송",
    icon: <Scale className="text-primary text-2xl" />,
    description: "협의이혼, 재판상 이혼 등 이혼과정에서 의뢰인의 권리를 최대한 보호하고 가장 합리적인 해결방안을 제시합니다."
  },
  {
    id: 2,
    title: "재산분할",
    icon: <Coins className="text-primary text-2xl" />,
    description: "혼인기간 동안 형성된 재산을 공정하게 분할받을 수 있도록 전문적인 법률 조언과 대응 전략을 제공합니다."
  },
  {
    id: 3,
    title: "양육권",
    icon: <User2 className="text-primary text-2xl" />,
    description: "자녀의 복리를 최우선으로 고려하여 양육권, 친권, 양육비, 면접교섭권 등의 문제를 해결합니다."
  },
  {
    id: 4,
    title: "상간소송",
    icon: <GraduationCap className="text-primary text-2xl" />,
    description: "배우자의 부정행위로 인한 정신적 고통에 대한 위자료 청구를 위한 법적 절차를 지원합니다."
  },
  {
    id: 5,
    title: "상속소송",
    icon: <Scroll className="text-primary text-2xl" />,
    description: "상속 재산 분배, 유언장 효력, 상속포기 등 상속과 관련된 모든 법적 문제에 대한 전문적인 서비스를 제공합니다."
  },
  {
    id: 6,
    title: "가사소송",
    icon: <HomeIcon className="text-primary text-2xl" />,
    description: "가족 관계에서 발생하는 다양한 법적 분쟁을 합리적으로 해결하여 의뢰인의 안정을 도모합니다."
  }
];

// Case studies data
const caseStudies = [
  {
    id: 1,
    title: "재산분할 사례",
    client: "40대 여성 의뢰인",
    description: "20년간의 결혼 생활 중 남편 명의로 된 재산이 대부분이었으나, 실질적인 기여도를 입증하여 공동재산으로 인정받아 50%의 재산분할을 이끌어낸 사례입니다. 특히 사업자금으로 사용된 재산에 대한 기여도를 인정받는 것이 핵심이었습니다.",
    quote: "숨겨진 재산까지 찾아내어 공정한 분할이 이루어지도록 도움을 주셨습니다."
  },
  {
    id: 2,
    title: "양육권 분쟁 해결",
    client: "30대 남성 의뢰인",
    description: "이혼 과정에서 자녀 양육권을 두고 심각한 갈등 상황이었으나, 아버지의 양육 환경과 자녀와의 유대관계를 명확히 입증하여 공동 양육권을 인정받은 사례입니다. 자녀의 복리를 최우선으로 하는 중재안을 통해 원만한 해결을 이끌어냈습니다.",
    quote: "자녀와의 관계를 지속할 수 있게 되어 새로운 삶을 시작할 수 있었습니다."
  },
  {
    id: 3,
    title: "상속 분쟁 조정",
    client: "50대 여성 의뢰인",
    description: "부모님 사망 후 형제간 상속 분쟁이 발생하여 법적 다툼으로 이어질 상황이었으나, 조정 절차를 통해 공정한 상속 배분 방안을 도출하여 가족 관계를 회복하고 원만한 합의를 이끌어낸 사례입니다.",
    quote: "법적 분쟁으로 가족관계가 파괴될 뻔한 상황에서 원만한 해결을 이끌어주셨습니다."
  },
  {
    id: 4,
    title: "상간자 소송 승소",
    client: "30대 여성 의뢰인",
    description: "배우자의 불륜으로 정신적 고통을 겪던 의뢰인의 상간자 손해배상 청구 소송에서 20년간의 경험을 바탕으로 다른 변호사들이 놓친 디지털 증거와 통화 기록의 패턴을 분석하여 명백한 증거를 확보했습니다. 특히 SNS 데이터 분석과 제3자 증언 확보 전략으로 상당한 금액의 위자료를 받아낸 사례입니다.",
    quote: "김영심 변호사님의 세심한 증거 수집과 20년 경험에서 나오는 전략이 놀라웠습니다. 다른 변호사는 발견하지 못했던 증거들을 찾아내어 승소할 수 있었습니다."
  }
];

const Home = () => {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  
  // Refs for scroll animations
  const aboutRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const casesRef = useRef<HTMLDivElement>(null);
  const consultationRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  
  // 스크롤 함수
  const scrollToContact = () => {
    // 참조가 존재하는지 확인
    if (contactRef.current) {
      // 요소의 위치 가져오기
      const elementPosition = contactRef.current.getBoundingClientRect().top;
      // 현재 스크롤 위치에 요소의 상대적 위치를 더해 스크롤할 위치 계산
      const offsetPosition = elementPosition + window.pageYOffset - 100; // 100px 상단 여백 추가
      
      // 스크롤 실행
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      // 참조가 없으면 ID로 직접 찾기
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  
  // Form definition
  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      inquiryType: "",
      message: "",
      privacy: false,
    },
  });
  
  useEffect(() => {
    setMounted(true);
    
    // 패럴랙스 효과 제거 - 움직임 없음
    const handleScroll = () => {
      // 움직임 없음 - 비어있는 핸들러
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const onSubmit: SubmitHandler<InquiryFormValues> = async (data) => {
    try {
      await apiRequest("POST", "/api/inquiries", data);
      toast({
        title: "문의가 접수되었습니다",
        description: "빠른 시일 내에 연락드리겠습니다. 접수하신 내용은 변호사님의 카카오톡과 텔레그램으로 자동 전송됩니다.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "문의 접수 실패",
        description: "문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    }
  }

  return (
    <>
      {/* Hero Section - 3D Sunlight Dust Effect */}
      <section 
        id="home" 
        className="relative min-h-[90vh] pt-16 bg-gradient-to-b from-[#fbf8f3] to-[#f9f5ed] overflow-hidden flex items-center"
        style={{ perspective: '1500px' }}
        role="banner"
        aria-labelledby="main-heading"
      >
        {/* 새로운 배경 이미지 - 쉬폰 커튼에 햇살이 비치는 모습 */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <img 
            src="/assets/curtain-light.png" 
            alt="햇살이 비치는 커튼" 
            className="object-cover h-full w-full"
          />
        </div>
        
        <div className="absolute inset-0 hero-animated-bg pointer-events-none opacity-40"></div>
        
        {/* 강화된 빛 효과와 먼지 입자 */}
        <div className="dust-particles"></div>
        <div className="sunlight-rays pointer-events-none"></div>
        <div className="floating-scale floating-legal-element pointer-events-none"></div>
        <div className="floating-gavel floating-legal-element pointer-events-none"></div>
        <div className="floating-scroll floating-legal-element pointer-events-none"></div>
        
        {/* 모바일에서만 보이는 배경 이미지 */}
        <div className="absolute inset-0 md:hidden z-0 pointer-events-none">
          <div className="w-full h-[100vh]">
            <img 
              src="/assets/배경사진.jpg" 
              alt="배경" 
              className="object-cover h-full w-full opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fbf8f3] via-[#fbf8f3]/70 to-[#fbf8f3]/50"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 h-full py-8 md:py-12 flex flex-col md:flex-row relative z-10">
          <div className="w-full md:w-1/2 flex items-center justify-center md:min-h-0">
            <div className="w-full max-w-2xl text-primary flex flex-col justify-center">
              <div className="fade-in-slide-up text-center md:text-left" style={{ animationDelay: '0.1s' }}>
                <h1 id="main-heading" className="text-[2.25rem] md:text-5xl lg:text-6xl font-elegant font-bold mb-4 text-primary">
                  <div className="text-reveal">
                    <span style={{ animationDelay: '0.3s' }}>당신의 <span className="text-accent">새로운 하루</span>,</span>
                  </div>
                  <div className="text-reveal">
                    <span style={{ animationDelay: '0.5s' }}>함께 시작하겠습니다</span>
                  </div>
                </h1>
              </div>
              <p className="text-lg md:text-xl mb-6 font-serif font-light leading-relaxed text-gray-700 fade-in-slide-up text-center md:text-left" style={{ animationDelay: '0.7s' }}>
                <span className="md:hidden">인생의 전환점에 놓인 당신에게<br />희망과 회복, 따뜻한 동행을 전하는<br/>이혼 전문 법률사무소 '하루'입니다.</span>
                <span className="hidden md:inline">인생의 전환점에 놓인 당신에게 희망과 회복,<br />따뜻한 동행을 전하는 이혼 전문 법률사무소 '하루'입니다.</span>
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 fade-in-slide-up justify-center md:justify-start" style={{ animationDelay: '0.9s' }}>
                <a 
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    const contactElement = document.getElementById('contact');
                    if (contactElement) {
                      contactElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="bg-accent/90 hover:bg-accent text-primary font-medium px-8 py-3 rounded-md transition duration-300 text-center hover-scale warm-glow"
                >
                  상담 문의하기
                </a>
                <a 
                  href="#about" 
                  className="bg-amber-50 hover:bg-amber-100 text-primary font-medium px-8 py-3 rounded-md border border-amber-200 transition duration-300 text-center hover-scale warm-glow"
                >
                  변호사 소개
                </a>
              </div>
            </div>
          </div>
          <div className="hidden md:flex md:w-1/2 items-center justify-center px-6">
            <div className="relative w-full max-w-lg h-[75%] rounded-lg overflow-hidden soft-shadow">
              <img 
                src="/assets/이쁜변호사님.jpg" 
                alt="김영심 변호사" 
                className="object-cover h-full w-full object-center"
              />
              
              <div className="absolute inset-0 flex items-end">
                <div className="w-full p-4 text-white bg-black/30 backdrop-blur-sm">
                  <p className="font-elegant text-base md:text-lg text-center">햇살처럼 따뜻하게 다가오는 이혼전문변호사</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - 변호사 소개 및 브랜드 철학 */}
      <section 
        id="about" 
        ref={aboutRef} 
        className="py-20 bg-[#fbf8f3] relative overflow-hidden" 
        style={{ perspective: '1500px' }}
        aria-labelledby="about-heading"
        role="region"
      >
        <div className="absolute inset-0 hero-animated-bg pointer-events-none opacity-10"></div>
        <div className="dust-particles opacity-15"></div>
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 fade-in-slide-up">
            <h2 id="about-heading" className="text-3xl md:text-4xl font-elegant font-bold text-primary mb-3">
              변호사 소개
            </h2>
            <div className="w-20 h-0.5 bg-accent/70 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto font-serif leading-relaxed">
              <span className="md:hidden">진심과 전문성으로 의뢰인의<br />새로운 시작을 함께합니다</span>
              <span className="hidden md:inline">진심과 전문성으로 의뢰인의 새로운 시작을 함께합니다</span>
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-2/5 fade-in-slide-right">
              <div className="sticky top-24" id="lawyer-profile-container">
                <div className="relative overflow-hidden rounded-lg soft-shadow mb-6">
                  <img 
                    src="/assets/lawyer-new.jpg" 
                    alt="김영심 변호사" 
                    className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <h3 className="text-2xl font-elegant font-bold text-primary mb-4 text-center">김영심 변호사</h3>
                <div className="flex justify-center space-x-4">
                  <a 
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      const contactElement = document.getElementById('contact');
                      if (contactElement) {
                        contactElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="inline-block bg-accent/90 hover:bg-accent text-primary font-medium px-6 py-2.5 rounded-md transition duration-300 text-center hover-scale warm-glow"
                  >
                    상담 문의하기
                  </a>
                  <a 
                    href="tel:053-752-1114"
                    className="inline-block bg-white hover:bg-gray-50 text-primary font-medium px-6 py-2.5 rounded-md border border-amber-200 transition duration-300 text-center hover-scale warm-glow flex items-center"
                  >
                    <Phone size={16} className="mr-2" /> 전화 상담
                  </a>
                </div>
              </div>
            </div>
            
            <div className="md:w-3/5 fade-in-slide-left" style={{ animationDelay: '0.3s' }}>
              {/* 브랜드 철학 */}
              <div className="bg-white p-8 rounded-lg soft-shadow mb-8 hover:shadow-md transition-shadow duration-300">
                <h4 className="text-2xl font-elegant font-bold text-primary mb-4">변호사 소개</h4>
                <p className="text-base mb-6 leading-relaxed font-serif text-gray-700">
                  안녕하십니까, 이혼 및 가사소송 전문 변호사 김영심입니다. 저는 20년간 수많은 가정법률 사건을 담당하며, 특히 이혼소송과 관련된 재산분할, 양육권, 상간소송 등의 분야에서 전문성을 갖추고 있습니다.
                </p>
                <p className="text-base leading-relaxed font-serif text-gray-700">
                  각 의뢰인의 상황과 감정을 깊이 이해하고, 법률적 전문지식을 바탕으로 최상의 결과를 이끌어내기 위해 노력하고 있습니다. 어려운 시간을 지나고 계신 의뢰인께서 새로운 시작을 할 수 있도록 진심을 다해 도움을 드리겠습니다.
                </p>
              </div>
              
              {/* 브랜드 철학 */}
              <div className="bg-white p-8 rounded-lg soft-shadow mb-8 hover:shadow-md transition-shadow duration-300">
                <h4 className="text-2xl font-elegant font-bold text-primary mb-4">브랜드 철학 - '하루'</h4>
                <p className="text-base mb-6 leading-relaxed font-serif text-gray-700">
                  '하루'는 인생의 전환점에 놓인 분들에게 새로운 시작의 희망을 전하는 철학을 담고 있습니다. 법률적 조력을 넘어 정서적 지지와 따뜻한 동행을 통해 의뢰인이 어두운 터널을 지나 밝은 내일을 맞이할 수 있도록 돕습니다.
                </p>
                <p className="text-base leading-relaxed font-serif text-gray-700">
                  하루 법률사무소는 단순한 승소를 넘어 의뢰인의 심리적 회복과 안정, 그리고 앞으로의 삶에 대한 설계까지 함께 고민합니다. 이혼이라는 끝이 아닌, 새로운 하루의 시작을 위한 동반자가 되겠습니다.
                </p>
              </div>
              
              {/* 약력 */}
              <div className="bg-white p-8 rounded-lg soft-shadow hover:shadow-md transition-shadow duration-300">
                <h4 className="text-2xl font-elegant font-bold text-primary mb-4">주요 약력</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <GraduationCap className="text-accent/90 mr-3 mt-1 flex-shrink-0" size={23} />
                      <div>
                        <h5 className="font-bold mb-2 text-primary/90 text-lg">학력 및 자격</h5>
                        <ul className="space-y-2 text-md font-serif text-gray-700">
                          <li>2002년 제44회 사법시험 합격</li>
                          <li>2005년 제34기 사법연수원 수료</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Briefcase className="text-accent/90 mr-3 mt-1 flex-shrink-0" size={23} />
                      <div>
                        <h5 className="font-bold mb-2 text-primary/90 text-lg">현재</h5>
                        <ul className="space-y-2 text-md font-serif text-gray-700">
                          <li>대구지방법원 민사조정위원회 위원</li>
                          <li>대구지방검찰청 형사조정위원회 위원</li>
                          <li>대구본부세관 납세자보호위원회 위원</li>
                          <li>대구 중구청 계약심의위원회 위원</li>
                          <li>한국가정법률상담소 백인변호사단</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-start">
                      <Briefcase className="text-accent/90 mr-3 mt-1 flex-shrink-0" size={23} />
                      <div>
                        <h5 className="font-bold mb-2 text-primary/90 text-lg">전임</h5>
                        <ul className="space-y-2 text-md font-serif text-gray-700">
                          <li>대구지방검찰청 보호관찰심사위원회 위원</li>
                          <li>대구지방검찰청 징계위원회 위원</li>
                          <li>대구시 행정심판위원회 위원</li>
                          <li>대구시 지방소청심사위원회 위원</li>
                          <li>대구시 여성정책위원회 위원</li>
                          <li>서울시 법률 의료 전문 지원단 단원</li>
                          <li>대구시 수성구청 고문변호사</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - 이혼 전문 상담 업무 분야 */}
      <section 
        id="services" 
        ref={servicesRef} 
        className="py-20 bg-[#fffcf8] relative overflow-hidden" 
        style={{ perspective: '1500px' }}
        aria-labelledby="services-heading"
        role="region"
      >
        <div className="absolute inset-0 hero-animated-bg pointer-events-none opacity-30"></div>
        <div className="dust-particles opacity-25"></div>
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 fade-in-slide-up">
            <h2 id="services-heading" className="text-3xl md:text-4xl font-elegant font-bold text-primary mb-3">업무 분야</h2>
            <div className="w-20 h-0.5 bg-accent/70 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto font-serif leading-relaxed">
              <span className="md:hidden">전문적인 법률 서비스로<br />의뢰인의 권익을 보호합니다</span>
              <span className="hidden md:inline">전문적인 법률 서비스로 의뢰인의 권익을 보호합니다</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 3).map((service, index) => (
              <motion.div 
                key={service.id}
                className="bg-white p-8 rounded-lg soft-shadow hover:shadow-md transition-all duration-300 border border-amber-100/50"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 bg-[#f9f2e6] text-accent rounded-full flex items-center justify-center mb-6 mx-auto border border-amber-200/60 soft-shadow">
                  {service.icon}
                </div>
                <h3 className="text-xl font-elegant font-bold text-primary text-center mb-4">{service.title}</h3>
                <p className="text-gray-700 text-center font-serif leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(3, 6).map((service, index) => (
              <motion.div 
                key={service.id}
                className="bg-white p-8 rounded-lg soft-shadow hover:shadow-md transition-all duration-300 border border-amber-100/50"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
              >
                <div className="w-16 h-16 bg-[#f9f2e6] text-accent rounded-full flex items-center justify-center mb-6 mx-auto border border-amber-200/60 soft-shadow">
                  {service.icon}
                </div>
                <h3 className="text-xl font-elegant font-bold text-primary text-center mb-4">{service.title}</h3>
                <p className="text-gray-700 text-center font-serif leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <a 
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                const contactElement = document.getElementById('contact');
                if (contactElement) {
                  contactElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="inline-block bg-accent/90 hover:bg-accent text-primary font-medium px-8 py-3.5 rounded-md transition duration-300 text-center hover-scale warm-glow"
            >
              <span className="font-serif">상담 문의하기</span>
            </a>
          </div>
        </div>
      </section>

      {/* Case Studies Section - 실제 승소사례 (공감 스토리 중심) */}
      <section 
        id="cases" 
        ref={casesRef} 
        className="py-20 bg-white relative overflow-hidden" 
        style={{ perspective: '1500px' }}
        aria-labelledby="cases-heading"
        role="region"
      >
        <div className="absolute inset-0 hero-animated-bg pointer-events-none opacity-20"></div>
        <div className="dust-particles opacity-20"></div>
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 fade-in-slide-up">
            <h2 id="cases-heading" className="text-3xl md:text-4xl font-elegant font-bold text-primary mb-3">실제 승소사례</h2>
            <div className="w-20 h-0.5 bg-accent/70 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto font-serif leading-relaxed">
              <span className="md:hidden">어려운 순간에 함께한<br />희망과 회복의 이야기</span>
              <span className="hidden md:inline">어려운 순간에 함께한 희망과 회복의 이야기</span>
            </p>
          </div>
          
          {/* Main Case Studies - 공감 스토리 중심 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {caseStudies.slice(0, 2).map((caseStudy, index) => (
              <motion.div 
                key={caseStudy.id}
                className="bg-[#f9f5ed] p-8 rounded-lg soft-shadow hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-elegant font-bold text-primary mb-2">{caseStudy.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 font-serif">{caseStudy.client}</p>
                  </div>
                  <div>
                    <p className="text-gray-700 mb-6 font-serif leading-relaxed">{caseStudy.description}</p>
                    <div className="p-4 bg-white rounded-lg border-l-4 border-accent/60 italic">
                      <p className="text-primary font-medium font-serif">
                        "{caseStudy.quote}"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {caseStudies.slice(2, 4).map((caseStudy, index) => (
              <motion.div 
                key={caseStudy.id}
                className="bg-[#f9f5ed] p-8 rounded-lg soft-shadow hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-elegant font-bold text-primary mb-2">{caseStudy.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 font-serif">{caseStudy.client}</p>
                  </div>
                  <div>
                    <p className="text-gray-700 mb-6 font-serif leading-relaxed">{caseStudy.description}</p>
                    <div className="p-4 bg-white rounded-lg border-l-4 border-accent/60 italic">
                      <p className="text-primary font-medium font-serif">
                        "{caseStudy.quote}"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Additional Case Studies - 간략형 */}
          <h3 className="text-2xl font-elegant font-bold text-primary mb-8 text-center">더 많은 승소사례</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <motion.div 
              className="bg-white p-8 rounded-lg soft-shadow hover:shadow-md transition-all duration-300 border border-amber-100/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-xl font-elegant font-bold text-primary mb-3">양육권 및 양육비 분쟁 해결</h3>
              <p className="text-sm text-gray-600 mb-3 font-serif">40대 남성 의뢰인</p>
              <p className="text-gray-700 text-base mb-4 font-serif leading-relaxed">
                상대방의 양육환경과 경제적 상황, 자녀와의 관계 분석을 통해 자녀와 의뢰인의 이익을 최우선으로 고려한 전략을 수립하여 자녀의 의견도 적절히 반영된 유리한 합의를 이끌어냈습니다.
              </p>
              <div className="mt-auto">
                <p className="text-accent font-medium text-sm italic">* 구체적인 판결 내용과 성공 요인은 상담 시 안내해 드립니다.</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-lg soft-shadow hover:shadow-md transition-all duration-300 border border-amber-100/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h3 className="text-xl font-elegant font-bold text-primary mb-3">사업체 재산분할 유리하게 해결</h3>
              <p className="text-sm text-gray-600 mb-3 font-serif">50대 여성 의뢰인</p>
              <p className="text-gray-700 text-base mb-4 font-serif leading-relaxed">
                배우자가 운영하는 사업체의 복잡한 재무구조와 개인 명의 재산 관계를 명확히 분석하여 배우자가 은닉한 재산까지 파악하고, 의뢰인의 공동기여분을 합리적으로 인정받아 유리한 조건의 재산분할을 이끌어 냈습니다.
              </p>
              <div className="mt-auto">
                <p className="text-accent font-medium text-sm italic">* 구체적인 판결 내용과 성공 요인은 상담 시 안내해 드립니다.</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-lg soft-shadow hover:shadow-md transition-all duration-300 border border-amber-100/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h3 className="text-xl font-elegant font-bold text-primary mb-3">이혼 및 위자료 청구 성공</h3>
              <p className="text-sm text-gray-600 mb-3 font-serif">30대 여성 의뢰인</p>
              <p className="text-gray-700 text-base mb-4 font-serif leading-relaxed">
                배우자의 부당한 대우와 지속적인 정신적 학대에 대한 증거를 체계적으로 수집하고 정리하여 법원에서 인정받아 유리한 조건으로 이혼과 함께 상당한 위자료를 받을 수 있었습니다.
              </p>
              <div className="mt-auto">
                <p className="text-accent font-medium text-sm italic">* 구체적인 판결 내용과 성공 요인은 상담 시 안내해 드립니다.</p>
              </div>
            </motion.div>
          </div>
          
          <div className="text-center mt-12">
            <a 
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                const contactElement = document.getElementById('contact');
                if (contactElement) {
                  contactElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="inline-block bg-accent/90 hover:bg-accent text-primary font-medium px-8 py-3 rounded-md transition duration-300 text-center hover-scale warm-glow"
            >
              상담 문의하기
            </a>
          </div>
        </div>
      </section>

      {/* YouTube Videos Section */}
      <section 
        id="videos" 
        className="py-20 bg-[#fffaf2] relative overflow-hidden" 
        style={{ perspective: '1500px' }}
        aria-labelledby="videos-heading"
        role="region"
      >
        <div className="absolute inset-0 hero-animated-bg pointer-events-none opacity-40"></div>
        <div className="dust-particles opacity-40"></div>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 fade-in-slide-up">
            <h2 id="videos-heading" className="text-3xl md:text-4xl font-elegant font-bold text-primary mb-3">법률 영상</h2>
            <div className="w-20 h-0.5 bg-accent/70 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto font-serif leading-relaxed">
              <span className="md:hidden">법률지식을 쉽고<br />친절하게 알려드립니다</span>
              <span className="hidden md:inline">법률지식을 쉽고 친절하게 알려드립니다</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <motion.div 
              className="bg-white rounded-lg overflow-hidden soft-shadow hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/TifIJFTIu0M?si=zoK01S-jvTMVjb2e"
                  title="김영심 변호사 법률 영상 - 이혼 과정에서 알아야 할 법률 지식과 절차"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  aria-labelledby="video-title-1"
                  loading="lazy"
                ></iframe>
              </div>
              <div className="p-5">
                <h3 id="video-title-1" className="text-lg font-elegant font-bold text-primary mb-2">이혼 법률 상담</h3>
                <p className="text-gray-700 text-sm font-serif">이혼 과정에서 알아야 할 법률 지식과 절차에 대한 안내</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-lg overflow-hidden soft-shadow hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/K22_aHBpjZ0?si=x3Xz3daxYbKcDB9i"
                  title="김영심 변호사 법률 영상"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-elegant font-bold text-primary mb-2">재산분할 사례 분석</h3>
                <p className="text-gray-700 text-sm font-serif">실제 재산분할 사례를 통해 알아보는 재산분할의 원칙과 전략</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-lg overflow-hidden soft-shadow hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/SkfsECqjVm0?si=I567LS7xF8JEiK_w"
                  title="김영심 변호사 법률 영상 - 재산분할 사례 분석"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  aria-labelledby="video-title-2"
                  loading="lazy"
                ></iframe>
              </div>
              <div className="p-5">
                <h3 id="video-title-2" className="text-lg font-elegant font-bold text-primary mb-2">양육권 관련 법률 설명</h3>
                <p className="text-gray-700 text-sm font-serif">자녀의 복리를 위한 양육권 결정 요소와 법적 절차</p>
              </div>
            </motion.div>
          </div>
          
          {/* 추가 영상 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="bg-white rounded-lg overflow-hidden soft-shadow hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/ws-KSXfNdAs?si=xW92s3zk6N39-63N"
                  title="김영심 변호사 법률 영상 - 재산분할 사례 분석"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  aria-labelledby="video-title-3"
                  loading="lazy"
                ></iframe>
              </div>
              <div className="p-5">
                <h3 id="video-title-3" className="text-lg font-elegant font-bold text-primary mb-2">위자료 청구 방법</h3>
                <p className="text-gray-700 text-sm font-serif">위자료 청구 절차와 고려해야 할 사항에 대한 설명</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-lg overflow-hidden soft-shadow hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/mtgOTg8n1yo?si=7azFPMS9zpJa51VH"
                  title="김영심 변호사 법률 영상"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-elegant font-bold text-primary mb-2">부동산 관련 법률 상담</h3>
                <p className="text-gray-700 text-sm font-serif">이혼 시 부동산 분할에 관한 주요 쟁점과 해결 방안</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-lg overflow-hidden soft-shadow hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/-IqR2K956qY?si=3akUdaCWbpvGMGRH"
                  title="김영심 변호사 법률 영상"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-elegant font-bold text-primary mb-2">이혼 절차 안내</h3>
                <p className="text-gray-700 text-sm font-serif">협의이혼과 재판이혼의 절차와 필요한 서류 안내</p>
              </div>
            </motion.div>
          </div>
          
          {/* 소셜 링크 버튼 - 동일한 너비로 유지 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl mx-auto mt-12">
            <a 
              href="https://youtube.com/channel/UComz7IXLqtHs0PgXf1a0dEQ?si=GXNQlKq1tAhMPyH8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 py-3.5 rounded-md border border-red-700 transition duration-300 text-center flex items-center justify-center group warm-glow w-full"
            >
              <Youtube size={20} className="mr-2 text-white" /> 
              <span className="group-hover:text-gray-100 transition-colors">유튜브 채널</span>
            </a>
            <a 
              href="https://blog.naver.com/otherwis6826" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#03C75A] hover:bg-[#02a94a] text-white font-medium px-8 py-3.5 rounded-md border border-[#02a94a] transition duration-300 text-center flex items-center justify-center group warm-glow w-full"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="mr-2 text-white fill-current">
                <path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
              </svg>
              <span className="group-hover:text-gray-100 transition-colors">네이버 블로그</span>
            </a>
          </div>
        </div>
      </section>

      {/* Consultation Section - 상담 안내 */}
      <section 
        id="consultation" 
        ref={consultationRef} 
        className="py-20 bg-[#fffcf8] relative overflow-hidden" 
        style={{ perspective: '1500px' }}
        aria-labelledby="consultation-heading"
        role="region"
      >
        <div className="absolute inset-0 hero-animated-bg pointer-events-none opacity-30"></div>
        <div className="dust-particles opacity-30"></div>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 fade-in-slide-up"> 
            <h2 id="consultation-heading" className="text-3xl md:text-4xl font-elegant font-bold text-primary mb-3">상담 안내</h2>
            <div className="w-20 h-0.5 bg-accent/70 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto font-serif leading-relaxed">
              <span className="md:hidden">전문적인 법률 상담으로<br />편안한 내일을 준비하세요</span>
              <span className="hidden md:inline">전문적인 법률 상담으로 편안한 내일을 준비하세요</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-lg p-8 soft-shadow">
                <h3 className="text-2xl font-elegant font-bold text-primary mb-6">상담 정보</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <Phone className="text-accent mt-1 mr-4 hidden md:block" size={23} />
                    <Phone className="text-accent mt-1 mr-4 md:hidden" />
                    <div>
                      <h4 className="font-serif font-bold mb-1 text-primary">전화 상담</h4>
                      <p className="text-lg font-serif">전화 : 053-752-1114</p>
                      <p className="text-lg font-serif">휴대폰 : 010-2790-1115</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="text-accent mt-1 mr-4 hidden md:block" size={23} />
                    <MapPin className="text-accent mt-1 mr-4 md:hidden" />
                    <div>
                      <h4 className="font-serif font-bold mb-1 text-primary">방문 상담</h4>
                      <p className="text-sm md:text-lg font-serif whitespace-nowrap">대구 수성구 범어동 45-29 범어타워 5층</p>
                      <p className="text-xs md:text-sm text-gray-600 font-serif">지하철 2호선 범어역 3번 출구에서 도보 5분</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="text-accent mt-1 mr-4 hidden md:block" size={23} />
                    <Clock className="text-accent mt-1 mr-4 md:hidden" />
                    <div>
                      <h4 className="font-serif font-bold mb-1 text-primary">상담 시간</h4>
                      <p className="text-sm md:text-lg text-gray-700 font-serif">오전 9시부터 18시까지</p>
                      <p className="text-sm md:text-lg text-gray-700 font-serif">필요시 그 외 시간에도 상담 가능</p>
                      <p className="text-xs md:text-base text-gray-700 font-serif">토요일, 일요일 및 공휴일 휴무</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Info className="text-accent mt-1 mr-4 hidden md:block" size={23} />
                    <Info className="text-accent mt-0 mr-4 md:hidden" size={46} />
                    <div>
                      <h4 className="font-serif font-bold mb-1 text-primary">상담 안내</h4>
                      <p className="text-sm md:text-lg text-gray-700 font-serif">정확한 상담을 위해 관련 서류를 지참해 주시면<br className="hidden md:block" /> 더욱 원활한 상담이 가능하십니다.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <a 
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      const contactElement = document.getElementById('contact');
                      if (contactElement) {
                        contactElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="inline-block bg-[#03C75A] hover:bg-[#02a94a] text-white border border-[#02a94a] font-medium px-8 py-3.5 rounded-md transition duration-300 w-full text-center group warm-glow"
                  >
                    <span className="group-hover:text-gray-100 transition-colors text-lg font-serif">상담 문의하기</span>
                  </a>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="rounded-lg overflow-hidden soft-shadow"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex flex-col">
                <div className="bg-white text-primary p-4 text-center font-bold text-xl font-elegant border-b border-amber-100">
                  찾아오시는 길
                </div>
                <a href="https://naver.me/xxYNzav5" target="_blank" rel="noopener noreferrer" style={{ height: "300px" }}>
                  <img 
                    src="/assets/office-map.png"
                    alt="김영심 변호사 사무소 위치"
                    className="w-full h-full object-cover"
                  />
                </a>
                <div className="bg-white p-4 rounded-b-lg border-t border-amber-100">
                  <p className="text-center text-primary font-medium text-sm md:text-base flex items-center justify-center font-serif">
                    <MapPin className="mr-2 text-accent flex-shrink-0" size={23} />
                    지도를 클릭하시면 네이버 지도로 연결됩니다
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        id="contact" 
        ref={contactRef} 
        className="py-20 bg-[#fffaf5] relative overflow-hidden" 
        style={{ perspective: '1500px' }}
        aria-labelledby="contact-heading"
        role="region"
      >
        <div className="absolute inset-0 hero-animated-bg pointer-events-none opacity-20"></div>
        <div className="dust-particles opacity-20"></div>
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 fade-in-slide-up">
            <h2 id="contact-heading" className="text-3xl md:text-4xl font-elegant font-bold text-primary mb-3">상담 문의하기</h2>
            <div className="w-20 h-0.5 bg-accent/70 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto font-serif leading-relaxed">
              <span className="md:hidden">상담 예약 및 문의사항을 남겨주시면<br />빠르게 답변드리겠습니다</span>
              <span className="hidden md:inline">상담 예약 및 문의사항을 남겨주시면 빠르게 답변드리겠습니다</span>
            </p>
          </div>
          
          <motion.div 
            className="max-w-3xl mx-auto bg-white p-8 rounded-lg soft-shadow"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 id="contact-form-heading" className="sr-only">상담 문의 양식</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" aria-labelledby="contact-form-heading">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>성함</FormLabel>
                        <FormControl>
                          <Input placeholder="이름을 입력해주세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>연락처</FormLabel>
                        <FormControl>
                          <Input placeholder="전화번호를 입력해주세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일 (선택)</FormLabel>
                      <FormControl>
                        <Input placeholder="이메일 주소를 입력해주세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="inquiryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>상담 분야</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="상담 분야를 선택해주세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="divorce">이혼소송</SelectItem>
                          <SelectItem value="property">재산분할</SelectItem>
                          <SelectItem value="custody">양육권</SelectItem>
                          <SelectItem value="adultery">상간소송</SelectItem>
                          <SelectItem value="inheritance">상속소송</SelectItem>
                          <SelectItem value="other">기타</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>문의내용</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="문의하실 내용을 입력해주세요" 
                          rows={5}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="privacy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>개인정보 수집 및 이용에 동의합니다.</FormLabel>
                        <div className="text-xs text-muted-foreground mt-1">수집된 정보는 상담 목적으로만 사용됩니다.</div>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#03C75A] hover:bg-[#02a94a] text-white border border-[#02a94a] font-medium py-6 rounded-md transition duration-300 group warm-glow" 
                  disabled={form.formState.isSubmitting}
                  aria-live="polite"
                  aria-busy={form.formState.isSubmitting}
                >
                  <span className="text-lg group-hover:text-gray-100 transition-colors font-serif">
                    {form.formState.isSubmitting ? "제출 중..." : "상담 문의하기"}
                  </span>
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </section>


    </>
  );
};

export default Home;
