import { SoftwareConfigEditor } from '@/components/config-editor/SoftwareConfigEditor'
import { softwareDefinitions } from '@/lib/software-definitions'

interface PageProps {
  params: Promise<{ id: string }>
}

// Generate static params for all software definitions
export async function generateStaticParams() {
  return softwareDefinitions.map((software) => ({
    id: software.id,
  }))
}

export default async function SoftwareConfigPage({ params }: PageProps) {
  const resolvedParams = await params
  
  return <SoftwareConfigEditor softwareId={resolvedParams.id} />
}