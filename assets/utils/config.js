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
    { name: 'Tableau de bord', path: '/admin/dashboard' },
    { name: 'Élèves', path: '/admin/students' },
    { name: 'Écolage', path: '/admin/fees' },
    { name: 'Actualités', path: '/admin/news' },
    { name: 'Comptabilité', path: '/admin/accounting' },
  ],
  feeTypes: ['ecolage', 'inscription', 'reinscription'],
  categories: {
    news: ['Admission', 'Calendrier', 'Vie scolaire', 'Événement'],
    accounting: ['Écolage', 'Inscription', 'Salaire', 'Matériel', 'Construction', 'Divers']
  }
};
