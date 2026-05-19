import { useEffect, useState } from 'react';
import { fetchOpenInvoices } from './utils/api';
import { calculateOverdueDays, getMahnstufe } from './utils/invoiceLogic';
import './App.css'; 
import { generateEmailText } from './utils/textEngine';

function App() {
  // Hier speichern wir unsere Rechnungen, sobald sie aus der DB kommen
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  // Wird ausgeführt, wenn man auf "Mahnung senden" klickt
  const handleSendEmail = (invoice) => {
    const emailText = generateEmailText(invoice);
    // Zeigt den fertigen Text als Pop-up im Browser an
    alert(`Vorschau der E-Mail für ${invoice.kunden?.firmenname}:\n\n${emailText}`);

    // Hier fügen wir im nächsten Issue den echten E-Mail-Versand ein!
  };

  // Diese Funktion läuft automatisch einmal los, wenn die Seite geladen wird
  useEffect(() => {
    async function loadData() {
      const data = await fetchOpenInvoices();
      
      // Wir reichern die Datenbank-Daten direkt mit unserer Logik an
      const processedData = data.map(invoice => {
        const overdueDays = calculateOverdueDays(invoice.faelligkeitsdatum);
        const berechneteMahnstufe = getMahnstufe(overdueDays);
        return { ...invoice, overdueDays, mahnstufe: berechneteMahnstufe };
      });

      // Nach Datum sortieren (die ältesten Rechnungen zuerst)
      processedData.sort((a, b) => b.overdueDays - a.overdueDays);

      setInvoices(processedData);
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) return <h2>Lade Cortex Executive Operations...</h2>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Cortex Executive Operations</h1>
      <p>Automatisches Forderungsmanagement</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#333', color: '#fff' }}>
            <th style={{ padding: '10px' }}>Rechnungs-Nr.</th>
            <th style={{ padding: '10px' }}>Kunde</th>
            <th style={{ padding: '10px' }}>Betrag</th>
            <th style={{ padding: '10px' }}>Fällig am</th>
            <th style={{ padding: '10px' }}>Verzug</th>
            <th style={{ padding: '10px' }}>Mahnstufe</th>
            <th style={{ padding: '10px' }}>Aktion</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{inv.rechnungsnummer}</td>
              <td style={{ padding: '10px' }}>
                <strong>{inv.kunden?.firmenname}</strong><br/>
                <small>{inv.kunden?.ansprechpartner_name}</small>
              </td>
              <td style={{ padding: '10px' }}>{inv.betrag} €</td>
              <td style={{ padding: '10px' }}>{new Date(inv.faelligkeitsdatum).toLocaleDateString('de-DE')}</td>
              <td style={{ padding: '10px', color: inv.overdueDays > 0 ? '#d9534f' : 'inherit', fontWeight: 'bold' }}>
                {inv.overdueDays} Tage
              </td>
              <td style={{ padding: '10px' }}>
                {inv.mahnstufe === 0 ? 'Keine' : `Stufe ${inv.mahnstufe}`}
              </td>
              <td style={{ padding: '10px' }}>
                {/* Dieser Button ist noch ohne Funktion, er wird in Issue 18 verkabelt */}
              <button 
                disabled={inv.mahnstufe === 0}
                onClick={() => handleSendEmail(inv)}
                style={{ 
                  padding: '8px 12px', 
                  cursor: inv.mahnstufe === 0 ? 'not-allowed' : 'pointer',
                  backgroundColor: inv.mahnstufe === 0 ? '#ccc' : '#007BFF',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                Mahnung senden
              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

export default App;