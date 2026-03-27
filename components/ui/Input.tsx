import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  helpText?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      error,
      label,
      helpText,
      startIcon,
      endIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className='w-full'>
        {label && (
          <label className='block text-sm font-medium text-foreground mb-2'>
            {label}
          </label>
        )}
        <div className='relative flex items-center'>
          {startIcon && (
            <div className='absolute left-3 flex items-center pointer-events-none text-muted-foreground'>
              {startIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-glow disabled:cursor-not-allowed disabled:opacity-50 transition-all-smooth',
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              error && 'border-destructive focus:ring-destructive',
              className
            )}
            disabled={disabled}
            ref={ref}
            {...props}
          />
          {endIcon && (
            <div className='absolute right-3 flex items-center pointer-events-none text-muted-foreground'>
              {endIcon}
            </div>
          )}
        </div>
        {error && (
          <p className='text-xs text-destructive mt-1'>{error}</p>
        )}
        {helpText && !error && (
          <p className='text-xs text-muted-foreground mt-1'>{helpText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
