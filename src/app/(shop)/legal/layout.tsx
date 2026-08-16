export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8">
      <div className="flex flex-col gap-6 [&_h1]:font-heading [&_h1]:text-display [&_h1]:text-ink [&_h2]:font-heading [&_h2]:mt-6 [&_h2]:text-h2 [&_h2]:text-ink [&_p]:text-body [&_p]:text-ink/70 [&_li]:text-body [&_li]:text-ink/70 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1">
        {children}
      </div>
    </div>
  )
}
