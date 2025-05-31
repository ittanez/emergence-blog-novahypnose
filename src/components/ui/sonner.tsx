 import * as React from "react"

// Version simplifiée temporaire pour éviter les erreurs de build
type ToasterProps = {
  className?: string
  children?: React.ReactNode
}

const Toaster = ({ className, children, ...props }: ToasterProps) => {
  return <div id="sonner-root" className={className} {...props} />
}

// Mock de la fonction toast
const toast = {
  success: (message: string) => console.log('Toast success:', message),
  error: (message: string) => console.log('Toast error:', message),
  info: (message: string) => console.log('Toast info:', message),
}

export { Toaster, toast }
