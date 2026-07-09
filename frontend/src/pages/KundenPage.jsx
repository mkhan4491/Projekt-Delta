import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/useData.js';
import { createKunde } from '../utils/api';
import { aggregateByKunde } from '../utils/invoiceLogic';
import AddKundenModal from '../components/AddKundenModal.jsx';

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

const EMPTY_AGG = { offenSumme: 0, countOffen: 0, countGemahnt: 0, countBezahlt: 0 };

export default function KundenPage() {
  const { invoices, kundenListe, loadKunden, addToast } = useData();
  const navigate = useNavigate();
  const [showKundenModal, setShowKundenModal] = useState(false);

  const aggregates = aggregateByKunde(invoices);

  const handleSaveKunde = async (data) => {
    const result = await createKunde(data);
    if (result) {
      setShowKundenModal(false);
      loadKunden();
      addToast('success', 'Kunde erfolgreich angelegt.');
    } else {
      addToast('error', 'Kunde konnte nicht gespeichert werden.');
    }
  };

  return (
    <>
      <header className="page-header">
        <h1>Kunden</h1>
        <p>Alle Kunden und ihre offenen Forderungen</p>
      </header>

      <div className="action-bar">
        <div className="action-bar__left">
          <button className="btn btn--primary" onClick={() => setShowKundenModal(true)}>
            + Neuer Kunde
          </button>
        </div>
      </div>

      <div className="invoice-table-wrapper">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Firma</th>
              <th>Ansprechpartner</th>
              <th>E-Mail</th>
              <th>Offene Summe</th>
              <th>Offen</th>
              <th>Gemahnt</th>
            </tr>
          </thead>
          <tbody>
            {kundenListe.length === 0 ? (
              <tr>
                <td colSpan="6" className="invoice-table__empty">
                  Noch keine Kunden angelegt.
                </td>
              </tr>
            ) : (
              kundenListe.map(kunde => {
                const agg = aggregates.get(kunde.id) ?? EMPTY_AGG;
                return (
                  <tr
                    key={kunde.id}
                    className="row-clickable"
                    onClick={() => navigate(`/kunden/${kunde.id}`)}
                  >
                    <td><span className="cell-customer__name">{kunde.firmenname}</span></td>
                    <td>{kunde.ansprechpartner_name}</td>
                    <td>{kunde.e_mail}</td>
                    <td>
                      <span className={agg.offenSumme > 0 ? 'cell-overdue' : 'cell-overdue--none'}>
                        {currencyFormatter.format(agg.offenSumme)}
                      </span>
                    </td>
                    <td>{agg.countOffen}</td>
                    <td>{agg.countGemahnt}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showKundenModal && (
        <AddKundenModal
          onSave={handleSaveKunde}
          onClose={() => setShowKundenModal(false)}
          addToast={addToast}
        />
      )}
    </>
  );
}
