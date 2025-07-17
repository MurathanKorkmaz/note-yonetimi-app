import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'sm' | 'lg';
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto px-4 w-full',
          {
            'max-w-7xl': size === 'default',
            'max-w-5xl': size === 'sm',
            'max-w-screen-2xl': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Container.displayName = 'Container';

export { Container }; 