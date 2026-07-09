import { Link } from 'react-router-dom';
import { useData } from '../context/useData.js';
import { computeKpiStats } from '../utils/invoiceLogic';
import KpiCards from '../components/KpiCards.jsx';
import AgingChart from '../components/AgingChart.jsx';
import MahnstufeBadge from '../components/MahnstufeBadge.jsx';

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

export default function DashboardPage() {
  const { invoices } = useData();
  const stats = computeKpiStats(invoices);

  const critical = invoices
    .filter(inv => inv.status !== 'bezahlt' && inv.overdueDays > 0)
    .sort((a, b) => b.overdueDays - a.overdueDays)
    .slice(0, 5);

  return (
    <>
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Überblick über alle Forderungen</p>
      </header>

      <KpiCards stats={stats} />

      <div className="dashboard-grid">
        <div className="panel-card">
          <h2 className="panel-card__title">Altersstruktur offener Forderungen</h2>
          <AgingChart invoices={invoices} />
        </div>

        <div className="panel-card">
          <h2 className="panel-card__title">Kritische Rechnungen</h2>
          {critical.length === 0 ? (
            <p className="historie-empty">Keine überfälligen Rechnungen. 🎉</p>
          ) : (
            <div className="critical-list">
              {critical.map(inv => (
                <Link key={inv.id} to="/rechnungen" className="critical-list__item">
                  <div>
                    <div className="cell-customer__name">{inv.kunden?.firmenname}</div>
                    <div className="cell-customer__contact">{inv.rechnungsnummer} · {currencyFormatter.format(inv.betrag)}</div>
                  </div>
                  <div className="critical-list__right">
                    <span className="cell-overdue">{inv.overdueDays} Tage</span>
                    <MahnstufeBadge stufe={inv.mahnstufe} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
