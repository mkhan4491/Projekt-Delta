const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

function KpiCard({ label, value, variant }) {
  const valueClass = variant
    ? `kpi-card__value kpi-card__value--${variant}`
    : 'kpi-card__value';
  return (
    <div className="kpi-card">
      <div className="kpi-card__label">{label}</div>
      <div className={valueClass}>{value}</div>
    </div>
  );
}

export default function KpiCards({ stats }) {
  return (
    <div className="kpi-grid">
      <KpiCard
        label="Offene Forderungen"
        value={currencyFormatter.format(stats.totalOpen)}
      />
      <KpiCard
        label="Offene Rechnungen"
        value={stats.countOpen}
      />
      <KpiCard
        label="In Mahnung"
        value={stats.countGemahnt}
        variant={stats.countGemahnt > 0 ? 'warning' : null}
      />
      <KpiCard
        label="Stufe 3 — Dringend"
        value={stats.countUrgent}
        variant={stats.countUrgent > 0 ? 'danger' : null}
      />
      <KpiCard
        label="Bezahlt (gesamt)"
        value={currencyFormatter.format(stats.totalBezahlt)}
      />
    </div>
  );
}
