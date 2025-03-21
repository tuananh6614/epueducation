
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  imageUrl?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

const HeroSection = ({
  title,
  subtitle,
  imageUrl,
  primaryAction,
  secondaryAction,
}: HeroSectionProps) => {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-dot-pattern bg-[length:20px_20px] opacity-[0.2]"></div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-medium leading-tight text-balance">
                {title}
              </h1>
              <p className="mt-6 text-xl text-muted-foreground max-w-xl text-balance">
                {subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {primaryAction && (
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to={primaryAction.href}>{primaryAction.label}</Link>
                </Button>
              )}
              {secondaryAction && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 transition-all duration-300"
                >
                  <Link to={secondaryAction.href}>{secondaryAction.label}</Link>
                </Button>
              )}
            </div>
          </div>

          {imageUrl && (
            <div className="relative animate-slide-up animation-delay-200">
              <div className="aspect-square md:aspect-video relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={imageUrl}
                  alt="Hero"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-primary/10 blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-primary/20 blur-3xl"></div>
            </div>
          )}
        </div>
      </div>

      {/* Gradient accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-background/40 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default HeroSection;
