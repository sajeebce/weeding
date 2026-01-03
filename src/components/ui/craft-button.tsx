'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

interface CraftButtonContextValue {
  size?: 'sm' | 'default' | 'lg'
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
  return (
    <span
      className={cn(
        'relative z-20 transition-colors duration-500 group-hover:text-zinc-900',
        className
      )}
    >
      {children}
    </span>
  )
}

function CraftButtonIcon({ children, className }: CraftButtonIconProps) {
  const { size } = React.useContext(CraftButtonContext)
  const iconSize = size === 'lg' ? 'size-6' : size === 'sm' ? 'size-4' : 'size-5'

  return (
    <span className={cn('relative z-10', iconSize, className)}>
      {/* Expanding circle on hover */}
      <span
        className={cn(
          'absolute inset-0 -z-10 rounded-full bg-white transition-transform duration-500 ease-out group-hover:scale-[15]',
          iconSize
        )}
      />
      {/* Icon container */}
      <span
        className={cn(
          'relative z-20 flex items-center justify-center rounded-full bg-white text-zinc-900 transition-all duration-500 group-hover:bg-zinc-900 group-hover:text-white',
          iconSize
        )}
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
    onMouseEnter,
    onMouseLeave,
    ...rest
  } = props

  const [isHovered, setIsHovered] = React.useState(false)
  const Comp = asChild ? Slot : 'button'

  // Get height based on size
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-9 px-4 text-sm',
    lg: 'h-10 px-6 text-base',
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(true)
    onMouseEnter?.(e)
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(false)
    onMouseLeave?.(e)
  }

  return (
    <CraftButtonContext.Provider value={{ size }}>
      <Comp
        className={cn(
          'group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full font-medium transition-all duration-500',
          sizeClasses[size],
          className
        )}
        style={{
          backgroundColor: isHovered ? '#ffffff' : bgColor,
          color: textColor,
          boxShadow: isHovered ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)' : undefined,
          ...style,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
