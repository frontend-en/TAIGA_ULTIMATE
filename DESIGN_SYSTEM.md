# SigmaBots — Design System

> **Current accent policy:** `mint` and `cta` are compatibility aliases of the single teal `primary` accent, not independent mint or orange palettes. Use `primary`, `primary-hover`, `primary-subtle`, and `primary-border` for new UI.

## Дизайн-система для AI-бизнес-продуктов

> Актуальная реализация лендинга использует `Button`, `Input`, `Textarea` и
> семантический `Accordion`. Примеры `Card` и старой `CTASection` ниже сохранены
> только как визуальный справочник и не описывают существующие файлы или API.

> **Вдохновение:** ChadNext, Vercel, Linear  
> **Философия:** «Технологичный минимализм» — чистые линии, много воздуха, акцентные mint-цвета, контрастные CTA

---

## Содержание

1. [Концепция и видение](#1-концепция-и-видение)
2. [Дизайн-токены](#2-дизайн-токены)
3. [Компоненты UI](#3-компоненты-ui)
4. [Секции лендинга](#4-секции-лендинга)
5. [Анимации и Motion](#5-анимации-и-motion)
6. [Расширение до Shadcn UI](#6-расширение-до-shadcn-ui)
7. [Структура файлов](#7-структура-файлов)
8. [Порядок внедрения](#8-порядок-внедрения)
9. [Checklist качества](#9-checklist-качества)

---

## 1. Концепция и видение

**SigmaBots** — технологическая компания, предоставляющая AI-решения для автоматизации бизнеса.

### Визуальный язык

| Принцип | Описание |
|---------|----------|
| **Минимализм** | Много воздуха, чистые линии, отсутствие визуального шума |
| **Технологичность** | Чёткие формы, структурированная информация, grid-based layout |
| **Акценты** | Mint как основной брендовый, orange (CTA) для призывов к действию |
| **Контраст** | Тёмные/светлые темы с высокой читаемостью |

### Референсы

- **ChadNext** — SaaS template с чёткой структурой
- **Vercel** — Чистый minimalism, отличная типографика
- **Linear** — Продуктовая эстетика, attention to detail

---

## 2. Дизайн-токены

### 2.1 Цветовая палитра

#### Светлая тема (Light)

```css
:root {
  /* === BASE === */
  --background:       0 0% 100%;      /* #FFFFFF */
  --foreground:       222 84% 4.9%;   /* #0A1829 */
  --card:             0 0% 100%;       /* #FFFFFF */
  --card-foreground:  222 84% 4.9%;   /* #0A1829 */
  --popover:          0 0% 100%;
  --popover-foreground: 222 84% 4.9%;

  /* === PRIMARY (Mint) === */
  --primary:          160 84% 39%;     /* #10B981 — основной акцент */
  --primary-foreground: 210 40% 98%;  /* #F0FDF4 */
  --mint:             160 84% 39%;     /* alias для primary */
  --mint-hover:       160 84% 32%;     /* #059669 */
  --mint-foreground:  210 40% 98%;

  /* === SECONDARY === */
  --secondary:        210 40% 96%;    /* #F1F5F9 */
  --secondary-foreground: 222 47% 11%; /* #1E293B */

  /* === MUTED === */
  --muted:            210 40% 96%;     /* #F1F5F9 */
  --muted-foreground: 215 16% 47%;     /* #64748B */

  /* === ACCENT === */
  --accent:           210 40% 96%;    /* #F1F5F9 */
  --accent-foreground: 222 47% 11%;    /* #1E293B */

  /* === DESTRUCTIVE === */
  --destructive:      0 84% 60%;       /* #EF4444 */
  --destructive-foreground: 210 40% 98%;

  /* === BORDER & INPUT === */
  --border:           214 32% 91%;     /* #E2E8F0 */
  --input:            214 32% 91%;     /* #E2E8F0 */
  --ring:             160 84% 39%;     /* #10B981 focus */

  /* === CTA (Orange) === */
  --cta:              25 95% 53%;       /* #F97316 */
  --cta-foreground:   210 40% 98%;

  /* === CHART === */
  --chart-1:          160 84% 39%;
  --chart-2:          220 70% 50%;
  --chart-3:          197 37% 24%;
  --chart-4:          43 74% 66%;
  --chart-5:          27 87% 67%;

  /* === RADIUS === */
  --radius:           0.5rem;            /* 8px */
}
```

#### Тёмная тема (Dark)

```css
.dark {
  /* === BASE === */
  --background:      222 47% 4%;       /* #030712 */
  --foreground:      210 40% 98%;      /* #F8FAFC */
  --card:            222 47% 6%;       /* #0F172A */
  --card-foreground: 210 40% 98%;
  --popover:         222 47% 4%;
  --popover-foreground: 210 40% 98%;

  /* === PRIMARY (Mint) === */
  --primary:         160 84% 45%;      /* #34D399 — светлее для темного */
  --primary-foreground: 222 47% 4%;
  --mint:            160 76% 50%;      /* #10B981 */
  --mint-hover:      160 76% 55%;
  --mint-foreground: 222 47% 4%;

  /* === SECONDARY === */
  --secondary:       217 33% 12%;       /* #1E293B */
  --secondary-foreground: 210 40% 98%;

  /* === MUTED === */
  --muted:           217 33% 12%;
  --muted-foreground: 215 20% 65%;

  /* === ACCENT === */
  --accent:          217 33% 12%;
  --accent-foreground: 210 40% 98%;

  /* === DESTRUCTIVE === */
  --destructive:     0 62% 50%;         /* #DC2626 */
  --destructive-foreground: 210 40% 98%;

  /* === BORDER & INPUT === */
  --border:          217 33% 17%;       /* #1E293B */
  --input:           217 33% 17%;
  --ring:            160 84% 45%;

  /* === CTA === */
  --cta:             25 95% 53%;
  --cta-foreground:  210 40% 98%;

  /* === SHADOWS (темные тени более выражены) === */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.2);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5);
}
```

### 2.2 Типографика

```css
/* === FONT STACK === */
--font-sans:    'Inter', system-ui, -apple-system, sans-serif;
--font-display: 'Inter', system-ui, -apple-system, sans-serif;

/* === TYPOGRAPHIC SCALE === */
/* size / line-height */
text-xs:     0.75rem / 1rem       /* 12px — мелкие лейблы */
text-sm:     0.875rem / 1.25rem   /* 14px — вторичный текст */
text-base:   1rem / 1.5rem        /* 16px — основной текст */
text-lg:     1.125rem / 1.75rem   /* 18px — подзаголовки */
text-xl:     1.25rem / 1.75rem    /* 20px */
text-2xl:    1.5rem / 2rem        /* 24px */
text-3xl:    1.875rem / 2.25rem   /* 30px — секции */
text-4xl:    2.25rem / 2.5rem     /* 36px */
text-5xl:    3rem / 1.1          /* 48px — hero */
text-6xl:    3.75rem / 1.1        /* 60px */
text-7xl:    4.5rem / 1           /* 72px — максимальный */

/* === FONT WEIGHTS === */
font-normal:  400
font-medium:  500
font-semibold: 600
font-bold:    700

/* === LEADING & TRACKING === */
leading-none:    1
leading-tight:    1.25
leading-snug:     1.375
leading-normal:   1.5
leading-relaxed:  1.625
tracking-tight:  -0.025em
tracking-normal: 0
tracking-wide:   0.025em
```

### 2.3 Отступы (8px Grid)

```css
/* === SPACING SCALE === */
spacing-unit: 0.25rem /* 4px — базовая единица */

/* Именованные отступы секций */
--section-padding-y: 5rem   /* py-20 */
--section-padding-x: 1.5rem /* px-6 */

/* Контейнер */
--container-max:    1280px  /* max-w-7xl */
--container-padding: 1.5rem /* px-6 on mobile, px-8 on desktop */

/* Grid */
--grid-gap:         1.5rem /* gap-6 */
--grid-cols-mobile: 1
--grid-cols-tablet: 2
--grid-cols-desktop: 3
```

### 2.4 Радиусы

```css
/* === BORDER RADIUS === */
--radius-sm:   0.25rem   /* 4px — мелкие элементы */
--radius-md:   0.375rem  /* 6px */
--radius-lg:   0.5rem     /* 8px — основной */
--radius-xl:   0.75rem    /* 12px — карточки */
--radius-2xl:  1rem       /* 16px — крупные карточки */
--radius-full: 9999px     /* pill/circle */
```

### 2.5 Тени

```css
/* === SHADOWS === */
--shadow-sm:   0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md:   0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg:   0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl:   0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* === GLOW EFFECTS === */
--glow-mint:   0 0 20px -5px rgb(16 185 129 / 0.4);
--glow-cta:    0 0 20px -5px rgb(249 115 22 / 0.4);
--glow-mint-lg: 0 0 40px -10px rgb(16 185 129 / 0.5);
```

---

## 3. Компоненты UI

### 3.1 Button

**Файл:** `components/ui/Button.tsx`  
**Паттерн:** class-variance-authority (CVA) + forwardRef

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:   'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
        mint:      'bg-mint text-mint-foreground hover:bg-mint-hover shadow-md',
        cta:       'bg-cta text-cta-foreground hover:bg-cta/90 shadow-md hover:shadow-lg',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:   'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:     'hover:bg-accent hover:text-accent-foreground',
        link:      'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm:      'h-9 rounded-md px-3',
        lg:      'h-12 rounded-md px-8 text-base',
        xl:      'h-14 rounded-lg px-10 text-lg',    /* Hero CTA */
        icon:    'h-10 w-10',
        link:    'h-auto p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

**Варианты:**

| Variant | Назначение | Пример |
|---------|------------|--------|
| `default` | Основные действия | Submit, Save |
| `cta` | Warm CTA кнопки | "Начать", "Заказать" |
| `outline` | Вторичные действия | Отмена, Назад |

**Размеры:**

| Size | Применение |
|------|------------|
| `default` | Standard buttons |
| `lg` | Primary actions |

---

### 3.2 Card (архивный визуальный паттерн)

**Статус:** отдельный компонент удалён; карточки собираются семантической разметкой и Tailwind-классами.
**Паттерн:** Compound components + CVA variants

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-xl border bg-card text-card-foreground transition-all duration-200',
  {
    variants: {
      variant: {
        default:   'border-border/60 shadow-card hover:shadow-md',
        mint:      'border-mint/30 bg-mint/5 hover:border-mint/60 hover:shadow-[0_0_20px_-5px_rgb(16_185_129_/_0.3)]',
        cta:       'border-cta/30 bg-cta/5 hover:border-cta/60 hover:shadow-[0_0_20px_-5px_rgb(249_115_22_/_0.3)]',
        outline:   'border-border bg-transparent hover:bg-accent/50',
        secondary: 'border-secondary bg-secondary/50 hover:bg-secondary/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props} />
  )
);

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

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
```

**Использование:**

```tsx
<Card variant="mint">
  <CardHeader>
    <CardTitle>AI Автоматизация</CardTitle>
    <CardDescription>Ускорьте бизнес-процессы</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Описание услуги...</p>
  </CardContent>
  <CardFooter>
    <Button variant="cta">Заказать</Button>
  </CardFooter>
</Card>
```

---

### 3.3 Input

**Файл:** `components/ui/Input.tsx`

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-200',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
```

---

### 3.4 Textarea

**Файл:** `components/ui/Textarea.tsx`

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-200',
          'resize-y',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
```

---

### 3.5 Accordion (FAQ)

**Файл:** `components/ui/Accordion.tsx`  
**Зависимость:** `@radix-ui/react-accordion`

```tsx
'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b border-border', className)}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline',
        '[&[data-state=open]>svg]:rotate-180',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
```

**CSS анимации (globals.css):**

```css
@keyframes collapse-down {
  from { height: 0; opacity: 0; }
  to   { height: var(--radix-accordion-content-height); opacity: 1; }
}
@keyframes collapse-up {
  from { height: var(--radix-accordion-content-height); opacity: 1; }
  to   { height: 0; opacity: 0; }
}
.animate-collapse-down { animation: collapse-down 0.2s ease-out; }
.animate-collapse-up   { animation: collapse-up 0.2s ease-in; }
```

---

### 3.6 Badge

**Файл:** `components/ui/Badge.tsx`

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:   'border-transparent bg-primary text-primary-foreground',
        mint:      'border-mint/30 bg-mint/10 text-mint',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline:   'text-foreground border-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
```

---

### 3.7 Avatar

**Файл:** `components/ui/Avatar.tsx`

```tsx
import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium', className)}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
```

---

### 3.8 Separator

**Файл:** `components/ui/Separator.tsx`

```tsx
import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      className
    )}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
```

---

## 4. Секции лендинга

### 4.1 Hero Section

**Файл:** `components/landing/HeroSection.tsx`

```tsx
'use client';

import { Button } from '@/components/ui/Button';
import { ArrowDown, Rocket, Zap } from 'lucide-react';

interface HeroSectionProps {
  locale: 'ru' | 'en';
}

export function HeroSection({ locale }: HeroSectionProps) {
  const t = translations[locale];
  
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Gradient ambient blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-mint/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cta/10 rounded-full blur-[80px] animate-pulse-slow delay-1000" />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto space-y-8">
        <Badge variant="mint" className="text-sm">
          <Zap className="w-3 h-3 mr-1" />
          {t.hero.badge}
        </Badge>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          {t.hero.title}
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {t.hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="cta" size="xl">
            <Rocket className="size-5" />
            {t.hero.cta}
          </Button>
          <Button variant="outline" size="lg">
            {t.hero.secondary}
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <a 
        href="#services" 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        aria-label="Scroll to services"
      >
        <ArrowDown className="w-6 h-6 text-muted-foreground" />
      </a>
    </section>
  );
}
```

**Паттерны:**
- `min-h-[90vh]` — почти полный экран
- Gradient blobs как фоновые элементы (`blur-[100px]`, `animate-pulse-slow`)
- Fade-up анимация для контента
- Bounce анимация для scroll indicator

---

### 4.2 Services/Features Block

**Файл:** `components/landing/ServicesBlock.tsx`

```tsx
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Zap, Shield, BarChart3, Bot, Clock, Globe } from 'lucide-react';

const services = [
  {
    icon: Bot,
    titleKey: 'services.items.0.title',
    descKey: 'services.items.0.desc',
  },
  {
    icon: BarChart3,
    titleKey: 'services.items.1.title',
    descKey: 'services.items.1.desc',
  },
  {
    icon: Shield,
    titleKey: 'services.items.2.title',
    descKey: 'services.items.2.desc',
  },
  {
    icon: Clock,
    titleKey: 'services.items.3.title',
    descKey: 'services.items.3.desc',
  },
  {
    icon: Zap,
    titleKey: 'services.items.4.title',
    descKey: 'services.items.4.desc',
  },
  {
    icon: Globe,
    titleKey: 'services.items.5.title',
    descKey: 'services.items.5.desc',
  },
];

interface ServicesBlockProps {
  locale: 'ru' | 'en';
}

export function ServicesBlock({ locale }: ServicesBlockProps) {
  const t = translations[locale];

  return (
    <section id="services" className="py-20 md:py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            {t.services.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.services.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div 
              key={index}
              className="reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card variant="mint" className="h-full group cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-mint/10 flex items-center justify-center mb-4 group-hover:bg-mint/20 transition-colors">
                    <service.icon className="w-6 h-6 text-mint" />
                  </div>
                  <CardTitle>{t(service.titleKey)}</CardTitle>
                  <CardDescription>{t(service.descKey)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="group-hover:text-mint transition-colors">
                    {locale === 'ru' ? 'Подробнее' : 'Learn more'}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Паттерны:**
- ID для навигации (`#services`)
- `py-20 md:py-28` — вертикальные отступы
- Grid `1 md:2 lg:3` — адаптивная сетка
- Staggered reveal анимация (`delay: index * 0.1s`)
- Icon в `48x48` container с rounded-xl
- Hover effects на карточках

---

### 4.3 Pricing Section

**Файл:** `components/landing/PricingSection.tsx`

```tsx
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Get started with the basics',
    features: [
      'Up to 3 projects',
      'Basic analytics',
      'Community support',
      'Custom domains',
    ],
    cta: 'Get Started',
    variant: 'outline' as const,
  },
  {
    name: 'Pro',
    price: '$10',
    period: '/month',
    description: 'Unlock powerful features',
    features: [
      'Unlimited projects',
      'Advanced analytics',
      'Priority email support',
      'Custom domains',
    ],
    cta: 'Get Started',
    variant: 'cta' as const,
    highlighted: true,
  },
];

export function PricingSection({ locale }: { locale: 'ru' | 'en' }) {
  return (
    <section id="pricing" className="py-20 md:py-28 px-6 bg-secondary/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            {locale === 'ru' ? 'Тарифы' : 'Pricing'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {locale === 'ru' 
              ? 'Выберите план, который подходит вам' 
              : 'Choose the plan that\'s right for you'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              variant={plan.highlighted ? 'mint' : 'default'}
              className={cn('relative', plan.highlighted && 'border-mint/50 shadow-xl')}
            >
              {plan.highlighted && (
                <Badge variant="mint" className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {locale === 'ru' ? 'Популярный' : 'Popular'}
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-mint shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant={plan.variant} className="w-full">
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Паттерны:**
- Фоновый цвет для секции (`bg-secondary/30`)
- Карточки с вариантами `mint` для выделенного плана
- Badge "Популярный" с позиционированием
- Список фич с иконками Check

---

### 4.4 FAQ Section

**Файл:** `components/landing/FAQSection.tsx`

```tsx
'use client';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/Accordion';

const faqItems = [
  {
    question: 'Что такое AI-автоматизация?',
    answer: 'AI-автоматизация — это использование искусственного интеллекта для оптимизации бизнес-процессов, сокращения рутинных задач и повышения эффективности работы.',
  },
  {
    question: 'Как начать работу?',
    answer: 'Просто оставьте заявку, и наша команда свяжется с вами в течение 24 часов для обсуждения деталей и подготовки предложения.',
  },
  {
    question: 'Сколько стоят услуги?',
    answer: 'Стоимость зависит от объёма и сложности проекта. Мы предлагаем гибкие тарифы и индивидуальные решения для каждого клиента.',
  },
  {
    question: 'Какие сроки реализации?',
    answer: 'Стандартные проекты занимают от 2 до 8 недель в зависимости от масштаба. Срочные задачи обсуждаются отдельно.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Часто задаваемые вопросы
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
```

**Паттерны:**
- `max-w-3xl` — узкий контейнер для удобного чтения
- `type="single" collapsible` — только один открыт одновременно
- Текст question крупнее (`text-lg`)

---

### 4.5 CTA Section (архивный пример, заменён `LeadFormSection`)

**Статус:** заменён актуальным `components/landing/LeadFormSection.tsx`.

```tsx
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export function CTASection() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    // Simulate submission
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <section id="contact" className="py-20 md:py-28 px-6 bg-gradient-to-b from-secondary/50 to-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Copy */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Готовы начать?
            </h2>
            <p className="text-lg text-muted-foreground">
              Свяжитесь с нами, и мы поможем вам автоматизировать бизнес-процессы с помощью AI.
            </p>
            <div className="space-y-4">
              <h3 className="font-semibold">Или напишите напрямую:</h3>
              <div className="flex gap-4">
                <Button variant="outline" asChild>
                  <a href="https://max.ru/username" target="_blank" rel="noopener">
                    MAX
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://vk.com/username" target="_blank" rel="noopener">
                    VK
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <Card>
            <CardHeader>
              <CardTitle>Оставить заявку</CardTitle>
              <CardDescription>Мы ответим в течение 24 часов</CardDescription>
            </CardHeader>
            <CardContent>
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-mint" />
                  <p className="text-lg font-medium">Заявка отправлена!</p>
                  <p className="text-muted-foreground">Мы свяжемся с вами в ближайшее время</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input placeholder="Ваше имя" required />
                  <Input placeholder="Email или телефон" required />
                  <Textarea placeholder="Расскажите о вашем проекте" required />
                  <Button type="submit" variant="cta" className="w-full" disabled={status === 'loading'}>
                    {status === 'loading' ? (
                      'Отправка...'
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Отправить
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
```

**Паттерны:**
- Grid layout: copy слева, form справа
- Gradient background для визуального разделения
- Form states: idle → loading → success/error
- Социальные ссылки как fallback

---

### 4.6 Footer

**Файл:** `components/landing/Footer.tsx`

```tsx
export function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © 2024 SigmaBots. All rights reserved.
        </p>
        <nav className="flex items-center gap-6">
          <a href="#hero" className="text-sm hover:text-foreground transition-colors">
            {locale === 'ru' ? 'Главная' : 'Home'}
          </a>
          <a href="#contact" className="text-sm hover:text-foreground transition-colors">
            {locale === 'ru' ? 'Контакты' : 'Contact'}
          </a>
        </nav>
      </div>
    </footer>
  );
}
```

**Паттерны:**
- Single row layout
- Copyright слева, навигация справа
- Stacks vertically на mobile

---

## 5. Анимации и Motion

### 5.1 Scroll Reveal

**Хук:** `hooks/use-scroll-reveal.ts`

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions extends IntersectionObserverInit {
  threshold?: number;
}

export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px', ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}
```

**CSS:** (в globals.css)

```css
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.reveal.visible,
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

**Использование:**

```tsx
function ServiceCard({ index, ...props }) {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <div 
      ref={ref} 
      className={cn('reveal', isVisible && 'visible')}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      {/* Card content */}
    </div>
  );
}
```

### 5.2 Stagger Animation

```tsx
// Staggered fade-up для группы элементов
const staggerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

// framer-motion версия
<motion.div
  variants={staggerVariants}
  initial="hidden"
  animate="visible"
  custom={index}
/>
```

### 5.3 Gradient Pulse

```css
@keyframes pulse-slow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%       { opacity: 0.6; transform: scale(1.05); }
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

.delay-1000 {
  animation-delay: 1s;
}
```

### 5.4 Bounce Scroll Indicator

```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}

.animate-bounce {
  animation: bounce 2s ease-in-out infinite;
}
```

---

## 6. Расширение до Shadcn UI

### 6.1 Установка

```bash
# Инициализация
npx shadcn@latest init

# components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "~/components",
    "utils": "~/lib/utils",
    "ui": "~/components/ui",
    "lib": "~/lib",
    "hooks": "~/hooks"
  },
  "iconLibrary": "lucide"
}
```

### 6.2 Полный список компонентов

| Приоритет | Компонент | Radix примитив |
|-----------|-----------|---------------|
| **Высокий** | Badge | — |
| | Avatar | @radix-ui/react-avatar |
| | Separator | @radix-ui/react-separator |
| | Alert | @radix-ui/react-alert |
| | Skeleton | — |
| **Средний** | Dialog | @radix-ui/react-dialog |
| | Dropdown Menu | @radix-ui/react-dropdown-menu |
| | Tabs | @radix-ui/react-tabs |
| | Sheet | @radix-ui/react-dialog |
| | Tooltip | @radix-ui/react-tooltip |
| | Popover | @radix-ui/react-popover |
| | Navigation Menu | @radix-ui/react-navigation-menu |
| **Низкий** | Calendar | — |
| | Data Table | — |
| | Carousel | — |
| | Progress | — |
| | Toast | @radix-ui/react-toast |
| | Command | @radix-ui/react-command |

### 6.3 Установка компонентов

```bash
# Базовые (уже есть или в процессе)
npx shadcn@latest add badge avatar separator

# Интерактивные
npx shadcn@latest add dialog dropdown-menu tabs sheet tooltip popover

# Фидбэк
npx shadcn@latest add alert skeleton toast progress
```

---

## 7. Структура файлов

```
TAIGA_ULTIMATE/
├── app/
│   ├── globals.css              # Дизайн-токены (CSS variables)
│   └── [locale]/
│       ├── layout.tsx           # ThemeProvider, next-intl
│       └── page.tsx             # Landing page (композиция секций)
│
├── components/
│   ├── ui/                      # UI примитивы
│   │   ├── Button.tsx           # ✅ Готово
│   │   ├── Input.tsx            # ✅ Готово
│   │   ├── Textarea.tsx         # ✅ Готово
│   │   ├── Accordion.tsx         # ✅ Готово
│   │   ├── Badge.tsx             # 📋 Запланировано
│   │   ├── Avatar.tsx           # 📋 Запланировано
│   │   ├── Separator.tsx        # 📋 Запланировано
│   │   └── Alert.tsx            # 📋 Запланировано
│   │
│   ├── layout/                  # Лейаут компоненты
│   │   ├── Header.tsx           # 📋 Запланировано
│   │   ├── Footer.tsx           # 📋 Запланировано
│   │   ├── ThemeSwitcher.tsx    # 📋 Запланировано
│   │   └── LangSwitcher.tsx     # 📋 Запланировано
│   │
│   ├── landing/                 # Секции лендинга
│   │   ├── HeroSection.tsx      # 📋 Запланировано
│   │   ├── ServicesBlock.tsx    # 📋 Запланировано
│   │   ├── PricingSection.tsx    # 📋 Запланировано
│   │   ├── FAQSection.tsx       # 📋 Запланировано
│   │   ├── LeadFormSection.tsx  # ✅ Готово
│   │   └── WhyMeBlock.tsx       # 📋 Запланировано
│   │
│   └── providers/
│       └── ThemeProvider.tsx    # next-themes wrapper
│
├── hooks/
│   └── use-scroll-reveal.ts     # Intersection Observer
│
├── lib/
│   └── utils.ts                 # cn(), formatDate()
│
└── messages/
    ├── ru.json                  # Русские переводы
    └── en.json                   # English translations
```

---

## 8. Порядок внедрения (Roadmap)

### Фаза 1: Фундамент (UI примитивы)

```
Приоритет 1:
├── Button.tsx          ✅ Завершено
├── Input.tsx          ✅ Завершено
├── Textarea.tsx       ✅ Завершено
├── Accordion.tsx      ✅ Завершено
│
Приоритет 2:
├── Badge.tsx          📋 Добавить
├── Avatar.tsx         📋 Добавить
├── Separator.tsx      📋 Добавить
└── Alert.tsx          📋 Добавить
```

### Фаза 2: Лендинг секции

```
Неделя 1-2:
├── HeroSection.tsx          📋 Сверстать
├── use-scroll-reveal.ts     📋 Реализовать
│
Неделя 3-4:
├── ServicesBlock.tsx       📋 Сверстать
├── WhyMeBlock.tsx          📋 Сверстать
│
Неделя 5-6:
├── PricingSection.tsx      📋 Сверстать
├── FAQSection.tsx          📋 Сверстать
│
Неделя 7-8:
├── LeadFormSection.tsx     ✅ Завершено
├── Footer.tsx              📋 Сверстать
└── Header.tsx              📋 Сверстать
```

### Фаза 3: Интерактивность

```
├── Dialog (модалки)
├── Dropdown Menu
├── Tabs
├── Sheet (sidebars)
├── Tooltip
└── Popover
```

### Фаза 4: Фидбэк и данные

```
├── Toast notifications
├── Progress bars
├── Skeleton loaders
└── Data Table
```

---

## 9. Checklist качества

### Код
- [ ] Все компоненты используют `forwardRef`
- [ ] Все компоненты экспортируют типы Props
- [ ] Используется `cn()` для мержинга классов
- [ ] Нет `any` типов
- [ ] Соблюдается порядок: imports → types → component
- [ ] displayName установлен для всех forwardRef компонентов

### Дизайн
- [ ] Все цвета через CSS variables (HSL формат)
- [ ] Hover/focus/active состояния для всех interactive элементов
- [ ] Disabled состояния визуально отличаются
- [ ] Тени применяются консистентно
- [ ] Spacing по 8px grid
- [ ] Border-radius консистентен (--radius-* variables)

### Анимации
- [ ] Scroll reveal на всех секциях
- [ ] Stagger delay для групп карточек (index * 0.1s)
- [ ] Hover transitions (200-300ms)
- [ ] Без резких изменений (ease-out)

### Доступность
- [ ] Все buttons с accessible labels или aria-label
- [ ] Form elements связаны с labels
- [ ] Цветовой контраст ≥ 4.5:1
- [ ] Keyboard navigation работает
- [ ] Focus states видимы (ring)
- [ ] Accordion с proper ARIA

---

## Reference Links

- [ChadNext Template](https://chadnext.moinulmoin.com/en/)
- [Shadcn UI Docs](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [class-variance-authority](https://cva.style/)
- [Inter Font](https://fonts.google.com/specimen/Inter)
- [Heroicons (alternative)](https://heroicons.com/)
