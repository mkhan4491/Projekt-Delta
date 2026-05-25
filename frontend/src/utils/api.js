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

// Holt alle Kunden für das Dropdown-Menü
export async function fetchKunden() {
  const { data, error } = await supabase
    .from('kunden')
    .select('id, firmenname');
    
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