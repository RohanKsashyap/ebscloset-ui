interface InfoPageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function InfoPage({ title, subtitle, children }: InfoPageProps) {
  return (
    <main className="bg-white">
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl mb-4 sm:mb-6 text-gray-800">{title}</h1>
          {subtitle && (
            <p className="text-xs sm:text-sm tracking-[0.25em] sm:tracking-[0.3em] uppercase text-rose-gold">{subtitle}</p>
          )}
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl p-5 sm:p-8 bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl text-gray-800 leading-relaxed space-y-6">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
