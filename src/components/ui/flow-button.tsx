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
  /** Custom ring color for the flow animation border */
  ringColor?: string
}

function PrimaryFlowButton({ children, size, asChild = false, className, disabled, ringColor, style, ...props }: FlowButtonProps) {
  // Merge wrapper styles - ringColor controls the animated border color
  const wrapperStyle: React.CSSProperties = {
    ...(ringColor ? { '--flow-ring-color': ringColor } : {}),
  } as React.CSSProperties

  return (
    <div
      className={cn('flow-button-wrapper', disabled && 'flow-button-disabled', className)}
      style={wrapperStyle}
    >
      <Button
        size={size}
        asChild={asChild}
        className={cn(
          'flow-button',
          !disabled && 'hover:bg-primary',
          size === 'lg' && 'text-base'
        )}
        disabled={disabled}
        style={style}
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
