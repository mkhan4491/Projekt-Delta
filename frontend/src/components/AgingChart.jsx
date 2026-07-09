import { computeAgingBuckets } from '../utils/invoiceLogic';

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const BAR_MODIFIERS = ['ok', 'b30', 'b60', 'b90', 'b90plus'];

export default function AgingChart({ invoices }) {
  const buckets = computeAgingBuckets(invoices);
  const maxAmount = Math.max(...buckets.map(b => b.amount)) || 1;

  return (
    <div className="aging-chart">
      {buckets.map((bucket, i) => (
        <div key={bucket.label} className="aging-chart__row">
          <span className="aging-chart__label">{bucket.label}</span>
          <div className="aging-chart__track">
            <div
              className={`aging-chart__bar aging-chart__bar--${BAR_MODIFIERS[i]}`}
              style={{ width: `${(bucket.amount / maxAmount) * 100}%` }}
            />
          </div>
          <span className="aging-chart__value">
            {currencyFormatter.format(bucket.amount)}
            <span className="aging-chart__count"> · {bucket.count} Rg.</span>
          </span>
        </div>
      ))}
    </div>
  );
}
