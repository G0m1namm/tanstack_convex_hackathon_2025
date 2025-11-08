import { type ReactNode } from 'react'

interface SectionProps {
  id?: string
  title?: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  className?: string
  containerClassName?: string
  centered?: boolean
}

export function Section({
  id,
  title,
  subtitle,
  children,
  className = '',
  containerClassName = '',
  centered = false
}: SectionProps) {
  return (
    <section id={id} className={`py-16 ${className}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
        {(title || subtitle) && (
          <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
            {title && (
              <h2 className="text-3xl font-medium mb-4" style={{ color: 'color(display-p3 0.14902 0.14902 0.14902)' }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
