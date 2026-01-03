'use client'

import * as React from 'react'

import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { Button, type buttonVariants } from '@/components/ui/button'

interface FlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: VariantProps<typeof buttonVariants>['size']
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

function PrimaryFlowButton({ children, size, asChild = false, className, ...props }: FlowButtonProps) {
  return (
    <div className={cn('flow-button-wrapper', className)}>
      <Button
        size={size}
        asChild={asChild}
        className={cn(
          'flow-button hover:bg-primary',
          size === 'lg' && 'text-base'
        )}
        {...props}
      >
        {children}
      </Button>
    </div>
  )
}

function SecondaryFlowButton({ children, size, asChild = false, className, ...props }: FlowButtonProps) {
  return (
    <div
      className={cn('flow-button-wrapper', className)}
      style={{ '--flow-ring-color': 'var(--color-secondary)' } as React.CSSProperties}
    >
      <Button
        size={size}
        variant='secondary'
        asChild={asChild}
        className={cn(
          'flow-button hover:bg-secondary',
          size === 'lg' && 'text-base'
        )}
        {...props}
      >
        {children}
      </Button>
    </div>
  )
}

export { PrimaryFlowButton, SecondaryFlowButton, type FlowButtonProps }
