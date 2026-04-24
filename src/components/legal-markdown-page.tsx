import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type LegalMarkdownPageProps = {
  title: string;
  subtitle: string;
  markdown: string;
};

export function LegalMarkdownPage({ title, subtitle, markdown }: LegalMarkdownPageProps) {
  return (
    <main className="min-h-[70vh] bg-gradient-to-b from-slate-50 via-white to-slate-100/70">
      <section className="border-b border-slate-200/80 bg-white/70">
        <div className="container mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">Legal</p>
          <h1 className="mt-3 text-3xl font-headline font-bold text-slate-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">{subtitle}</p>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10">
          <div className="text-base leading-8 text-slate-700 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:rounded-r-lg [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:bg-slate-50 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.92em] [&_h1]:mt-8 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-slate-900 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_hr]:my-8 [&_hr]:border-slate-200 [&_li]:my-2 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-2 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          </div>
        </article>
      </section>
    </main>
  );
}
