interface FormFieldProps {
  label?: string
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ label, hint, error, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      {children}
      {!error && hint && <p className="field-hint">{hint}</p>}
      {error && <p className="error-msg" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  )
}
