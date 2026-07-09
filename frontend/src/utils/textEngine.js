// Standard-Templates für die 3 Mahnstufen — werden verwendet,
// solange in den Einstellungen keine eigenen Texte hinterlegt sind
export const DEFAULT_TEMPLATES = {
  1: `Hallo {{ansprechpartner}},

sicherlich ist es im Alltagstrubel untergegangen, aber uns ist aufgefallen, dass die Rechnung Nr. {{rechnungsnummer}} vom {{ausstellungsdatum}} noch nicht beglichen wurde.

Könnten Sie bitte in den nächsten Tagen prüfen, ob die Zahlung über {{betrag}} € bereits veranlasst wurde?

Vielen Dank und beste Grüße
{{firma}}`,

  2: `Sehr geehrte/r {{ansprechpartner}},

bis heute konnten wir für die Rechnung Nr. {{rechnungsnummer}} leider keinen Zahlungseingang feststellen. Das vereinbarte Zahlungsziel war der {{faelligkeitsdatum}}.

Wir bitten Sie höflich, den offenen Betrag in Höhe von {{betrag}} € zeitnah auf unser Konto zu überweisen.

Mit freundlichen Grüßen
{{firma}}`,

  3: `WICHTIG: Letzte Mahnung zu Rechnung Nr. {{rechnungsnummer}}

Sehr geehrte/r {{ansprechpartner}},

trotz unserer vorherigen Erinnerungen ist der Betrag von {{betrag}} € für die Rechnung Nr. {{rechnungsnummer}} weiterhin unbeglichen. Sie befinden sich nun seit {{verzug}} Tagen im Verzug.

Wir fordern Sie hiermit auf, den ausstehenden Betrag unverzüglich zu überweisen, um weitere rechtliche Schritte und zusätzliche Kosten für Sie zu vermeiden.

Mit freundlichen Grüßen
{{firma}}`,
};

// Verfügbare Platzhalter — wird auf der Einstellungen-Seite als Hilfe angezeigt
export const PLACEHOLDERS = [
  { key: '{{ansprechpartner}}',   description: 'Name des Ansprechpartners' },
  { key: '{{firma}}',             description: 'Dein Firmenname (aus den Einstellungen)' },
  { key: '{{rechnungsnummer}}',   description: 'Rechnungsnummer' },
  { key: '{{ausstellungsdatum}}', description: 'Ausstellungsdatum der Rechnung' },
  { key: '{{faelligkeitsdatum}}', description: 'Fälligkeitsdatum' },
  { key: '{{betrag}}',            description: 'Rechnungsbetrag' },
  { key: '{{verzug}}',            description: 'Verzugstage' },
];

// Lädt das Template (eigenes aus den Einstellungen oder Standard) und füllt die Platzhalter
export function generateEmailText(invoice, einstellungen = null) {
  const stufe = invoice.mahnstufe;
  const eigenesTemplate = einstellungen?.[`mahntext_stufe${stufe}`];
  let text = (eigenesTemplate?.trim() ? eigenesTemplate : DEFAULT_TEMPLATES[stufe]);

  if (!text) return "Keine Mahnung notwendig.";

  const firma = einstellungen?.firmenname?.trim() || 'Cortex Executive Operations';

  text = text.replace(/{{ansprechpartner}}/g, invoice.kunden?.ansprechpartner_name || 'Kunde');
  text = text.replace(/{{firma}}/g, firma);
  text = text.replace(/{{rechnungsnummer}}/g, invoice.rechnungsnummer);
  text = text.replace(/{{ausstellungsdatum}}/g, new Date(invoice.ausstellungsdatum).toLocaleDateString('de-DE'));
  text = text.replace(/{{faelligkeitsdatum}}/g, new Date(invoice.faelligkeitsdatum).toLocaleDateString('de-DE'));
  text = text.replace(/{{betrag}}/g, invoice.betrag);
  text = text.replace(/{{verzug}}/g, invoice.overdueDays);

  return text;
}
