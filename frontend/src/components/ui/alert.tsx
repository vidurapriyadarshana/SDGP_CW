import * as React from 'react';
import { cn } from '../../utils/cn';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
          {
            'bg-background text-foreground border-border': variant === 'default',
            'bg-destructive/10 text-destructive border-destructive/20 [&>svg]:text-destructive':
              variant === 'destructive',
            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 [&>svg]:text-emerald-600':
              variant === 'success',
            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 [&>svg]:text-amber-600':
              variant === 'warning',
            'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 [&>svg]:text-blue-600':
              variant === 'info',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Alert.displayName = 'Alert';

export const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
);
AlertDescription.displayName = 'AlertDescription';
