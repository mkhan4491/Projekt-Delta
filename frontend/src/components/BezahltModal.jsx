import { useState } from 'react';

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

export default function BezahltModal({ invoice, onSave, onClose, addToast }) {
  const today = new Date().toISOString().split('T')[0];
  const [bezahltAm, setBezahltAm] = useState(today);
  const [bezahlterBetrag, setBezahlterBetrag] = useState(invoice.betrag);

  const handleSave = () => {
    if (!bezahltAm || !bezahlterBetrag) {
      addToast('warning', 'Bitte fülle alle Felder aus.');
      return;
    }
    onSave({ bezahlt_am: bezahltAm, bezahlter_betrag: parseFloat(bezahlterBetrag) });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal__title">
          Zahlungseingang erfassen
          <br />
          <span style={{ fontWeight: 400, fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {invoice.rechnungsnummer} · {invoice.kunden?.firmenname}
          </span>
        </h2>

        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '-8px' }}>
          Rechnungsbetrag: <strong style={{ color: 'var(--color-text)' }}>{currencyFormatter.format(invoice.betrag)}</strong>
        </div>

        <div className="form-field">
          <label className="form-label">Bezahlt am</label>
          <input
            className="form-input"
            type="date"
            value={bezahltAm}
            onChange={(e) => setBezahltAm(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Gezahlter Betrag (€)</label>
          <input
            className="form-input"
            type="number"
            step="0.01"
            value={bezahlterBetrag}
            onChange={(e) => setBezahlterBetrag(e.target.value)}
          />
        </div>

        <div className="modal__actions">
          <button className="btn btn--success" onClick={handleSave}>Zahlungseingang speichern</button>
          <button className="btn btn--secondary" onClick={onClose}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
}
