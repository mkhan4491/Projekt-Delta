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