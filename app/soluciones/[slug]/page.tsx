import { notFound } from 'next/navigation'
import { getSector, SECTORES } from '@/lib/sectores'
import type { Metadata } from 'next'
import SectorPage from '@/components/landing/SectorPage'

// ─────────────────────────────────────────────────────────────────────────────
// /soluciones/[slug]/page.tsx
// Genera una página estática por sector: /soluciones/ganaderia, /soluciones/palma, etc.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return SECTORES.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sector = getSector(params.slug)
  if (!sector) return {}
  return {
    title: sector.metaTitle,
    description: sector.metaDesc,
    openGraph: {
      title: sector.metaTitle,
      description: sector.metaDesc,
    },
  }
}

export default function Page({ params }: Props) {
  const sector = getSector(params.slug)
  if (!sector) notFound()
  return <SectorPage sector={sector} />
}
