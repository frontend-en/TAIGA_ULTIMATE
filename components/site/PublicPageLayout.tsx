import type { ReactNode } from 'react';

interface PublicPageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function PublicPageLayout({ title, description, children }: PublicPageLayoutProps) {
  return (
    <main className="min-h-screen">
      <section className="border-b bg-primary-subtle/40 px-4 py-14 sm:py-20">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          {description ? <p className="mt-5 max-w-3xl text-lg text-muted-foreground">{description}</p> : null}
        </div>
      </section>
      {children}
    </main>
  );
}
