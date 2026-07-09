import { useEffect, useState } from 'react';
import MahnstufeBadge from './MahnstufeBadge.jsx';
import MahnhistorieList from './MahnhistorieList.jsx';

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

function formatDate(dateString) {
  return dateString ? new Date(dateString).toLocaleDateString('de-DE') : '—';
}

export default function InvoiceDetailPanel({ invoice, onClose, onSendEmail, onMarkBezahlt, onEdit, onDelete, historieRefreshKey }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const isBezahlt = invoice.status === 'bezahlt';
  const canSend = invoice.mahnstufe !== 0 && invoice.status === 'offen';

  return (
    <div className="detail-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="detail-panel">
        <div className="detail-panel__header">
          <div>
            <div className="detail-panel__title">{invoice.rechnungsnummer}</div>
            <div className="detail-panel__subtitle">
              {isBezahlt
                ? <span className="badge badge--success">Bezahlt</span>
                : <MahnstufeBadge stufe={invoice.mahnstufe} />}
            </div>
          </div>
          <button className="detail-panel__close" onClick={onClose}>×</button>
        </div>

        <div className="detail-panel__section">
          <h3 className="detail-panel__section-title">Kunde</h3>
          <div className="detail-panel__grid">
            <span className="detail-panel__label">Firma</span>
            <span className="detail-panel__value">{invoice.kunden?.firmenname}</span>
            <span className="detail-panel__label">Ansprechpartner</span>
            <span className="detail-panel__value">{invoice.kunden?.ansprechpartner_name}</span>
            <span className="detail-panel__label">E-Mail</span>
            <span className="detail-panel__value">{invoice.kunden?.e_mail}</span>
          </div>
        </div>

        <div className="detail-panel__section">
          <h3 className="detail-panel__section-title">Rechnung</h3>
          <div className="detail-panel__grid">
            <span className="detail-panel__label">Betrag</span>
            <span className="detail-panel__value detail-panel__value--strong">{currencyFormatter.format(invoice.betrag)}</span>
            <span className="detail-panel__label">Ausgestellt am</span>
            <span className="detail-panel__value">{formatDate(invoice.ausstellungsdatum)}</span>
            <span className="detail-panel__label">Fällig am</span>
            <span className="detail-panel__value">{formatDate(invoice.faelligkeitsdatum)}</span>
            <span className="detail-panel__label">Verzug</span>
            <span className={`detail-panel__value${invoice.overdueDays > 0 ? ' detail-panel__value--danger' : ''}`}>
              {invoice.overdueDays} Tage
            </span>
            {isBezahlt && (
              <>
                <span className="detail-panel__label">Bezahlt am</span>
                <span className="detail-panel__value">{formatDate(invoice.bezahlt_am)}</span>
                <span className="detail-panel__label">Gezahlter Betrag</span>
                <span className="detail-panel__value">
                  {invoice.bezahlter_betrag != null ? currencyFormatter.format(invoice.bezahlter_betrag) : '—'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="detail-panel__section">
          <h3 className="detail-panel__section-title">Mahnhistorie</h3>
          <MahnhistorieList key={`${invoice.id}-${historieRefreshKey}`} rechnungId={invoice.id} />
        </div>

        <div className="detail-panel__actions">
          {confirmDelete ? (
            <div className="cell-confirm">
              <span>Wirklich löschen?</span>
              <button className="btn btn--danger btn--sm" onClick={() => onDelete(invoice.id)}>
                Ja, löschen
              </button>
              <button className="btn btn--secondary btn--sm" onClick={() => setConfirmDelete(false)}>
                Abbrechen
              </button>
            </div>
          ) : (
            <>
              <button
                className="btn btn--primary btn--sm"
                disabled={!canSend}
                onClick={() => onSendEmail(invoice)}
              >
                Mahnung senden
              </button>
              {!isBezahlt && (
                <button className="btn btn--success btn--sm" onClick={() => onMarkBezahlt(invoice)}>
                  ✓ Bezahlt
                </button>
              )}
              <button className="btn btn--secondary btn--sm" onClick={() => onEdit(invoice)}>
                Bearbeiten
              </button>
              <button className="btn btn--ghost btn--sm" onClick={() => setConfirmDelete(true)}>
                Löschen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
