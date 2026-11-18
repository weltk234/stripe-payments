import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SECTION_VIEWS } from "@/components/sections/registry";
import { SECTIONS, isSectionSlug } from "@/lib/sections";

interface Props {
  params: Promise<{ section: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SECTIONS).map((section) => ({ section }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  return { title: isSectionSlug(section) ? `${SECTIONS[section].title} – cramly.ai – Stripe` : "Stripe" };
}

export default async function SectionPage({ params }: Props) {
  const { section } = await params;
  if (!isSectionSlug(section)) notFound();
  const View = SECTION_VIEWS[section];
  return <View />;
}
