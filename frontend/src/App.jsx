import { useEffect, useState } from 'react';
import { calculateOverdueDays, getMahnstufe } from './utils/invoiceLogic';
import './App.css'; 
import { generateEmailText } from './utils/textEngine';
import { fetchOpenInvoices, fetchKunden, createRechnung } from './utils/api';

function App() {
  // Hier speichern wir unsere Rechnungen, sobald sie aus der DB kommen
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Gedächtnis für das Formular
  const [kundenListe, setKundenListe] = useState([]);
  const [selectedKunde, setSelectedKunde] = useState('');
  const [rechnungsNr, setRechnungsNr] = useState('');
  const [betrag, setBetrag] = useState('');
  const [faelligAm, setFaelligAm] = useState('');

  // Wird ausgeführt, wenn man auf "Mahnung senden" klickt
  const handleSendEmail = async (invoice) => {
    const emailText = generateEmailText(invoice);
    const subject = `Wichtige Information zu Ihrer Rechnung ${invoice.rechnungsnummer}`;
    
    alert(`Versende Mahnung an ${invoice.kunden?.firmenname}...`);

    try {
      const response = await fetch('http://localhost:5678/webhook-test/mahnung', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toEmail: invoice.kunden?.e_mail,
          customerName: invoice.kunden?.firmenname,
          subject: subject,
          message: emailText,
          invoiceId: invoice.id,
          mahnstufe: invoice.mahnstufe
        }),
      });

      if (response.ok) {
        alert('Erfolg: Die Daten wurden an n8n übergeben!');
      } else {
        alert('Fehler: n8n Webhook hat nicht geantwortet. Läuft dein n8n Server?');
      }
    } catch (error) {
      console.error("Webhook Fehler:", error);
      alert('Fehler: Konnte keine Verbindung zu n8n herstellen. Bitte starte n8n!');
    }
  };

  // Lädt die offenen Rechnungen beim Start
  useEffect(() => {
    async function loadData() {
      const data = await fetchOpenInvoices();
      
      const processedData = data.map(invoice => {
        const overdueDays = calculateOverdueDays(invoice.faelligkeitsdatum);
        const berechneteMahnstufe = getMahnstufe(overdueDays);
        return { ...invoice, overdueDays, mahnstufe: berechneteMahnstufe };
      });

      processedData.sort((a, b) => b.overdueDays - a.overdueDays);
      setInvoices(processedData);
      setLoading(false);
    }

    loadData();
  }, []);

  // Lädt die Kundenliste für das Dropdown-Menü
  useEffect(() => {
    async function loadKunden() {
      const data = await fetchKunden();
      setKundenListe(data);
    }
    loadKunden();
  }, []);

 // Speicher-Logik für das neue Rechnungsformular
  const handleSaveRechnung = async () => {
    if (!selectedKunde || !rechnungsNr || !betrag || !faelligAm) {
      alert("Bitte fülle alle Felder aus!");
      return;
    }

    // 1. Zuerst definieren wir 'heute' (Das war der fehlende Teil!)
    const heute = new Date().toISOString().split('T')[0];

    // 2. Dann packen wir das Paket zusammen
    const neueRechnung = {
      kunden_id: selectedKunde,
      rechnungsnummer: rechnungsNr, 
      betrag: parseFloat(betrag),
      faelligkeitsdatum: faelligAm,
      ausstellungsdatum: heute,      // Hier weiß React jetzt, was 'heute' ist
      status: 'offen'
    };

    // 3. An die Datenbank senden
    const result = await createRechnung(neueRechnung);

    if (result) {
      setShowAddModal(false);
      setRechnungsNr('');
      setBetrag('');
      setFaelligAm('');
      setSelectedKunde('');
      
      // Tabelle direkt aktualisieren
      const data = await fetchOpenInvoices();
      const processedData = data.map(invoice => {
        const overdueDays = calculateOverdueDays(invoice.faelligkeitsdatum);
        const berechneteMahnstufe = getMahnstufe(overdueDays);
        return { ...invoice, overdueDays, mahnstufe: berechneteMahnstufe };
      });
      processedData.sort((a, b) => b.overdueDays - a.overdueDays);
      setInvoices(processedData);
    }
  };

  if (loading) return <h2>Lade Cortex Executive Operations...</h2>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Cortex Executive Operations</h1>
      <p>Automatisches Forderungsmanagement</p>
      
      <button 
        onClick={() => setShowAddModal(true)}
        style={{
          padding: '10px 15px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginBottom: '15px'
        }}
      >
        + Neue Rechnung erfassen
      </button>

      {/* HIER WURDE DAS INTERAKTIVE MODAL EINGESETZT */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#222', padding: '30px', borderRadius: '10px',
            width: '400px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '15px',
            border: '1px solid #444'
          }}>
            <h2 style={{ margin: '0 0 10px 0' }}>Neue Rechnung erfassen</h2>
            
            {/* Dynamisches Kunden-Dropdown */}
            <select 
              value={selectedKunde} 
              onChange={(e) => setSelectedKunde(e.target.value)}
              style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#fff', color: '#000' }}
            >
              <option value="">-- Kunden auswählen --</option>
              {kundenListe.map(kunde => (
                <option key={kunde.id} value={kunde.id}>
                  {kunde.firmenname}
                </option>
              ))}
            </select>
            
            <input 
              type="text" 
              placeholder="Rechnungs-Nr. (z.B. RE-2026-004)" 
              value={rechnungsNr}
              onChange={(e) => setRechnungsNr(e.target.value)}
              style={{ padding: '10px', borderRadius: '5px', border: 'none', color: '#000', backgroundColor: '#fff' }} 
            />
            
            <input 
              type="number" 
              placeholder="Betrag in €" 
              value={betrag}
              onChange={(e) => setBetrag(e.target.value)}
              style={{ padding: '10px', borderRadius: '5px', border: 'none', color: '#000', backgroundColor: '#fff' }} 
            />
            
            <label style={{ fontSize: '14px', color: '#aaa', marginBottom: '-10px' }}>Fällig am:</label>
            <input 
              type="date" 
              value={faelligAm}
              onChange={(e) => setFaelligAm(e.target.value)}
              style={{ padding: '10px', borderRadius: '5px', border: 'none', color: '#000', backgroundColor: '#fff' }} 
            />
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button 
                onClick={handleSaveRechnung}
                style={{ flex: 1, padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Speichern
              </button>
              <button 
                onClick={() => setShowAddModal(false)} 
                style={{ flex: 1, padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
      
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