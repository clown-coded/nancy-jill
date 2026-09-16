import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import EditorialTemplate from "@modules/collections/templates/editorial"
import NotebookTemplate from "@modules/collections/templates/notebook"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
}

export async function generateStaticParams() {
  const { collections } = await listCollections()

  if (!collections) {
    return []
  }

  return collections
    .map((collection) =>
      collection.handle ? { handle: collection.handle } : null
    )
    .filter(Boolean)
}

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
