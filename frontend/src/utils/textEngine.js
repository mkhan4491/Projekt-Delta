// Unsere Text-Templates für die 3 Stufen
const templates = {
  1: `Hallo {{ansprechpartner}},

sicherlich ist es im Alltagstrubel untergegangen, aber uns ist aufgefallen, dass die Rechnung Nr. {{rechnungsnummer}} vom {{ausstellungsdatum}} noch nicht beglichen wurde. 

Könnten Sie bitte in den nächsten Tagen prüfen, ob die Zahlung über {{betrag}} € bereits veranlasst wurde? 

Vielen Dank und beste Grüße
Cortex Executive Operations`,

  2: `Sehr geehrte/r {{ansprechpartner}},

bis heute konnten wir für die Rechnung Nr. {{rechnungsnummer}} leider keinen Zahlungseingang feststellen. Das vereinbarte Zahlungsziel war der {{faelligkeitsdatum}}.

Wir bitten Sie höflich, den offenen Betrag in Höhe von {{betrag}} € zeitnah auf unser Konto zu überweisen.

Mit freundlichen Grüßen
Cortex Executive Operations`,

  3: `WICHTIG: Letzte Mahnung zu Rechnung Nr. {{rechnungsnummer}}

Sehr geehrte/r {{ansprechpartner}},

trotz unserer vorherigen Erinnerungen ist der Betrag von {{betrag}} € für die Rechnung Nr. {{rechnungsnummer}} weiterhin unbeglichen. Sie befinden sich nun seit {{verzug}} Tagen im Verzug.

Wir fordern Sie hiermit auf, den ausstehenden Betrag unverzüglich zu überweisen, um weitere rechtliche Schritte und zusätzliche Kosten für Sie zu vermeiden.

Mit freundlichen Grüßen
Cortex Executive Operations`
};

// Die Funktion, die das Template lädt und die Platzhalter füllt
export function generateEmailText(invoice) {
  const stufe = invoice.mahnstufe;
  let text = templates[stufe];

  if (!text) return "Keine Mahnung notwendig.";

  // Platzhalter mit den echten Datenbank-Werten ersetzen
  text = text.replace('{{ansprechpartner}}', invoice.kunden?.ansprechpartner_name || 'Kunde');
  text = text.replace(/{{rechnungsnummer}}/g, invoice.rechnungsnummer);
  text = text.replace('{{ausstellungsdatum}}', new Date(invoice.ausstellungsdatum).toLocaleDateString('de-DE'));
  text = text.replace('{{faelligkeitsdatum}}', new Date(invoice.faelligkeitsdatum).toLocaleDateString('de-DE'));
  text = text.replace(/{{betrag}}/g, invoice.betrag);
  text = text.replace('{{verzug}}', invoice.overdueDays);

  return text;
}