'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import { CRAFT_BG_DARK, WHITE } from '@/lib/button-constants'

interface CraftButtonContextValue {
  size?: 'sm' | 'default' | 'lg'
  isPreview?: boolean
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
  const { isPreview } = React.useContext(CraftButtonContext)
  return (
    <span
      className={cn(
        'relative z-20 transition-colors duration-500',
        !isPreview && 'group-hover:text-zinc-900',
        className
      )}
    >
      {children}
    </span>
  )
}

function CraftButtonIcon({ children, className }: CraftButtonIconProps) {
  const { size, isPreview } = React.useContext(CraftButtonContext)
  const iconSize = size === 'lg' ? 'size-6' : size === 'sm' ? 'size-4' : 'size-5'

  // Clone children and add rotation class directly to the icon element
  const rotatingIcon = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(
          (children as React.ReactElement<{ className?: string }>).props.className,
          'transition-transform duration-500',
          !isPreview && 'group-hover:rotate-45'
        ),
      })
    : children

  return (
    <span className={cn('relative z-10', iconSize, className)}>
      {/* Expanding circle on hover */}
      <span
        className={cn(
          'absolute inset-0 -z-10 rounded-full bg-white transition-transform duration-500 ease-out',
          !isPreview && 'group-hover:scale-[15]',
          iconSize
        )}
      />
      {/* Icon container with built-in icon rotation */}
      <span
        className={cn(
          'relative z-20 flex items-center justify-center rounded-full bg-white text-zinc-900 transition-all duration-500',
          !isPreview && 'group-hover:bg-zinc-900 group-hover:text-white',
          iconSize
        )}
      >
        {rotatingIcon}
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
    bgColor = CRAFT_BG_DARK,
    textColor = WHITE,
    style,
    onMouseEnter,
    onMouseLeave,
    disabled,
    ...rest
  } = props

  const [isHovered, setIsHovered] = React.useState(false)
  const Comp = asChild ? Slot : 'button'

  // When disabled, don't apply hover state (used for preview mode)
  const effectiveHover = disabled ? false : isHovered

  // Get height based on size
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-9 px-4 text-sm',
    lg: 'h-10 px-6 text-base',
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    setIsHovered(true)
    onMouseEnter?.(e)
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    setIsHovered(false)
    onMouseLeave?.(e)
  }

  return (
    <CraftButtonContext.Provider value={{ size, isPreview: disabled }}>
      <Comp
        className={cn(
          'group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full font-medium transition-all duration-500',
          sizeClasses[size],
          className
        )}
        style={{
          backgroundColor: effectiveHover ? '#ffffff' : bgColor,
          color: textColor,
          boxShadow: effectiveHover ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)' : undefined,
          ...style,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
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
