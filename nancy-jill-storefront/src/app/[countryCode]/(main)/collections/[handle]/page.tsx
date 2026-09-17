import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle } from "@lib/data/collections"
import EditorialTemplate from "@modules/collections/templates/editorial"
import NotebookTemplate from "@modules/collections/templates/notebook"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
}

// Rendered per request rather than prerendered: something in this page's
// render path reads cookies, which conflicts with generateStaticParams and
// throws "Page changed from static to dynamic at runtime". The underlying
// fetch is still cached (revalidate: 60), so this does not add backend calls.
export const dynamic = "force-dynamic"

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  return {
    title: `${collection.title} | Nancy Jill`,
    description: `${collection.title} editorial`,
  }
}

export default async function CollectionEditorialPage(props: Props) {
  const params = await props.params

  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  const layout =
    typeof collection.metadata?.layout === "string"
      ? collection.metadata.layout
      : "editorial"

  if (layout === "notebook") {
    return <NotebookTemplate collection={collection} />
  }

  return <EditorialTemplate collection={collection} />
}
