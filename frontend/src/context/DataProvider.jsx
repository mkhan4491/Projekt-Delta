import { useEffect, useState } from 'react';
import { DataContext } from './useData.js';
import { fetchRechnungen, fetchKunden, fetchEinstellungen } from '../utils/api';
import { calculateOverdueDays, getMahnstufe } from '../utils/invoiceLogic';

function useToastState() {
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

function processRechnungen(data) {
  const processed = data.map(inv => {
    const overdueDays = calculateOverdueDays(inv.faelligkeitsdatum);
    return { ...inv, overdueDays, mahnstufe: getMahnstufe(overdueDays) };
  });
  processed.sort((a, b) => b.overdueDays - a.overdueDays);
  return processed;
}

export default function DataProvider({ children }) {
  const [invoices, setInvoices] = useState([]);
  const [kundenListe, setKundenListe] = useState([]);
  const [einstellungen, setEinstellungen] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToastState();

  async function loadData() {
    const data = await fetchRechnungen();
    setInvoices(processRechnungen(data));
    setLoading(false);
  }

  async function loadKunden() {
    const data = await fetchKunden();
    setKundenListe(data);
  }

  async function loadEinstellungen() {
    const data = await fetchEinstellungen();
    setEinstellungen(data);
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchRechnungen(), fetchKunden(), fetchEinstellungen()]).then(([rechnungen, kunden, settings]) => {
      if (cancelled) return;
      setInvoices(processRechnungen(rechnungen));
      setKundenListe(kunden);
      setEinstellungen(settings);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <DataContext.Provider value={{
      invoices, kundenListe, einstellungen, loading,
      loadData, loadKunden, loadEinstellungen,
      toasts, addToast, removeToast,
    }}>
      {children}
    </DataContext.Provider>
  );
}
