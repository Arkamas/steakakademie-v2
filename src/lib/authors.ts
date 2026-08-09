import type { Author } from '@/types';

export const AUTHORS: Author[] = [
  {
    name: 'Uwe Yendell',
    slug: 'uwe-yendell',
    avatar: '/images/uwe-yendell.png',
    bio: 'Uwe Yendell ist Gründer der Steakakademie. Als gelernter Profi-Koch, Weber-zertifizierter Grillmeister (8 Jahre Kursleiter an einer offiziellen Weber Grillakademie) und Gastronom hat er jahrzehntelang an der Front gekocht — inklusive einer eigenen Eventküche. Dazu kommt eine zertifizierte Marketing-Ausbildung auf Master-Niveau und 20 Jahre als Sport- und Gymnastiklehrer. Diese Dreifach-Kompetenz — Küchenhandwerk, Marketing-Methodik und Coaching — prägt jede Entscheidung der Steakakademie. Uwe schreibt nicht als Theoretiker, sondern als krisenerprobter Praktiker, der weiß, wie Küchen, Fleisch und Menschen wirklich funktionieren.',
    shortBio: 'Gründer der Steakakademie · Profi-Koch · zertifizierter Marketing-Manager.',
    expertise: ['BBQ & Grillen', 'Fleischkunde & Cuts', 'Gastronomie-Praxis', 'Kerntemperaturen', 'Existenzgründung'],
    statsLabel: 'Weber-zertifizierter Grillmeister · Profi-Koch · zert. Marketing-Manager · 20 Jahre Trainer',
    jobTitle: 'Gründer & Profi-Koch',
    credential: 'Zertifizierter Marketing-Manager (Master-Niveau)',
    realPerson: true,
  },
  {
    name: 'Marco',
    slug: 'marco',
    avatar: '/images/authors/marco-richter.jpg',
    bio: 'Marco „Der Meister" ist die KI-Redaktionspersona für die technischen Themen der Steakakademie: Kerntemperaturen, Cuts, Reverse Sear, Low & Slow. Er erklärt präzise und ruhig, was die Sache hergibt — und sagt es, wenn etwas nicht gesichert ist. Seine Angaben stammen aus der kanonischen Temperatur- und Cut-Referenz der Steakakademie und aus der Praxis von Gründer Uwe Yendell (Profi-Koch, Weber-zertifizierter Grillmeister); fachlich verantwortet werden sie von ihm.',
    shortBio: 'KI-Redaktionspersona für Technik: Kerntemperaturen, Cuts, Reverse Sear.',
    expertise: ['Cuts & Fleischkunde', 'Kerntemperaturen', 'Texas BBQ', 'Reverse Sear', 'Low & Slow'],
    statsLabel: 'KI-Persona · fachlich verantwortet von Uwe Yendell',
  },
  {
    name: 'Jonas',
    slug: 'jonas',
    avatar: '/images/authors/jonas.jpg',
    bio: 'Jonas „Der Enthusiast" ist die KI-Redaktionspersona für Einsteigerthemen: die ersten Schritte am Grill, Equipment-Einordnung, Marinaden und Rubs. Sein Ton ist begeistert und ehrlich — auch dort, wo etwas schiefgehen kann. Die fachliche Grundlage kommt aus der Wissensbasis der Steakakademie und wird von Gründer Uwe Yendell verantwortet.',
    shortBio: 'KI-Redaktionspersona für Einsteigerthemen, Equipment und Rubs.',
    expertise: ['Einsteiger-Guides', 'Grillzubehör', 'Marinaden & Rubs', 'Grundtechniken'],
    statsLabel: 'KI-Persona · fachlich verantwortet von Uwe Yendell',
  },
  {
    name: 'Elena',
    slug: 'elena',
    avatar: '/images/authors/elena.jpg',
    bio: 'Elena „Die Stimme" ist die KI-Redaktionspersona für Hintergrund und Erzählung: die Chemie hinter dem Grillen, Dry Aging, Terroir und internationale Cuts. Sie ordnet ein, warum die Maillard-Reaktion mehr ist als Bräunung und was beim Reifen wirklich passiert. Die fachliche Grundlage kommt aus der Wissensbasis der Steakakademie und wird von Gründer Uwe Yendell verantwortet.',
    shortBio: 'KI-Redaktionspersona für Food Science, Dry Aging und Cut-Kultur.',
    expertise: ['Food Science', 'Dry Aging', 'Marinade-Chemie', 'Cut-Kultur & Terroir'],
    statsLabel: 'KI-Persona · fachlich verantwortet von Uwe Yendell',
  },
];

export function getAuthorBySlug(slug: string): Author | undefined {
  return AUTHORS.find((a) => a.slug === slug);
}

export function getAllAuthors(): Author[] {
  return AUTHORS;
}
