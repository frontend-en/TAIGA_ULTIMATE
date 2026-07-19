import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-xl border bg-card text-card-foreground transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-border/60 shadow-card hover:shadow-md hover:border-border',
        mint: 'border-mint/30 bg-mint/5 hover:border-mint/60 hover:shadow-[0_0_20px_-5px_rgb(16_185_129_/_0.3)] hover:bg-mint/10',
        cta: 'border-cta/30 bg-cta/5 hover:border-cta/60 hover:shadow-[0_0_20px_-5px_rgb(249_115_22_/_0.3)] hover:bg-cta/10',
        outline: 'border-border bg-transparent hover:bg-accent/50',
        secondary: 'border-secondary bg-secondary/50 hover:bg-secondary/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Card({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>) {
  return <div className={cn(cardVariants({ variant }), className)} {...props} />;
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />;
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
