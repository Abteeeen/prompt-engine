import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  help?: string
  error?: string
  icon?: React.ReactNode
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  help?: string
  error?: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  help?: string
  error?: string
  options: string[]
}

function FieldWrapper({ label, help, error, children }: { label?: string; help?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-gray-300 tracking-wide">{label}</label>}
      {children}
      {help && !error && <p className="text-xs text-gray-500">{help}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Input({ label, help, error, icon, className = '', ...props }: InputProps) {
  return (
    <FieldWrapper label={label} help={help} error={error}>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">{icon}</span>}
        <input
          className={`input-base ${icon ? 'pl-9' : ''} ${error ? 'border-red-500/50 focus:border-red-500/70' : ''} ${className}`}
          {...props}
        />
      </div>
    </FieldWrapper>
  )
}

export function Textarea({ label, help, error, className = '', ...props }: TextareaProps) {
  return (
    <FieldWrapper label={label} help={help} error={error}>
      <textarea
        className={`input-base resize-none min-h-[80px] ${error ? 'border-red-500/50' : ''} ${className}`}
        {...props}
      />
    </FieldWrapper>
  )
}

export function Select({ label, help, error, options, className = '', ...props }: SelectProps) {
  return (
    <FieldWrapper label={label} help={help} error={error}>
      <select
        className={`input-base appearance-none cursor-pointer ${error ? 'border-red-500/50' : ''} ${className}`}
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, 
          backgroundRepeat: 'no-repeat', 
          backgroundPosition: 'right 12px center' 
        }}
        {...props}
      >
        <option value="" disabled className="bg-[var(--bg-2)] text-[var(--text)]">Select...</option>
        {options.map(o => (
          <option key={o} value={o} className="bg-[var(--bg-2)] text-[var(--text)]">
            {o}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
}
