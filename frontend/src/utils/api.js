import { supabase } from '../supabaseClient';

// Holt ALLE Rechnungen (offen und gemahnt)
export async function fetchRechnungen() {
  const { data, error } = await supabase
    .from('rechnungen')
    .select(`
      *,
      kunden (
        firmenname,
        ansprechpartner_name,
        e_mail
      )
    `); 
    // HIER HABEN WIR DEN FILTER .eq('status', 'offen') ENTFERNT!

  if (error) {
    console.error("Fehler beim Abrufen der Daten:", error.message);
    return [];
  }

  return data;
}

// Holt alle Kunden mit allen Feldern
export async function fetchKunden() {
  const { data, error } = await supabase
    .from('kunden')
    .select('*');

  if (error) {
    console.error("Fehler beim Laden der Kunden:", error);
    return [];
  }
  return data;
}

// Speichert die neue Rechnung in der Datenbank
export async function createRechnung(neueRechnung) {
  const { data, error } = await supabase
    .from('rechnungen')
    .insert([neueRechnung])
    .select();
    
  if (error) {
    console.error("Fehler beim Erstellen der Rechnung:", error);
    return null;
  }
  return data;
}

// Speichert einen neuen Kunden in der Datenbank
export async function createKunde(neuerKunde) {
  const { data, error } = await supabase
    .from('kunden')
    .insert([neuerKunde])
    .select();

  if (error) {
    console.error("Fehler beim Erstellen des Kunden:", error);
    return null;
  }
  return data;
}

// Aktualisiert Felder einer bestehenden Rechnung
export async function updateRechnung(id, fields) {
  const { error } = await supabase
    .from('rechnungen')
    .update(fields)
    .eq('id', id);

  if (error) {
    console.error("Fehler beim Aktualisieren der Rechnung:", error);
    return false;
  }
  return true;
}

// Rechnung als bezahlt markieren
export async function markAsBezahlt(id, { bezahlt_am, bezahlter_betrag }) {
  const { error } = await supabase
    .from('rechnungen')
    .update({ status: 'bezahlt', bezahlt_am, bezahlter_betrag })
    .eq('id', id);

  if (error) {
    console.error("Fehler beim Bezahlt-Markieren:", error);
    return false;
  }
  return true;
}

// Mahnhistorie einer Rechnung laden
export async function fetchMahnhistorie(rechnungId) {
  const { data, error } = await supabase
    .from('mahnhistorie')
    .select('*')
    .eq('rechnung_id', rechnungId)
    .order('gesendet_am', { ascending: false });

  if (error) {
    console.error("Fehler beim Laden der Mahnhistorie:", error);
    return [];
  }
  return data;
}

// Mahneintrag nach erfolgreichem Versand speichern
export async function createMahneintrag({ rechnung_id, mahnstufe, email_empfaenger, betreff }) {
  const { error } = await supabase
    .from('mahnhistorie')
    .insert([{ rechnung_id, mahnstufe, email_empfaenger, betreff }]);

  if (error) console.error("Fehler beim Speichern der Mahnhistorie:", error);
}

// Löscht eine Rechnung anhand ihrer ID
export async function deleteRechnung(id) {
  const { error } = await supabase
    .from('rechnungen')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Fehler beim Löschen der Rechnung:", error);
    return false;
  }
  return true;
}