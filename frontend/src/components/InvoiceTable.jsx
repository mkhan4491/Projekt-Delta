import { useState, useEffect } from 'react';

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

function MahnstufeBadge({ stufe }) {
  if (stufe === 0) return <span className="badge badge--none">Keine</span>;
  if (stufe === 1) return <span className="badge badge--stufe1">Stufe 1</span>;
  if (stufe === 2) return <span className="badge badge--stufe2">Stufe 2</span>;
  return <span className="badge badge--stufe3">Stufe 3</span>;
}

export default function InvoiceTable({ invoices, activeTab, onSendEmail, onDelete, onMarkBezahlt, onShowHistorie }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    setConfirmDeleteId(null);
  }, [activeTab]);

  const isBezahltTab = activeTab === 'bezahlt';
  const canSend = (inv) => inv.mahnstufe !== 0 && activeTab === 'offen';

  return (
    <div className="invoice-table-wrapper">
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Rechnungs-Nr.</th>
            <th>Kunde</th>
            <th>Betrag</th>
            <th>Fällig am</th>
            <th>{isBezahltTab ? 'Bezahlt am' : 'Verzug'}</th>
            <th>{isBezahltTab ? 'Status' : 'Mahnstufe'}</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan="7" className="invoice-table__empty">
                Keine Rechnungen in dieser Ansicht.
              </td>
            </tr>
          ) : (
            invoices.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.rechnungsnummer}</td>
                <td>
                  <div className="cell-customer__name">{inv.kunden?.firmenname}</div>
                  <div className="cell-customer__contact">{inv.kunden?.ansprechpartner_name}</div>
                </td>
                <td>{currencyFormatter.format(inv.betrag)}</td>
                <td>{new Date(inv.faelligkeitsdatum).toLocaleDateString('de-DE')}</td>
                <td>
                  {isBezahltTab ? (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                      {inv.bezahlt_am ? new Date(inv.bezahlt_am).toLocaleDateString('de-DE') : '—'}
                    </span>
                  ) : (
                    <span className={inv.overdueDays > 0 ? 'cell-overdue' : 'cell-overdue--none'}>
                      {inv.overdueDays} Tage
                    </span>
                  )}
                </td>
                <td>
                  {isBezahltTab ? (
                    <span className="badge badge--success">Bezahlt</span>
                  ) : (
                    <MahnstufeBadge stufe={inv.mahnstufe} />
                  )}
                </td>
                <td>
                  {confirmDeleteId === inv.id ? (
                    <div className="cell-confirm">
                      <span>Wirklich löschen?</span>
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => {
                          onDelete(inv.id);
                          setConfirmDeleteId(null);
                        }}
                      >
                        Ja, löschen
                      </button>
                      <button
                        className="btn btn--secondary btn--sm"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Abbrechen
                      </button>
                    </div>
                  ) : (
                    <div className="cell-actions">
                      {!isBezahltTab && (
                        <>
                          <button
                            className="btn btn--primary btn--sm"
                            disabled={!canSend(inv)}
                            onClick={() => onSendEmail(inv)}
                          >
                            Mahnung senden
                          </button>
                          <button
                            className="btn btn--success btn--sm"
                            onClick={() => onMarkBezahlt(inv)}
                          >
                            ✓ Bezahlt
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => onShowHistorie(inv)}
                      >
                        Historie
                      </button>
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => setConfirmDeleteId(inv.id)}
                      >
                        Löschen
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
