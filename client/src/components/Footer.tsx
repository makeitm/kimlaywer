import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12" role="contentinfo">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-playfair font-bold text-white">김영심 변호사</h2>
            <p className="text-primary mt-2">HARU Lawfirm</p>
          </div>
          
          <div className="flex flex-col space-y-4 md:mt-0 mt-4 md:items-start" role="navigation" aria-label="Footer Navigation">
            <div className="flex space-x-8 justify-start">
              <a href="#home" className="text-white hover:text-accent transition duration-300">홈</a>
              <a href="#about" className="text-white hover:text-accent transition duration-300">변호사 소개</a>
              <a href="#services" className="text-white hover:text-accent transition duration-300">업무 분야</a>
            </div>
            <div className="flex space-x-8 justify-start">
              <a href="#cases" className="text-white hover:text-accent transition duration-300">승소사례</a>
              <a href="#consultation" className="text-white hover:text-accent transition duration-300">상담안내</a>
              <a href="#contact" className="text-white hover:text-accent transition duration-300">문의하기</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0" role="region" aria-label="연락처 정보">
              <p className="text-sm text-white">대구 범어동 45-29 범어타워 5층</p>
              <p className="text-sm text-white">전화: 053-752-1114</p>
              <p className="text-sm text-white">휴대폰: 010-2790-1115</p>
              <p className="text-sm text-white">이메일: kys123@daum.net</p>
            </div>
            
            <div role="contentinfo" aria-label="저작권 정보">
              <p className="text-sm text-white">© {new Date().getFullYear()} 김영심 변호사. All Rights Reserved.</p>
              <p className="text-sm text-white">사업자등록번호: 000-00-00000</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
