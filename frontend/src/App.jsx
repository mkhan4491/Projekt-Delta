import { useEffect, useState, useMemo } from 'react';
import { calculateOverdueDays, getMahnstufe } from './utils/invoiceLogic';
import { generateEmailText } from './utils/textEngine';
import {
  fetchRechnungen, fetchKunden,
  createRechnung, createKunde, deleteRechnung,
  markAsBezahlt, createMahneintrag,
} from './utils/api';
import Toast from './components/Toast.jsx';
import KpiCards from './components/KpiCards.jsx';
import InvoiceTable from './components/InvoiceTable.jsx';
import AddRechnungModal from './components/AddRechnungModal.jsx';
import AddKundenModal from './components/AddKundenModal.jsx';
import BezahltModal from './components/BezahltModal.jsx';
import MahnhistorieModal from './components/MahnhistorieModal.jsx';
import './App.css';

function useToast() {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToast = (type, message, duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  };

  return { toasts, addToast, removeToast };
}

function App() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('offen');
  const [kundenListe, setKundenListe] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showKundenModal, setShowKundenModal] = useState(false);
  const [showBezahltModal, setShowBezahltModal] = useState(false);
  const [bezahltInvoice, setBezahltInvoice] = useState(null);
  const [showHistorieModal, setShowHistorieModal] = useState(false);
  const [historieInvoice, setHistorieInvoice] = useState(null);

  const { toasts, addToast, removeToast } = useToast();

  async function loadData() {
    const data = await fetchRechnungen();
    const processed = data.map(inv => {
      const overdueDays = calculateOverdueDays(inv.faelligkeitsdatum);
      return { ...inv, overdueDays, mahnstufe: getMahnstufe(overdueDays) };
    });
    processed.sort((a, b) => b.overdueDays - a.overdueDays);
    setInvoices(processed);
    setLoading(false);
  }

  async function loadKunden() {
    const data = await fetchKunden();
    setKundenListe(data);
  }

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadKunden(); }, []);

  const kpiStats = useMemo(() => ({
    totalOpen:    invoices.filter(inv => inv.status === 'offen').reduce((s, i) => s + i.betrag, 0),
    countOpen:    invoices.filter(inv => inv.status === 'offen').length,
    countGemahnt: invoices.filter(inv => inv.status === 'gemahnt').length,
    countUrgent:  invoices.filter(inv => inv.mahnstufe === 3).length,
    totalBezahlt: invoices.filter(inv => inv.status === 'bezahlt').reduce((s, i) => s + (i.bezahlter_betrag ?? i.betrag), 0),
    countBezahlt: invoices.filter(inv => inv.status === 'bezahlt').length,
  }), [invoices]);

  const displayedInvoices = invoices.filter(inv => inv.status === activeTab);

  const handleSendEmail = async (invoice) => {
    const emailText = generateEmailText(invoice);
    const subject = `Wichtige Information zu Ihrer Rechnung ${invoice.rechnungsnummer}`;

    addToast('info', `Versende Mahnung an ${invoice.kunden?.firmenname}...`);

    try {
      const response = await fetch('http://localhost:5678/webhook/mahnung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail:      invoice.kunden?.e_mail,
          customerName: invoice.kunden?.firmenname,
          subject,
          message:      emailText,
          invoiceId:    invoice.id,
          mahnstufe:    invoice.mahnstufe,
        }),
      });

      if (response.ok) {
        await createMahneintrag({
          rechnung_id:      invoice.id,
          mahnstufe:        invoice.mahnstufe,
          email_empfaenger: invoice.kunden?.e_mail,
          betreff:          subject,
        });
        addToast('success', 'Mahnung erfolgreich gesendet.');
        loadData();
      } else {
        addToast('error', 'Fehler: n8n Webhook hat nicht geantwortet.');
      }
    } catch {
      addToast('error', 'Keine Verbindung zu n8n herstellen.');
    }
  };

  const handleSaveRechnung = async (data) => {
    const result = await createRechnung(data);
    if (result) {
      setShowAddModal(false);
      loadData();
      addToast('success', 'Rechnung erfolgreich erfasst.');
    } else {
      addToast('error', 'Rechnung konnte nicht gespeichert werden.');
    }
  };

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

  const handleDeleteRechnung = async (id) => {
    const ok = await deleteRechnung(id);
    if (ok) {
      loadData();
      addToast('success', 'Rechnung gelöscht.');
    } else {
      addToast('error', 'Löschen fehlgeschlagen.');
    }
  };

  const handleMarkBezahlt = (invoice) => {
    setBezahltInvoice(invoice);
    setShowBezahltModal(true);
  };

  const handleSaveBezahlt = async (data) => {
    const ok = await markAsBezahlt(bezahltInvoice.id, data);
    if (ok) {
      setShowBezahltModal(false);
      setBezahltInvoice(null);
      loadData();
      addToast('success', 'Zahlungseingang erfasst.');
    } else {
      addToast('error', 'Konnte Zahlung nicht speichern.');
    }
  };

  const handleShowHistorie = (invoice) => {
    setHistorieInvoice(invoice);
    setShowHistorieModal(true);
  };

  const handleExportCsv = () => {
    const header = ['Rechnungs-Nr.', 'Kunde', 'E-Mail', 'Betrag (EUR)', 'Fällig am', 'Verzug (Tage)', 'Mahnstufe'];
    const rows = displayedInvoices.map(inv => [
      inv.rechnungsnummer,
      inv.kunden?.firmenname ?? '',
      inv.kunden?.e_mail ?? '',
      inv.betrag,
      new Date(inv.faelligkeitsdatum).toLocaleDateString('de-DE'),
      inv.overdueDays,
      inv.mahnstufe === 0 ? 'Keine' : `Stufe ${inv.mahnstufe}`,
    ]);

    const csv = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rechnungen-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    addToast('success', 'CSV-Export abgeschlossen.');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        Lade Cortex Executive Operations...
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Cortex Executive Operations</h1>
        <p>Automatisches Forderungsmanagement</p>
      </header>

      <KpiCards stats={kpiStats} />

      <div className="action-bar">
        <div className="action-bar__left">
          <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
            + Neue Rechnung
          </button>
          <button className="btn btn--secondary" onClick={() => setShowKundenModal(true)}>
            + Neuer Kunde
          </button>
        </div>
        <div className="action-bar__right">
          <button className="btn btn--secondary" onClick={handleExportCsv}>
            CSV Export
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tabs__tab${activeTab === 'offen' ? ' tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('offen')}
        >
          Aktionsbedarf (Offen)
        </button>
        <button
          className={`tabs__tab${activeTab === 'gemahnt' ? ' tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('gemahnt')}
        >
          Warteschleife (Gemahnt)
        </button>
        <button
          className={`tabs__tab${activeTab === 'bezahlt' ? ' tabs__tab--active-green' : ''}`}
          onClick={() => setActiveTab('bezahlt')}
        >
          Bezahlt
        </button>
      </div>

      <InvoiceTable
        invoices={displayedInvoices}
        activeTab={activeTab}
        onSendEmail={handleSendEmail}
        onDelete={handleDeleteRechnung}
        onMarkBezahlt={handleMarkBezahlt}
        onShowHistorie={handleShowHistorie}
        addToast={addToast}
      />

      {showAddModal && (
        <AddRechnungModal
          kundenListe={kundenListe}
          onSave={handleSaveRechnung}
          onClose={() => setShowAddModal(false)}
          addToast={addToast}
        />
      )}

      {showKundenModal && (
        <AddKundenModal
          onSave={handleSaveKunde}
          onClose={() => setShowKundenModal(false)}
          addToast={addToast}
        />
      )}

      {showBezahltModal && bezahltInvoice && (
        <BezahltModal
          invoice={bezahltInvoice}
          onSave={handleSaveBezahlt}
          onClose={() => { setShowBezahltModal(false); setBezahltInvoice(null); }}
          addToast={addToast}
        />
      )}

      {showHistorieModal && historieInvoice && (
        <MahnhistorieModal
          invoice={historieInvoice}
          onClose={() => { setShowHistorieModal(false); setHistorieInvoice(null); }}
        />
      )}

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
