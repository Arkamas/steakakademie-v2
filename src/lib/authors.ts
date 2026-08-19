import type { Author } from '@/types';

export const AUTHORS: Author[] = [
  {
    name: 'Uwe Yendell',
    slug: 'uwe-yendell',
    avatar: '/images/uwe-yendell.png',
    bio: 'Uwe Yendell ist Gründer der Steakakademie. Er kocht, seit er sieben ist, und hat mit vierzehn angefangen, für Gruppen zu kochen — im Jugendwohnhaus, später als Jugendbetreuer in AWO-Feriencamps und in der Kombüse von Plattbodenschiffen. Die Ausbildung zum Koch kam danach, dann die Jahre als Mietkoch, die Weber-Grillmeister-Ausbildung. Von 2013 bis 2021 führte er als Geschäftsführer die Genusskunst GmbH — seine eigene Eventküche mit angeschlossener Weber Grillakademie, an der er alle Grill-Kurs-Klassen unterrichtete. Dazu kommt eine zertifizierte Marketing-Ausbildung auf Master-Niveau und 22 Jahre als Sport- und Gymnastiklehrer. Diese Dreifach-Kompetenz — Küchenhandwerk, Marketing-Methodik und Coaching — prägt jede Entscheidung der Steakakademie. Uwe schreibt nicht als Theoretiker, sondern als krisenerprobter Praktiker, der weiß, wie Küchen, Fleisch und Menschen wirklich funktionieren.',
    shortBio: 'Gründer der Steakakademie · Profi-Koch · Weber-zertifizierter Grillmeister · kocht seit dem siebten Lebensjahr.',
    expertise: ['BBQ & Grillen', 'Fleischkunde & Cuts', 'Gastronomie-Praxis', 'Kerntemperaturen', 'Existenzgründung'],
    statsLabel: 'Weber-zertifizierter Grillmeister · Profi-Koch · GF Genusskunst GmbH mit angeschlossener Weber Grillakademie 2013–2021 · zert. Marketing-Manager · 22 Jahre Sport- und Gymnastiklehrer',
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
