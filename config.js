// ============================================================
// Accès Supabase pour le contenu modifiable (espace admin).
// À remplir en suivant SETUP.md (section « Espace admin »).
// La clé « anon » est PUBLIQUE par conception : elle ne permet
// que la lecture — les règles de sécurité sont côté Supabase.
// Tant que ces champs sont vides, le site utilise les textes,
// photos et tarifs écrits dans le code : rien ne casse.
// ============================================================
window.ACACIAS_SUPABASE = {
  url: 'https://ndeitdrafgosaghgvoas.supabase.co',  // adresse RACINE du projet, sans /rest/v1/
  anonKey: 'sb_publishable__5PReFKzKz9w2k7xsO0fJQ_jlEZAK8w',  // Project Settings → API Keys → publishable
};
