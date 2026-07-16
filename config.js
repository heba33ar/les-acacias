// ============================================================
// Accès Supabase pour le contenu modifiable (espace admin).
// À remplir en suivant SETUP.md (section « Espace admin »).
// La clé « anon » est PUBLIQUE par conception : elle ne permet
// que la lecture — les règles de sécurité sont côté Supabase.
// Tant que ces champs sont vides, le site utilise les textes,
// photos et tarifs écrits dans le code : rien ne casse.
// ============================================================
window.ACACIAS_SUPABASE = {
  url: '',      // ex. 'https://abcdefgh.supabase.co'
  anonKey: '',  // Project Settings → API → anon public
};
