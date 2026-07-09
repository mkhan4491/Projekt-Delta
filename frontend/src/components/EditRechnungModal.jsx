import { useState } from 'react';

export default function EditRechnungModal({ invoice, onSave, onClose, addToast }) {
  const [rechnungsNr, setRechnungsNr] = useState(invoice.rechnungsnummer);
  const [betrag, setBetrag] = useState(invoice.betrag);
  const [faelligAm, setFaelligAm] = useState(invoice.faelligkeitsdatum);

  const handleSave = () => {
    if (!rechnungsNr || !betrag || !faelligAm) {
      addToast('warning', 'Bitte fülle alle Felder aus.');
      return;
    }

    onSave({
      rechnungsnummer: rechnungsNr,
      betrag: parseFloat(betrag),
      faelligkeitsdatum: faelligAm,
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal__title">
          Rechnung bearbeiten
          <br />
          <span style={{ fontWeight: 400, fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {invoice.kunden?.firmenname}
          </span>
        </h2>

        <div className="form-field">
          <label className="form-label">Rechnungs-Nr.</label>
          <input
            className="form-input"
            type="text"
            value={rechnungsNr}
            onChange={(e) => setRechnungsNr(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Betrag (€)</label>
          <input
            className="form-input"
            type="number"
            step="0.01"
            value={betrag}
            onChange={(e) => setBetrag(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Fällig am</label>
          <input
            className="form-input"
            type="date"
            value={faelligAm}
            onChange={(e) => setFaelligAm(e.target.value)}
          />
        </div>

        <div className="modal__actions">
          <button className="btn btn--primary" onClick={handleSave}>Änderungen speichern</button>
          <button className="btn btn--secondary" onClick={onClose}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
}
