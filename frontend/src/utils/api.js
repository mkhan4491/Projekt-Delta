import { supabase } from '../supabaseClient';

export async function fetchOpenInvoices() {
  // Wir fragen die Tabelle 'rechnungen' ab und verbinden sie mit 'kunden'
  const { data, error } = await supabase
    .from('rechnungen')
    .select(`
      *,
      kunden (
        firmenname,
        ansprechpartner_name,
        e_mail
      )
    `)
    .eq('status', 'offen'); // Filter: Nur offene Rechnungen holen

  if (error) {
    console.error("Fehler beim Abrufen der Daten:", error.message);
    return [];
  }

  return data;
}