'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

interface AccordionProps {
  items: {
    question: string;
    answer: string;
  }[];
}

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <div className="w-full space-y-2">
      {items.map((item, index) => (
        <Card
          key={index}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:border-primary/30 hover:shadow-md',
            openIndex === index && 'border-primary/30 bg-primary/5'
          )}
          onClick={() => setOpenIndex(openIndex === index ? null : index)}
        >
          <CardHeader className="flex-row items-center justify-between p-4 cursor-pointer group">
            <CardTitle className="text-lg font-medium pr-4">{item.question}</CardTitle>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-muted-foreground transition-all duration-200 group-hover:text-primary',
                openIndex === index && 'rotate-180 text-primary'
              )}
            />
          </CardHeader>
          <div
            className={cn(
              'overflow-hidden transition-all duration-300 ease-out',
              openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <CardContent className="pb-4">
              <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}
