'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

interface CraftButtonContextValue {
  size?: 'sm' | 'default' | 'lg'
  bgColor?: string
  textColor?: string
}

const CraftButtonContext = React.createContext<CraftButtonContextValue>({})

interface CraftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'default' | 'lg'
  children?: React.ReactNode
  asChild?: boolean
  bgColor?: string
  textColor?: string
}

interface CraftButtonLabelProps {
  children: React.ReactNode
  className?: string
}

interface CraftButtonIconProps {
  children: React.ReactNode
  className?: string
}

function CraftButtonLabel({ children, className }: CraftButtonLabelProps) {
  const { bgColor } = React.useContext(CraftButtonContext)

  return (
    <span
      className={cn(
        'relative z-20 transition-colors duration-500',
        className
      )}
      style={{
        // On hover, text changes to bgColor to contrast with white expanding circle
        // Using CSS custom property for hover state
      }}
    >
      {/* Normal state text */}
      <span className="transition-opacity duration-500 group-hover:opacity-0">
        {children}
      </span>
      {/* Hover state text - shows bgColor to contrast with white circle */}
      <span
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ color: bgColor || '#18181b' }}
      >
        {children}
      </span>
    </span>
  )
}

function CraftButtonIcon({ children, className }: CraftButtonIconProps) {
  const { size, bgColor, textColor } = React.useContext(CraftButtonContext)
  const iconSize = size === 'lg' ? 'size-6' : size === 'sm' ? 'size-4' : 'size-5'

  return (
    <span
      className={cn('relative z-10', iconSize, className)}
    >
      {/* Expanding circle on hover - uses textColor for contrast, expands to cover the button */}
      <span
        className={cn(
          'absolute inset-0 -z-10 rounded-full transition-transform duration-500 ease-out group-hover:scale-[15]',
          iconSize
        )}
        style={{ backgroundColor: textColor || '#ffffff' }}
      />
      {/* Icon container - textColor bg with bgColor icon */}
      <span
        className={cn(
          'relative z-20 flex items-center justify-center rounded-full',
          iconSize
        )}
        style={{
          backgroundColor: textColor || '#ffffff',
          color: bgColor || '#18181b',
        }}
      >
        {children}
      </span>
    </span>
  )
}

function CraftButton(props: CraftButtonProps) {
  const {
    children,
    size = 'default',
    asChild = false,
    className,
    bgColor = '#18181b',
    textColor = '#ffffff',
    style,
    ...rest
  } = props

  const Comp = asChild ? Slot : 'button'

  // Get height based on size
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-9 px-4 text-sm',
    lg: 'h-10 px-6 text-base',
  }

  return (
    <CraftButtonContext.Provider value={{ size, bgColor, textColor }}>
      <Comp
        className={cn(
          'group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full font-medium transition-all duration-500',
          'hover:shadow-lg',
          sizeClasses[size],
          className
        )}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          ...style,
        }}
        {...rest}
      >
        {children}
      </Comp>
    </CraftButtonContext.Provider>
  )
}

export {
  CraftButton,
  CraftButtonLabel,
  CraftButtonIcon,
  type CraftButtonProps,
  type CraftButtonLabelProps,
  type CraftButtonIconProps
}
