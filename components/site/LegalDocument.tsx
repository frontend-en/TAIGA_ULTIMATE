import type { LegalDocument as LegalDocumentData } from '@/lib/site/legal';

interface LegalDocumentProps {
  document: LegalDocumentData;
}

export function LegalDocument({ document }: LegalDocumentProps) {
  return (
    <article className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <p className="mb-10 text-sm text-muted-foreground">{document.effectiveDate}</p>
      <div className="space-y-10">
        {document.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-2xl font-semibold tracking-tight">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-4 leading-7 text-muted-foreground">{paragraph}</p>)}
            {section.items ? (
              <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-muted-foreground">
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </article>
  );
}
