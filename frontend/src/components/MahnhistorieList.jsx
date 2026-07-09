import { useEffect, useState } from 'react';
import { fetchMahnhistorie } from '../utils/api';

const STUFE_LABELS = { 1: 'Stufe 1', 2: 'Stufe 2', 3: 'Stufe 3' };
const STUFE_CLASSES = { 1: 'badge--stufe1', 2: 'badge--stufe2', 3: 'badge--stufe3' };

// Hinweis: bei Wechsel der Rechnung oder nach neuem Versand per key-Prop remounten
export default function MahnhistorieList({ rechnungId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMahnhistorie(rechnungId).then(data => {
      if (cancelled) return;
      setHistory(data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [rechnungId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (history.length === 0) {
    return <p className="historie-empty">Noch keine Mahnungen für diese Rechnung versendet.</p>;
  }

  return (
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
  );
}
