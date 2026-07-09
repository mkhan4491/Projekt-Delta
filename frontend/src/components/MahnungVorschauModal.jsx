import { useState } from 'react';
import { buildMahnung } from '../utils/mahnung';
import MahnstufeBadge from './MahnstufeBadge.jsx';

export default function MahnungVorschauModal({ invoice, einstellungen, onSend, onClose, addToast }) {
  const initial = buildMahnung(invoice, einstellungen);
  const [subject, setSubject] = useState(initial.subject);
  const [message, setMessage] = useState(initial.message);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      addToast('warning', 'Betreff und Text dürfen nicht leer sein.');
      return;
    }
    setSending(true);
    await onSend(invoice, { subject: subject.trim(), message });
    setSending(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide">
        <h2 className="modal__title">
          Mahnung prüfen & senden
          <br />
          <span style={{ fontWeight: 400, fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {invoice.rechnungsnummer} · {invoice.kunden?.firmenname} · <MahnstufeBadge stufe={invoice.mahnstufe} />
          </span>
        </h2>

        <div className="form-field">
          <label className="form-label">An</label>
          <input className="form-input" type="text" value={invoice.kunden?.e_mail ?? ''} disabled />
        </div>

        <div className="form-field">
          <label className="form-label">Betreff</label>
          <input
            className="form-input"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Nachricht (anpassbar)</label>
          <textarea
            className="form-textarea"
            rows={14}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="modal__actions">
          <button className="btn btn--primary" onClick={handleSend} disabled={sending}>
            {sending ? 'Sende…' : 'Jetzt senden'}
          </button>
          <button className="btn btn--secondary" onClick={onClose} disabled={sending}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
