'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        <div
          key={item.question}
          className={cn(
            'rounded-xl border border-border/70 bg-card text-card-foreground shadow-card transition-colors hover:border-primary/30',
            openIndex === index && 'border-primary/30 bg-primary/5',
          )}
        >
          <h3>
            <button
              type="button"
              id={`faq-trigger-${index}`}
              className="group flex w-full items-center justify-between rounded-xl p-4 text-left text-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              aria-expanded={openIndex === index}
              aria-controls={`faq-panel-${index}`}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="pr-4">{item.question}</span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-primary motion-reduce:transition-none',
                  openIndex === index && 'rotate-180 text-primary',
                )}
                aria-hidden="true"
              />
            </button>
          </h3>
          {openIndex === index && (
            <div
              id={`faq-panel-${index}`}
              role="region"
              aria-labelledby={`faq-trigger-${index}`}
              className="px-4 pb-4"
            >
              <p className="leading-relaxed text-muted-foreground">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
