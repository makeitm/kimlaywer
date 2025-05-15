import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed w-full bg-white shadow-md z-50" role="banner">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center">
            <div className="text-primary font-playfair">
              <span className="text-xl md:text-2xl font-bold">김영심 변호사</span>
              <span className="text-base md:text-lg ml-2 text-white font-normal">HARU Lawfirm</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Main Navigation">
            <a href="#home" className="text-primary hover:text-accent font-medium transition duration-300">홈</a>
            <a href="#about" className="text-primary hover:text-accent font-medium transition duration-300">변호사 소개</a>
            <a href="#services" className="text-primary hover:text-accent font-medium transition duration-300">업무 분야</a>
            <a href="#cases" className="text-primary hover:text-accent font-medium transition duration-300">승소사례</a>
            <a href="#consultation" className="text-primary hover:text-accent font-medium transition duration-300">상담안내</a>
            <a href="#contact" className="text-primary hover:text-accent font-medium transition duration-300">문의하기</a>
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-primary focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4" role="navigation" aria-label="Mobile Navigation">
            <div className="flex flex-col space-y-3">
              <a 
                href="#home" 
                className="text-primary hover:text-accent py-2 font-medium transition duration-300"
                onClick={closeMobileMenu}
              >
                홈
              </a>
              <a 
                href="#about" 
                className="text-primary hover:text-accent py-2 font-medium transition duration-300"
                onClick={closeMobileMenu}
              >
                변호사 소개
              </a>
              <a 
                href="#services" 
                className="text-primary hover:text-accent py-2 font-medium transition duration-300"
                onClick={closeMobileMenu}
              >
                업무 분야
              </a>
              <a 
                href="#cases" 
                className="text-primary hover:text-accent py-2 font-medium transition duration-300"
                onClick={closeMobileMenu}
              >
                승소사례
              </a>
              <a 
                href="#consultation" 
                className="text-primary hover:text-accent py-2 font-medium transition duration-300"
                onClick={closeMobileMenu}
              >
                상담안내
              </a>
              <a 
                href="#contact" 
                className="text-primary hover:text-accent py-2 font-medium transition duration-300"
                onClick={closeMobileMenu}
              >
                문의하기
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
