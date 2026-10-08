import type { Metadata } from "next";
import CorpPageShell from "@/components/corp/CorpPageShell";
import { CORP_SINGLE_PAGES, getCorpDoc } from "@/lib/corp-content";

const SLUG = "privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy - PT PLN Nusa Daya",
  description: "Kebijakan Privasi PT PLN Nusa Daya",
};

export default function PrivacyPolicyPage() {
  const entry = CORP_SINGLE_PAGES[SLUG];
  const doc = entry ? getCorpDoc(entry.docKey) : null;

  if (!doc) return null;

  return (
    <CorpPageShell
      doc={doc}
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Kebijakan" },
        { label: entry.label },
      ]}
      related={[
        { label: "Board Manual", href: "/tata-kelola/board-manual" },
        { label: "Code of Conduct", href: "/tata-kelola/code-of-conduct" },
        { label: "Pedoman GCG", href: "/tata-kelola/pedoman-gcg" },
        { label: "Info Pengadaan", href: "/pengadaan/info-pengadaan" },
      ]}
    />
  );
}
