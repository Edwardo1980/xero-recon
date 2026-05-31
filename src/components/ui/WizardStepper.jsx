export default function WizardStepper({ step }) {
  const steps = ['Create app', 'Connect', 'Ready'];
  return (
    <div className="wizard-stepper" aria-label="Setup progress">
      {steps.map((label, i) => {
        const n = i + 1;
        const done   = n < step;
        const active = n === step;
        return (
          <>
            <div key={label} className={`wstep ${done ? 'done' : active ? 'active' : ''}`}>
              <span className="wstep-num" aria-current={active ? 'step' : undefined}>
                {done ? '✓' : n}
              </span>
              <span>{label}</span>
            </div>
            {i < steps.length - 1 && <div key={`line-${i}`} className="wstep-line" />}
          </>
        );
      })}
    </div>
  );
}
