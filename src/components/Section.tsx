import { type ReactNode } from 'react'

interface SectionProps {
  id?: string
  title?: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  className?: string
  containerClassName?: string
  centered?: boolean
  sectionNumber?: string
}

export function Section({
  id,
  title,
  subtitle,
  children,
  className = '',
  containerClassName = '',
  centered = false,
  sectionNumber
}: SectionProps) {
  return (
    <section id={id} className={`${className}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
        {(title || subtitle || sectionNumber) && (
          <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
            {sectionNumber && (
              <p className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-widest">
                [{sectionNumber}]
              </p>
            )}
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </section>
  )
}
