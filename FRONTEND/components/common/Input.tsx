import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
}

// Usamos forwardRef para pasar la referencia (ref) al elemento input nativo
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref} // 👈 Aquí conectamos la referencia externa al input real
          id={id}
          className={`w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${className}`}
          {...props}
        />
      </div>
    );
  }
);

// Es buena práctica poner un displayName al usar forwardRef para facilitar el debugging
Input.displayName = 'Input';

export default Input;