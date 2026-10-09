/** Design "sec": small uppercase heading with a rule running to the right. */
export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5">
      <h3 className="flex items-center gap-2 text-xs font-semibold tracking-[.04em] text-muted-foreground uppercase after:h-px after:flex-1 after:bg-border after:content-['']">
        {title}
      </h3>
      {children}
    </section>
  );
}
