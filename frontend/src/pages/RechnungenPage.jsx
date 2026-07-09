import { useMemo, useState } from 'react';
import { useData } from '../context/useData.js';
import { createRechnung, deleteRechnung, markAsBezahlt, updateRechnung } from '../utils/api';
import { sendMahnung, buildMahnung } from '../utils/mahnung';
import InvoiceTable from '../components/InvoiceTable.jsx';
import InvoiceDetailPanel from '../components/InvoiceDetailPanel.jsx';
import AddRechnungModal from '../components/AddRechnungModal.jsx';
import EditRechnungModal from '../components/EditRechnungModal.jsx';
import BezahltModal from '../components/BezahltModal.jsx';
import MahnungVorschauModal from '../components/MahnungVorschauModal.jsx';

export default function RechnungenPage() {
  const { invoices, kundenListe, einstellungen, loadData, addToast } = useData();

  const [activeTab, setActiveTab] = useState('offen');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('overdueDays');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [detailInvoiceId, setDetailInvoiceId] = useState(null);
  const [historieRefreshKey, setHistorieRefreshKey] = useState(0);
  const [editInvoice, setEditInvoice] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bezahltInvoice, setBezahltInvoice] = useState(null);
  const [vorschauInvoice, setVorschauInvoice] = useState(null);
  const [bulkProgress, setBulkProgress] = useState(null); // { current, total } | null

  // Tab-Wechsel leert die Selektion, damit keine unsichtbaren Rechnungen gemahnt werden
  const switchTab = (tab) => {
    setActiveTab(tab);
    setSelectedIds(new Set());
  };

  const displayedInvoices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = invoices
      .filter(inv => inv.status === activeTab)
      .filter(inv => {
        if (!term) return true;
        const firma = inv.kunden?.firmenname?.toLowerCase() ?? '';
        const nr = inv.rechnungsnummer?.toLowerCase() ?? '';
        return firma.includes(term) || nr.includes(term);
      });

    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let cmp;
      if (sortKey === 'betrag') cmp = a.betrag - b.betrag;
      else if (sortKey === 'faelligkeitsdatum') cmp = new Date(a.faelligkeitsdatum) - new Date(b.faelligkeitsdatum);
      else cmp = a.overdueDays - b.overdueDays;
      if (cmp === 0) cmp = String(a.id).localeCompare(String(b.id));
      return cmp * dir;
    });
  }, [invoices, activeTab, searchTerm, sortKey, sortDir]);

  // Panel-Invoice aus der VOLLEN Liste ableiten (bleibt nach Statuswechsel offen);
  // ist die Rechnung gelöscht, rendert das Panel schlicht nicht mehr
  const detailInvoice = invoices.find(inv => inv.id === detailInvoiceId) ?? null;

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    setSelectedIds(prev => {
      const visibleIds = displayedInvoices.map(inv => inv.id);
      const allSelected = visibleIds.every(id => prev.has(id));
      return allSelected ? new Set() : new Set(visibleIds);
    });
  };

  // "Mahnung senden" öffnet zuerst die Vorschau — versendet wird erst nach Bestätigung
  const handleSendEmail = (invoice) => {
    setVorschauInvoice(invoice);
  };

  const handleConfirmSend = async (invoice, mail) => {
    const result = await sendMahnung(invoice, mail);
    if (result.ok) {
      setVorschauInvoice(null);
      addToast('success', 'Mahnung erfolgreich gesendet.');
      setHistorieRefreshKey(k => k + 1);
      loadData();
    } else if (result.reason === 'webhook') {
      addToast('error', 'Fehler: n8n Webhook hat nicht geantwortet.');
    } else {
      addToast('error', 'Keine Verbindung zu n8n herstellen.');
    }
  };

  const handleBulkSend = async () => {
    // Nur sichtbare, überfällige Rechnungen aus der Selektion senden
    const targets = displayedInvoices.filter(inv => selectedIds.has(inv.id) && inv.mahnstufe !== 0);
    if (targets.length === 0) {
      addToast('warning', 'Keine mahnbaren Rechnungen ausgewählt.');
      return;
    }

    const failed = [];
    const succeededIds = [];
    for (let i = 0; i < targets.length; i++) {
      setBulkProgress({ current: i + 1, total: targets.length });
      const result = await sendMahnung(targets[i], buildMahnung(targets[i], einstellungen));
      if (result.ok) succeededIds.push(targets[i].id);
      else failed.push(targets[i].rechnungsnummer);
    }
    setBulkProgress(null);

    setSelectedIds(prev => {
      const next = new Set(prev);
      succeededIds.forEach(id => next.delete(id));
      return next;
    });
    loadData();

    if (failed.length === 0) {
      addToast('success', `${succeededIds.length} Mahnungen erfolgreich gesendet.`);
    } else {
      addToast('error', `${succeededIds.length} von ${targets.length} Mahnungen gesendet, ${failed.length} fehlgeschlagen (${failed.join(', ')}).`, 8000);
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

  const handleUpdateRechnung = async (fields) => {
    const ok = await updateRechnung(editInvoice.id, fields);
    if (ok) {
      setEditInvoice(null);
      loadData();
      addToast('success', 'Rechnung aktualisiert.');
    } else {
      addToast('error', 'Änderungen konnten nicht gespeichert werden.');
    }
  };

  const handleDeleteRechnung = async (id) => {
    const ok = await deleteRechnung(id);
    if (ok) {
      setDetailInvoiceId(null);
      loadData();
      addToast('success', 'Rechnung gelöscht.');
    } else {
      addToast('error', 'Löschen fehlgeschlagen.');
    }
  };

  const handleSaveBezahlt = async (data) => {
    const ok = await markAsBezahlt(bezahltInvoice.id, data);
    if (ok) {
      setBezahltInvoice(null);
      loadData();
      addToast('success', 'Zahlungseingang erfasst.');
    } else {
      addToast('error', 'Konnte Zahlung nicht speichern.');
    }
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

  const selectable = activeTab === 'offen';

  return (
    <>
      <header className="page-header">
        <h1>Rechnungen</h1>
        <p>Forderungen verwalten, mahnen und Zahlungen erfassen</p>
      </header>

      <div className="action-bar">
        <div className="action-bar__left">
          <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
            + Neue Rechnung
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
          onClick={() => switchTab('offen')}
        >
          Aktionsbedarf (Offen)
        </button>
        <button
          className={`tabs__tab${activeTab === 'gemahnt' ? ' tabs__tab--active' : ''}`}
          onClick={() => switchTab('gemahnt')}
        >
          Warteschleife (Gemahnt)
        </button>
        <button
          className={`tabs__tab${activeTab === 'bezahlt' ? ' tabs__tab--active-green' : ''}`}
          onClick={() => switchTab('bezahlt')}
        >
          Bezahlt
        </button>
      </div>

      <div className="table-toolbar">
        <input
          className="form-input search-input"
          type="search"
          placeholder="Suchen (Kunde, Rechnungs-Nr.)…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {selectable && selectedIds.size > 0 && (
          <div className="bulk-bar">
            <span>{selectedIds.size} ausgewählt</span>
            <button
              className="btn btn--primary btn--sm"
              disabled={bulkProgress !== null}
              onClick={handleBulkSend}
            >
              {bulkProgress
                ? `Sende ${bulkProgress.current}/${bulkProgress.total}…`
                : `${selectedIds.size} Mahnungen senden`}
            </button>
          </div>
        )}
      </div>

      <InvoiceTable
        invoices={displayedInvoices}
        activeTab={activeTab}
        onRowClick={(inv) => setDetailInvoiceId(inv.id)}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        selectable={selectable}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
      />

      {detailInvoice && (
        <InvoiceDetailPanel
          key={detailInvoice.id}
          invoice={detailInvoice}
          onClose={() => setDetailInvoiceId(null)}
          onSendEmail={handleSendEmail}
          onMarkBezahlt={(inv) => setBezahltInvoice(inv)}
          onEdit={(inv) => setEditInvoice(inv)}
          onDelete={handleDeleteRechnung}
          historieRefreshKey={historieRefreshKey}
        />
      )}

      {showAddModal && (
        <AddRechnungModal
          kundenListe={kundenListe}
          onSave={handleSaveRechnung}
          onClose={() => setShowAddModal(false)}
          addToast={addToast}
        />
      )}

      {editInvoice && (
        <EditRechnungModal
          invoice={editInvoice}
          onSave={handleUpdateRechnung}
          onClose={() => setEditInvoice(null)}
          addToast={addToast}
        />
      )}

      {bezahltInvoice && (
        <BezahltModal
          invoice={bezahltInvoice}
          onSave={handleSaveBezahlt}
          onClose={() => setBezahltInvoice(null)}
          addToast={addToast}
        />
      )}

      {vorschauInvoice && (
        <MahnungVorschauModal
          invoice={vorschauInvoice}
          einstellungen={einstellungen}
          onSend={handleConfirmSend}
          onClose={() => setVorschauInvoice(null)}
          addToast={addToast}
        />
      )}
    </>
  );
}
