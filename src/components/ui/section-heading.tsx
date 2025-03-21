
import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const SectionHeading = ({
  title,
  subtitle,
  align = 'center',
  className,
}: SectionHeadingProps) => {
  return (
    <div
      className={cn(
        'mb-10 space-y-2',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
    >
      <h2 className="text-3xl font-medium leading-tight md:text-4xl lg:text-5xl animate-slide-up text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl text-muted-foreground md:text-lg animate-slide-up animation-delay-100 text-balance mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
