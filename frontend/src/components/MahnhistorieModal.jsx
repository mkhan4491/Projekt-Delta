import { useEffect, useState } from 'react';
import { fetchMahnhistorie } from '../utils/api.js';

const STUFE_LABELS = { 1: 'Stufe 1', 2: 'Stufe 2', 3: 'Stufe 3' };
const STUFE_CLASSES = { 1: 'badge--stufe1', 2: 'badge--stufe2', 3: 'badge--stufe3' };

export default function MahnhistorieModal({ invoice, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMahnhistorie(invoice.id).then(data => {
      setHistory(data);
      setLoading(false);
    });
  }, [invoice.id]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal__title">
          Mahnhistorie
          <br />
          <span style={{ fontWeight: 400, fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {invoice.rechnungsnummer} · {invoice.kunden?.firmenname}
          </span>
        </h2>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <div className="spinner" />
          </div>
        ) : history.length === 0 ? (
          <p className="historie-empty">Noch keine Mahnungen für diese Rechnung versendet.</p>
        ) : (
          <div className="historie-list">
            {history.map(entry => {
              const date = new Date(entry.gesendet_am);
              const dateStr = date.toLocaleDateString('de-DE') + ', ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={entry.id} className="historie-entry">
                  <span className="historie-entry__date">{dateStr}</span>
                  <span className={`badge ${STUFE_CLASSES[entry.mahnstufe] ?? 'badge--none'}`}>
                    {STUFE_LABELS[entry.mahnstufe] ?? `Stufe ${entry.mahnstufe}`}
                  </span>
                  <span className="historie-entry__email">{entry.email_empfaenger}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="modal__actions">
          <button className="btn btn--secondary" onClick={onClose}>Schließen</button>
        </div>
      </div>
    </div>
  );
}
