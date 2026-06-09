import { useState } from 'react';

export default function AddKundenModal({ onSave, onClose, addToast }) {
  const [firmenname, setFirmenname] = useState('');
  const [ansprechpartner, setAnsprechpartner] = useState('');
  const [email, setEmail] = useState('');

  const handleSave = () => {
    if (!firmenname || !ansprechpartner || !email) {
      addToast('warning', 'Bitte fülle alle Felder aus.');
      return;
    }

    onSave({
      firmenname,
      ansprechpartner_name: ansprechpartner,
      e_mail: email,
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal__title">Neuen Kunden anlegen</h2>

        <div className="form-field">
          <label className="form-label">Firmenname</label>
          <input
            className="form-input"
            type="text"
            placeholder="Musterfirma GmbH"
            value={firmenname}
            onChange={(e) => setFirmenname(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Ansprechpartner</label>
          <input
            className="form-input"
            type="text"
            placeholder="Max Mustermann"
            value={ansprechpartner}
            onChange={(e) => setAnsprechpartner(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">E-Mail-Adresse</label>
          <input
            className="form-input"
            type="email"
            placeholder="max@musterfirma.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="modal__actions">
          <button className="btn btn--primary" onClick={handleSave}>Kunde speichern</button>
          <button className="btn btn--secondary" onClick={onClose}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
}
