import { generateEmailText } from './textEngine';
import { createMahneintrag } from './api';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL ?? 'http://localhost:5678/webhook/mahnung';

// Versendet eine Mahnung über den n8n-Webhook und protokolliert sie in der Mahnhistorie.
// Reine Logik ohne Toasts/Reloads — der Aufrufer kümmert sich um die UX.
export async function sendMahnung(invoice) {
  const emailText = generateEmailText(invoice);
  const subject = `Wichtige Information zu Ihrer Rechnung ${invoice.rechnungsnummer}`;

  try {
    const response = await fetch(WEBHOOK_URL, {
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

    if (!response.ok) return { ok: false, reason: 'webhook' };

    await createMahneintrag({
      rechnung_id:      invoice.id,
      mahnstufe:        invoice.mahnstufe,
      email_empfaenger: invoice.kunden?.e_mail,
      betreff:          subject,
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
