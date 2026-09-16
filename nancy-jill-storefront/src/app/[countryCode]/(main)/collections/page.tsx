import { Metadata } from "next"

import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SixSpotGrid, Spot } from "@modules/layout/components/six-spot-grid"

export const metadata: Metadata = {
  title: "Collections | Nancy Jill",
  description: "Browse our collections.",
}

export default async function CollectionsPage() {
  const { collections } = await listCollections()

  return (
    <SixSpotGrid>
      <Spot id={5} className="flex flex-col items-start justify-start text-left">
        {[...collections].reverse().map((collection) => (
          <LocalizedClientLink
            key={collection.id}
            href={`/collections/${collection.handle}`}
            className="group"
          >
            <h2 className="text-[72px] leading-none uppercase hover:italic">{collection.title}</h2>
          </LocalizedClientLink>
        ))}
      </Spot>
    </SixSpotGrid>
  )
}
