import { Link, useParams } from 'react-router-dom';
import { useData } from '../context/useData.js';
import { aggregateByKunde } from '../utils/invoiceLogic';
import MahnstufeBadge from '../components/MahnstufeBadge.jsx';

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

const EMPTY_AGG = { offenSumme: 0, countOffen: 0, countGemahnt: 0, countBezahlt: 0 };

export default function KundeDetailPage() {
  const { id } = useParams();
  const { invoices, kundenListe } = useData();

  const kunde = kundenListe.find(k => String(k.id) === id);

  if (!kunde) {
    return (
      <>
        <header className="page-header">
          <h1>Kunde nicht gefunden</h1>
          <p><Link to="/kunden">← Zurück zur Kundenliste</Link></p>
        </header>
      </>
    );
  }

  const kundenRechnungen = invoices.filter(inv => inv.kunden_id === kunde.id);
  const agg = aggregateByKunde(invoices).get(kunde.id) ?? EMPTY_AGG;

  return (
    <>
      <header className="page-header">
        <p style={{ marginBottom: '4px' }}><Link to="/kunden">← Alle Kunden</Link></p>
        <h1>{kunde.firmenname}</h1>
        <p>Kundendetails und Rechnungsübersicht</p>
      </header>

      <div className="kunde-detail__cards">
        <div className="panel-card">
          <h2 className="panel-card__title">Kontakt</h2>
          <div className="detail-panel__grid">
            <span className="detail-panel__label">Ansprechpartner</span>
            <span className="detail-panel__value">{kunde.ansprechpartner_name}</span>
            <span className="detail-panel__label">E-Mail</span>
            <span className="detail-panel__value">{kunde.e_mail}</span>
          </div>
        </div>
        <div className="panel-card">
          <h2 className="panel-card__title">Forderungen</h2>
          <div className="detail-panel__grid">
            <span className="detail-panel__label">Offene Summe</span>
            <span className={`detail-panel__value detail-panel__value--strong${agg.offenSumme > 0 ? ' detail-panel__value--danger' : ''}`}>
              {currencyFormatter.format(agg.offenSumme)}
            </span>
            <span className="detail-panel__label">Offen / Gemahnt / Bezahlt</span>
            <span className="detail-panel__value">{agg.countOffen} / {agg.countGemahnt} / {agg.countBezahlt}</span>
          </div>
        </div>
      </div>

      <div className="invoice-table-wrapper">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Rechnungs-Nr.</th>
              <th>Betrag</th>
              <th>Fällig am</th>
              <th>Verzug</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {kundenRechnungen.length === 0 ? (
              <tr>
                <td colSpan="5" className="invoice-table__empty">
                  Keine Rechnungen für diesen Kunden.
                </td>
              </tr>
            ) : (
              kundenRechnungen.map(inv => (
                <tr key={inv.id}>
                  <td>{inv.rechnungsnummer}</td>
                  <td>{currencyFormatter.format(inv.betrag)}</td>
                  <td>{new Date(inv.faelligkeitsdatum).toLocaleDateString('de-DE')}</td>
                  <td>
                    <span className={inv.overdueDays > 0 && inv.status !== 'bezahlt' ? 'cell-overdue' : 'cell-overdue--none'}>
                      {inv.status === 'bezahlt' ? '—' : `${inv.overdueDays} Tage`}
                    </span>
                  </td>
                  <td>
                    {inv.status === 'bezahlt'
                      ? <span className="badge badge--success">Bezahlt</span>
                      : <MahnstufeBadge stufe={inv.mahnstufe} />}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
