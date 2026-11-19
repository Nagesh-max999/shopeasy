import { MinusIcon, PlusIcon } from './Icons.jsx';

export default function QtyStepper({ value, max, onChange, small }) {
  return (
    <div className={`stepper ${small ? 'stepper-sm' : ''}`}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease">
        <MinusIcon size="0.95em" />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase">
        <PlusIcon size="0.95em" />
      </button>
    </div>
  );
}
