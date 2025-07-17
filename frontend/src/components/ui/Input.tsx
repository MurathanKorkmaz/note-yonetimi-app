import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error 
              ? 'border-red-300 pr-10 text-red-900 placeholder-red-300 focus-visible:ring-red-500' 
              : 'border-gray-200 hover:border-gray-300',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <>
            <div className="mt-2 flex items-center gap-1.5">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" aria-hidden="true" />
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            </div>
          </>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input }; 