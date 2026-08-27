import { allDiplomLektions } from 'contentlayer/generated';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RoadmapClient, { type LektionenByStufe, type LektionLink } from './RoadmapClient';

// Server Component: contentlayer bleibt hier (Build-Zeit, kein Client-Bundle).
// Der Client bekommt nur den serialisierbaren Ausschnitt, den er wirklich rendert.
function lektionenNachStufe(): LektionenByStufe {
  const byStufe: Record<number, LektionLink[]> = {};
  for (const l of allDiplomLektions) {
    (byStufe[l.stufe] ??= []).push({
      lektionSlug: l.lektionSlug,
      title: l.title,
      order: l.order,
      url: l.url,
    });
  }
  for (const list of Object.values(byStufe)) list.sort((a, b) => a.order - b.order);
  return byStufe;
}

export default function DiplomeRoadmapPage() {
  const lektionen = lektionenNachStufe();
  return (
    <>
      <Header />
      <RoadmapClient lektionen={lektionen} />
      <Footer />
    </>
  );
}
