import ProfilClient from './ProfilClient';

// Profil-Editor ist rein client-/auth-seitig (createClient braucht Browser-Env).
// Server-Wrapper + force-dynamic → die Route wird NICHT statisch vorgerendert,
// daher unabhängig vom Preview-Env-Scope (kein Build-Fehler mehr).
export const dynamic = 'force-dynamic';

export default function ProfilPage() {
  return <ProfilClient />;
}
