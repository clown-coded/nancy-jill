import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CollectionTemplate from "@modules/collections/templates"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: SortOptions
  }>
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
    title: `Shop ${collection.title} | Nancy Jill`,
    description: `Shop the ${collection.title} collection`,
  }
}

export default async function CollectionShopPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page } = searchParams

  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  return (
    <CollectionTemplate
      collection={collection}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}
