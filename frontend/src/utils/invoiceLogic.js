// Berechnet die überfälligen Tage zwischen heute und dem Fälligkeitsdatum
export function calculateOverdueDays(dueDateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Uhrzeit ignorieren, nur das Datum zählt

  const dueDate = new Date(dueDateString);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = today - dueDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Wenn das Ergebnis im Minus ist, ist die Rechnung noch nicht fällig
  return diffDays > 0 ? diffDays : 0;
}

// Ermittelt die richtige Mahnstufe anhand der überfälligen Tage
export function getMahnstufe(overdueDays) {
  if (overdueDays === 0) return 0; // Nicht überfällig
  if (overdueDays >= 1 && overdueDays <= 5) return 1; // Stufe 1: Freundliche Erinnerung
  if (overdueDays >= 6 && overdueDays <= 14) return 2; // Stufe 2: Formelle Mahnung
  if (overdueDays > 14) return 3; // Stufe 3: Nachdrückliche letzte Mahnung
}

// Berechnet die KPI-Kennzahlen für Dashboard und Karten
export function computeKpiStats(invoices) {
  return {
    totalOpen:    invoices.filter(inv => inv.status === 'offen').reduce((s, i) => s + i.betrag, 0),
    countOpen:    invoices.filter(inv => inv.status === 'offen').length,
    countGemahnt: invoices.filter(inv => inv.status === 'gemahnt').length,
    countUrgent:  invoices.filter(inv => inv.mahnstufe === 3).length,
    totalBezahlt: invoices.filter(inv => inv.status === 'bezahlt').reduce((s, i) => s + (i.bezahlter_betrag ?? i.betrag), 0),
    countBezahlt: invoices.filter(inv => inv.status === 'bezahlt').length,
  };
}

// Gruppiert offene Beträge nach Verzugsdauer für die Altersstrukturanalyse
export function computeAgingBuckets(invoices) {
  const buckets = [
    { label: 'Nicht fällig',  min: -Infinity, max: 0,        amount: 0, count: 0 },
    { label: '1–30 Tage',     min: 1,         max: 30,       amount: 0, count: 0 },
    { label: '31–60 Tage',    min: 31,        max: 60,       amount: 0, count: 0 },
    { label: '61–90 Tage',    min: 61,        max: 90,       amount: 0, count: 0 },
    { label: '90+ Tage',      min: 91,        max: Infinity, amount: 0, count: 0 },
  ];

  for (const inv of invoices) {
    if (inv.status === 'bezahlt') continue;
    const bucket = buckets.find(b => inv.overdueDays >= b.min && inv.overdueDays <= b.max);
    if (bucket) {
      bucket.amount += inv.betrag;
      bucket.count += 1;
    }
  }

  return buckets.map(({ label, amount, count }) => ({ label, amount, count }));
}

// Aggregiert Rechnungsdaten pro Kunde (für Kundenliste und Detailseite)
export function aggregateByKunde(invoices) {
  const map = new Map();
  for (const inv of invoices) {
    if (!map.has(inv.kunden_id)) {
      map.set(inv.kunden_id, { offenSumme: 0, countOffen: 0, countGemahnt: 0, countBezahlt: 0 });
    }
    const agg = map.get(inv.kunden_id);
    if (inv.status === 'offen') {
      agg.offenSumme += inv.betrag;
      agg.countOffen += 1;
    } else if (inv.status === 'gemahnt') {
      agg.offenSumme += inv.betrag;
      agg.countGemahnt += 1;
    } else if (inv.status === 'bezahlt') {
      agg.countBezahlt += 1;
    }
  }
  return map;
}