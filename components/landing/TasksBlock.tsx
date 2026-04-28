'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Inbox, Repeat, Clock, Users, Plug, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { tasksItems, tasksData } from '@/lib/data/tasks';

const iconMap: Record<string, React.ElementType> = {
  inbox: Inbox,
  repeat: Repeat,
  clock: Clock,
  users: Users,
  plug: Plug,
  'trending-up': TrendingUp,
};

interface TasksBlockProps {
  locale: string;
}

export function TasksBlock({ locale }: TasksBlockProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="tasks" className="py-20 md:py-28 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {tasksData.title}
          </h2>
          <p className="text-lg text-muted-foreground">{tasksData.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasksItems.map((item, index) => {
            const Icon = iconMap[item.icon] || Inbox;
            return (
              <motion.div
                key={index}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm leading-relaxed pt-1">{item.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
