import { createClient } from '@supabase/supabase-js';

// Wir holen uns die sicheren Zugangsdaten aus deiner lokalen .env Datei
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Erstellt die Verbindung zur Datenbank
export const supabase = createClient(supabaseUrl, supabaseAnonKey);