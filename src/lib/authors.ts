import type { Author } from '@/types';

export const AUTHORS: Author[] = [
  {
    name: 'Marco',
    slug: 'marco',
    avatar: '/images/authors/marco.jpg',
    bio: 'Marco ist der Pitmaster hinter der Steakakademie. Mit über 15 Jahren Grillpraxis, Dutzenden getesteten Cuts und einer Leidenschaft für texanisches BBQ bringt er echte Praxiserfahrung in jeden Artikel. Er testet alle Produkte selbst, bevor er sie empfiehlt — und hat für ein gutes Brisket auch schon mal eine Nachtschicht am Smoker durchgezogen.',
    shortBio: 'Pitmaster mit 15+ Jahren Grillpraxis. Testet alles selbst.',
    expertise: ['Cuts & Fleischkunde', 'Thermometer-Tests', 'Texas BBQ', 'Kerntemperaturen', 'Reverse Sear'],
    statsLabel: '15+ Jahre Grillpraxis',
  },
  {
    name: 'Jonas',
    slug: 'jonas',
    avatar: '/images/authors/jonas.jpg',
    bio: 'Jonas ist der Enthusiast im Team — immer dabei wenn neue Techniken ausprobiert werden, immer hungrig auf das nächste Experiment. Er schreibt über Einsteigerthemen, Equipment-Reviews und die kleinen Tricks, die den Unterschied machen.',
    shortBio: 'BBQ-Enthusiast. Schreibt über Techniken und Equipment.',
    expertise: ['Equipment-Reviews', 'Einsteiger-Guides', 'Grillzubehör', 'Marinaden & Rubs'],
    statsLabel: '200+ Grillsessions dokumentiert',
  },
  {
    name: 'Elena',
    slug: 'elena',
    avatar: '/images/authors/elena.jpg',
    bio: 'Elena bringt die wissenschaftliche Perspektive ein. Als Food-Enthusiastin mit Hintergrund in Ernährungswissenschaften schreibt sie über die Chemie hinter dem Grillen — warum die Maillard-Reaktion so faszinierend ist, was beim Dry Aging passiert und warum Salzen vor dem Grillen kein Mythos ist.',
    shortBio: 'Food-Wissenschaft trifft Grillpraxis.',
    expertise: ['Food Science', 'Dry Aging', 'Marinade-Chemie', 'Ernährung & BBQ'],
    statsLabel: 'Ernährungswissenschaften & BBQ seit 8 Jahren',
  },
];

export function getAuthorBySlug(slug: string): Author | undefined {
  return AUTHORS.find((a) => a.slug === slug);
}

export function getAllAuthors(): Author[] {
  return AUTHORS;
}
