import { useState, type ComponentPropsWithoutRef } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'
import './PasswordInput.css'

type PasswordInputProps = ComponentPropsWithoutRef<'input'>

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={`password-input${className ? ` ${className}` : ''}`}>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className="password-input__field"
      />
      <button
        type="button"
        className="password-input__toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        aria-pressed={visible}
        tabIndex={-1}
      >
        {visible ? <FaEyeSlash aria-hidden /> : <FaEye aria-hidden />}
      </button>
    </div>
  )
}
