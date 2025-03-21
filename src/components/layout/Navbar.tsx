
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Khóa học', href: '/courses' },
    { name: 'Bài viết', href: '/blog' },
    { name: 'Tài nguyên', href: '/resources' },
    { name: 'Giới thiệu', href: '/about' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm'
          : 'py-5 bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-semibold">
            QuizCourseHub
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                link.href === location.pathname
                  ? 'text-primary'
                  : 'text-foreground/80 hover:text-foreground hover:bg-muted/50'
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">Đăng nhập</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/register">Đăng ký</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-muted/50 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg transition-all duration-300 ease-in-out overflow-hidden',
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  'px-4 py-3 rounded-md font-medium transition-colors',
                  link.href === location.pathname
                    ? 'bg-muted text-primary'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted/50'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/login">Đăng nhập</Link>
            </Button>
            <Button className="w-full" asChild>
              <Link to="/register">Đăng ký</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
