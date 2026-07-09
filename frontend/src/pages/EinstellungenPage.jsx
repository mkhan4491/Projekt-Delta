import { useState } from 'react';
import { useData } from '../context/useData.js';
import { updateEinstellungen } from '../utils/api';
import { DEFAULT_TEMPLATES, PLACEHOLDERS } from '../utils/textEngine';

const EMPTY = {
  firmenname: '', strasse: '', plz_ort: '', telefon: '', absender_email: '',
  steuernummer: '', bank_name: '', iban: '', bic: '',
  mahntext_stufe1: '', mahntext_stufe2: '', mahntext_stufe3: '',
};

export default function EinstellungenPage() {
  const { einstellungen, loadEinstellungen, addToast } = useData();
  const [form, setForm] = useState({ ...EMPTY, ...(einstellungen ?? {}) });
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.firmenname.trim()) {
      addToast('warning', 'Bitte mindestens den Firmennamen eintragen.');
      return;
    }
    setSaving(true);
    // id/updated_at nicht mitschicken — nur die Formularfelder
    const { firmenname, strasse, plz_ort, telefon, absender_email,
            steuernummer, bank_name, iban, bic,
            mahntext_stufe1, mahntext_stufe2, mahntext_stufe3 } = form;
    const ok = await updateEinstellungen({
      firmenname, strasse, plz_ort, telefon, absender_email,
      steuernummer, bank_name, iban, bic,
      mahntext_stufe1, mahntext_stufe2, mahntext_stufe3,
    });
    setSaving(false);
    if (ok) {
      loadEinstellungen();
      addToast('success', 'Einstellungen gespeichert.');
    } else {
      addToast('error', 'Einstellungen konnten nicht gespeichert werden.');
    }
  };

  return (
    <>
      <header className="page-header">
        <h1>Einstellungen</h1>
        <p>Firmen-Stammdaten und Mahntexte — werden in Mahnungen verwendet</p>
      </header>

      <div className="settings-grid">
        <div className="panel-card">
          <h2 className="panel-card__title">Firmendaten</h2>
          <div className="settings-form">
            <div className="form-field">
              <label className="form-label">Firmenname *</label>
              <input className="form-input" type="text" value={form.firmenname} onChange={set('firmenname')} />
            </div>
            <div className="form-field">
              <label className="form-label">Straße & Hausnummer</label>
              <input className="form-input" type="text" value={form.strasse} onChange={set('strasse')} />
            </div>
            <div className="form-field">
              <label className="form-label">PLZ & Ort</label>
              <input className="form-input" type="text" value={form.plz_ort} onChange={set('plz_ort')} />
            </div>
            <div className="form-field">
              <label className="form-label">Telefon</label>
              <input className="form-input" type="tel" value={form.telefon} onChange={set('telefon')} />
            </div>
            <div className="form-field">
              <label className="form-label">Absender-E-Mail</label>
              <input className="form-input" type="email" value={form.absender_email} onChange={set('absender_email')} />
            </div>
            <div className="form-field">
              <label className="form-label">Steuernummer / USt-ID</label>
              <input className="form-input" type="text" value={form.steuernummer} onChange={set('steuernummer')} />
            </div>
          </div>
        </div>

        <div className="panel-card">
          <h2 className="panel-card__title">Bankverbindung</h2>
          <div className="settings-form">
            <div className="form-field">
              <label className="form-label">Bank</label>
              <input className="form-input" type="text" value={form.bank_name} onChange={set('bank_name')} />
            </div>
            <div className="form-field">
              <label className="form-label">IBAN</label>
              <input className="form-input" type="text" value={form.iban} onChange={set('iban')} />
            </div>
            <div className="form-field">
              <label className="form-label">BIC</label>
              <input className="form-input" type="text" value={form.bic} onChange={set('bic')} />
            </div>
          </div>
        </div>
      </div>

      <div className="panel-card settings-templates">
        <h2 className="panel-card__title">Mahntexte</h2>
        <p className="settings-hint">
          Leer lassen = Standardtext wird verwendet. Verfügbare Platzhalter:{' '}
          {PLACEHOLDERS.map(p => <code key={p.key} title={p.description}>{p.key}</code>)}
        </p>

        {[1, 2, 3].map(stufe => (
          <div className="form-field" key={stufe}>
            <label className="form-label">
              Mahnstufe {stufe} {stufe === 1 ? '(freundliche Erinnerung)' : stufe === 2 ? '(formelle Mahnung)' : '(letzte Mahnung)'}
            </label>
            <textarea
              className="form-textarea"
              rows={8}
              placeholder={DEFAULT_TEMPLATES[stufe]}
              value={form[`mahntext_stufe${stufe}`] ?? ''}
              onChange={set(`mahntext_stufe${stufe}`)}
            />
          </div>
        ))}
      </div>

      <div className="settings-actions">
        <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Speichern…' : 'Einstellungen speichern'}
        </button>
      </div>
    </>
  );
}
