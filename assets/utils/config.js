export const config = {
  schoolName: "FJKM Mahalavolona",
  logo: "🏫",
  theme: {
    primary: "#3b82f6", // Blue 600
    secondary: "#64748b", // Slate 500
    accent: "#f59e0b", // Amber 500
  },
  currency: "Ar",
  navigation: [
    { name: 'Tableau de bord', path: '/dashboard' },
    { name: 'Élèves', path: '/students' },
    { name: 'Écolage', path: '/fees' },
    { name: 'Actualités', path: '/news' },
    { name: 'Comptabilité', path: '/accounting' },
  ],
  feeTypes: ['ecolage', 'inscription', 'reinscription'],
  categories: {
    news: ['Admission', 'Calendrier', 'Vie scolaire', 'Événement'],
    accounting: ['Écolage', 'Inscription', 'Salaire', 'Matériel', 'Construction', 'Divers']
  }
};
