import { redirect } from 'next/navigation';

// /profil war eine nicht angebundene UI-Attrappe (717 Zeilen ohne Supabase-
// Anbindung, hartkodierte Daten, totes Rezeptformular ohne Einwilligung).
// Das echte, verdrahtete Profil lebt unter /diplome/profil — dorthin leiten
// wir dauerhaft um. Befund: docs/ARCHITEKTUR-AUDIT-2026-08-27.md (Punkt /profil).
// Entfernt am 30.08.2026; Wiederherstellung bei Bedarf via Git-Historie.
export default function ProfilRedirect() {
  redirect('/diplome/profil');
}
