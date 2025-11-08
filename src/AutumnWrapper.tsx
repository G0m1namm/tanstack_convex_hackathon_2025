import type { ReactNode } from 'react'
import { AutumnProvider } from 'autumn-js/react'
import { useConvex } from 'convex/react'
import { api } from '../convex/_generated/api'

type AutumnWrapperProps = {
  children: ReactNode
}

export function AutumnWrapper({ children }: AutumnWrapperProps) {
  const convex = useConvex()

  return (
    <AutumnProvider convex={convex} convexApi={(api as any).autumn}>
      {children}
    </AutumnProvider>
  )
}

