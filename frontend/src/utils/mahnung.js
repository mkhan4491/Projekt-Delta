import { generateEmailText } from './textEngine';
import { createMahneintrag, updateRechnung } from './api';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL ?? 'http://localhost:5678/webhook/mahnung';

// Erzeugt Betreff + Text für eine Mahnung (Vorschlag für die Vorschau bzw. Bulk-Versand)
export function buildMahnung(invoice, einstellungen = null) {
  return {
    subject: `Wichtige Information zu Ihrer Rechnung ${invoice.rechnungsnummer}`,
    message: generateEmailText(invoice, einstellungen),
  };
}

// Versendet eine Mahnung über den n8n-Webhook, protokolliert sie in der Mahnhistorie
// und setzt den Rechnungsstatus auf 'gemahnt'.
// Reine Logik ohne Toasts/Reloads — der Aufrufer kümmert sich um die UX.
export async function sendMahnung(invoice, { subject, message }) {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toEmail:      invoice.kunden?.e_mail,
        customerName: invoice.kunden?.firmenname,
        subject,
        message,
        invoiceId:    invoice.id,
        mahnstufe:    invoice.mahnstufe,
      }),
    });

    if (!response.ok) return { ok: false, reason: 'webhook' };

    await createMahneintrag({
      rechnung_id:      invoice.id,
      mahnstufe:        invoice.mahnstufe,
      email_empfaenger: invoice.kunden?.e_mail,
      betreff:          subject,
    });

    // Status direkt hier setzen, statt sich auf den n8n-Update-Node zu verlassen
    await updateRechnung(invoice.id, {
      status: 'gemahnt',
      letzte_mahnung_am: new Date().toISOString().split('T')[0],
    });

    return { ok: true };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
