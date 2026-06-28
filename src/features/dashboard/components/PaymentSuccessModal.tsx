import { DialogPortal } from "./DialogPortal";
import { Icon } from "./Icon";

type PaymentSuccessModalProps = {
  title: string;
  description: string;
  amount: number;
  method: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function PaymentSuccessModal({
  title,
  description,
  amount,
  method,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: PaymentSuccessModalProps) {
  return (
    <DialogPortal>
      <div className="vih-overlay" onClick={onPrimary}>
        <div
          className="vih-success-modal"
          role="dialog"
          aria-modal="true"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="vih-success-confetti" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>

          <div className="vih-success-check" aria-hidden="true">
            <Icon name="Check" size={36} color="#fff" stroke={3.2} />
          </div>

          <h2 className="vih-success-title">{title}</h2>
          <p className="vih-success-desc">{description}</p>

          <div className="vih-success-amount">
            <span>Total cobrado</span>
            <strong>{formatMoney(amount)}</strong>
            <span className="vih-success-method">via {method}</span>
          </div>

          <div className="vih-success-actions">
            {secondaryLabel && onSecondary && (
              <button type="button" className="vih-ghost" onClick={onSecondary}>
                {secondaryLabel}
              </button>
            )}
            <button type="button" className="vih-primary" onClick={onPrimary}>
              {primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </DialogPortal>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
