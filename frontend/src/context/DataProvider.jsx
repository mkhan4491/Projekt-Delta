import { useEffect, useState } from 'react';
import { DataContext } from './useData.js';
import { fetchRechnungen, fetchKunden } from '../utils/api';
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

export default function DataProvider({ children }) {
  const [invoices, setInvoices] = useState([]);
  const [kundenListe, setKundenListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToastState();

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

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchRechnungen(), fetchKunden()]).then(([rechnungen, kunden]) => {
      if (cancelled) return;
      const processed = rechnungen.map(inv => {
        const overdueDays = calculateOverdueDays(inv.faelligkeitsdatum);
        return { ...inv, overdueDays, mahnstufe: getMahnstufe(overdueDays) };
      });
      processed.sort((a, b) => b.overdueDays - a.overdueDays);
      setInvoices(processed);
      setKundenListe(kunden);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <DataContext.Provider value={{
      invoices, kundenListe, loading,
      loadData, loadKunden,
      toasts, addToast, removeToast,
    }}>
      {children}
    </DataContext.Provider>
  );
}
