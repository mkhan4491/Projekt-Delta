import { useState } from 'react';

export default function AddRechnungModal({ kundenListe, onSave, onClose, addToast }) {
  const [selectedKunde, setSelectedKunde] = useState('');
  const [rechnungsNr, setRechnungsNr] = useState('');
  const [betrag, setBetrag] = useState('');
  const [faelligAm, setFaelligAm] = useState('');

  const handleSave = () => {
    if (!selectedKunde || !rechnungsNr || !betrag || !faelligAm) {
      addToast('warning', 'Bitte fülle alle Felder aus.');
      return;
    }

    const data = {
      kunden_id: selectedKunde,
      rechnungsnummer: rechnungsNr,
      betrag: parseFloat(betrag),
      faelligkeitsdatum: faelligAm,
      ausstellungsdatum: new Date().toISOString().split('T')[0],
      status: 'offen',
    };

    onSave(data);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal__title">Neue Rechnung erfassen</h2>

        <div className="form-field">
          <label className="form-label">Kunde</label>
          <select
            className="form-select"
            value={selectedKunde}
            onChange={(e) => setSelectedKunde(e.target.value)}
          >
            <option value="">— Kunden auswählen —</option>
            {kundenListe.map(k => (
              <option key={k.id} value={k.id}>{k.firmenname}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Rechnungs-Nr.</label>
          <input
            className="form-input"
            type="text"
            placeholder="z.B. RE-2026-004"
            value={rechnungsNr}
            onChange={(e) => setRechnungsNr(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Betrag (€)</label>
          <input
            className="form-input"
            type="number"
            placeholder="0.00"
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
          <button className="btn btn--primary" onClick={handleSave}>Speichern</button>
          <button className="btn btn--secondary" onClick={onClose}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
}
