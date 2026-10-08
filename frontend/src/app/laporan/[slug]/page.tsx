import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CorpPageShell from "@/components/corp/CorpPageShell";
import { CORP_GROUPS, getCorpGroupSlugs, getCorpPage } from "@/lib/corp-content";

const GROUP = "laporan";

export function generateStaticParams() {
  return getCorpGroupSlugs(GROUP).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getCorpPage(GROUP, slug);
  if (!page) return { title: "Halaman Tidak Ditemukan - PT PLN Nusa Daya" };
  return {
    title: `${page.item.label} - Laporan Manajemen - PT PLN Nusa Daya`,
    description: page.doc.title,
  };
}

export default async function LaporanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getCorpPage(GROUP, slug);
  if (!page) notFound();

  const related = CORP_GROUPS[GROUP].items
    .filter((i) => i.slug !== slug)
    .map((i) => ({ label: i.label, href: `/${GROUP}/${i.slug}` }));

  return (
    <CorpPageShell
      doc={page.doc}
      crumbs={[
        { label: "Home", href: "/" },
        { label: page.groupLabel },
        { label: page.item.label },
      ]}
      related={related}
    />
  );
}
