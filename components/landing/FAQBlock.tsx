'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Accordion } from '@/components/ui/Accordion';

const faqItems = [
  {
    question: 'Нужно ли мне понимать AI?',
    answer: 'Нет. Я объясню всё на понятном языке. Ваша задача — описать проблему, которую нужно решить.',
  },
  {
    question: 'Подойдёт ли это моему бизнесу?',
    answer: 'Автоматизация полезна для любого бизнеса, где есть повторяющиеся процессы: заявки, общение с клиентами, обработка данных. Если у вас есть рутина — значит, есть что автоматизировать.',
  },
  {
    question: 'Что если я не знаю, какая именно система мне нужна?',
    answer: 'Это нормально. Многие приходят с проблемой, а не с решением. Я разберусь и предложу оптимальный вариант.',
  },
  {
    question: 'Какие доступы потребуются?',
    answer: 'Зависит от задачи. Обычно: доступы к сервисам, которые нужно интегрировать. Обсуждаем на этапе разбора задачи.',
  },
  {
    question: 'Сколько это занимает по времени?',
    answer: 'Простые задачи — от 1-2 недель. Сложные системы — от 1-2 месяцев. Точные сроки называю после разбора задачи.',
  },
  {
    question: 'Можно ли начать с малого?',
    answer: 'Да. Можно начать с одного бота или одной интеграции и затем расширять. Масштабируюся по мере роста ваших потребностей.',
  },
] as const;

const faqData = {
  title: 'Частые вопросы',
} as const;

interface FAQBlockProps {
  locale: string;
}

export function FAQBlock({ locale }: FAQBlockProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="faq" className="py-20 md:py-28 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-16"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {faqData.title}
          </h2>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Accordion items={[...faqItems] as Array<{ question: string; answer: string }>} />
        </motion.div>
      </div>
    </section>
  );
}
