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
            'cursor-pointer transition-colors hover:bg-accent/50',
            openIndex === index && 'bg-accent/30'
          )}
          onClick={() => setOpenIndex(openIndex === index ? null : index)}
        >
          <CardHeader className="flex-row items-center justify-between p-4 cursor-pointer">
            <CardTitle className="text-lg font-medium">{item.question}</CardTitle>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform duration-200',
                openIndex === index && 'rotate-180'
              )}
            />
          </CardHeader>
          <CardContent
            className={cn(
              'overflow-hidden transition-all duration-300',
              openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
