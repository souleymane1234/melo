import { FaCheck, FaShieldHalved } from 'react-icons/fa6'
import './CaptchaField.css'

type CaptchaFieldProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function CaptchaField({
  checked,
  onChange,
  disabled = false,
  className = '',
}: CaptchaFieldProps) {
  return (
    <label
      className={`captcha-field${checked ? ' captcha-field--checked' : ''}${disabled ? ' captcha-field--disabled' : ''}${className ? ` ${className}` : ''}`}
    >
      <input
        type="checkbox"
        className="captcha-field__input"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        required
      />
      <span className="captcha-field__box" aria-hidden="true">
        {checked ? <FaCheck /> : null}
      </span>
      <span className="captcha-field__body">
        <strong className="captcha-field__title">Vérification humaine</strong>
        <span className="captcha-field__text">
          Je confirme ne pas être un robot et que cette action est effectuée par un humain.
          <em className="captcha-field__required"> *</em>
        </span>
      </span>
      <span className="captcha-field__badge" aria-hidden="true">
        <FaShieldHalved />
        <span>WorldSkills Côte d&apos;Ivoire</span>
      </span>
    </label>
  )
}
