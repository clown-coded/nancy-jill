import { Metadata } from "next"

import { listCollections } from "@lib/data/collections"
import HomeMediaCycle from "@modules/home/components/home-media-cycle"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SixSpotGrid, Spot } from "@modules/layout/components/six-spot-grid"

export const metadata: Metadata = {
  title: "Nancy Jill",
  description: "Nancy Jill Clothing",
}

export default async function Home() {
  const { collections } = await listCollections({
    order: "-created_at",
    limit: "1",
    fields: "+metadata",
  })

  const latestCollection = collections[0]

  if (!latestCollection) {
    return null
  }

  const meta = latestCollection.metadata ?? {}
  const urls = [
    typeof meta.homepage_media_1 === "string" ? meta.homepage_media_1 : "",
    typeof meta.homepage_media_2 === "string" ? meta.homepage_media_2 : "",
    typeof meta.homepage_media_3 === "string" ? meta.homepage_media_3 : "",
  ].filter(Boolean)

  const items = urls.map((url, i) => ({
    url,
    alt: `${latestCollection.title} ${i + 1}`,
  }))

  return (
    <SixSpotGrid stagger={false} className="h-[var(--nj-vh)] overflow-hidden small:h-auto small:min-h-screen small:overflow-x-clip">
      {items.length > 0 && (
        <Spot id={2} rowSpan={3}>
          <div data-home-intro="img-1" className="absolute inset-x-0 top-0 h-[calc(var(--nj-vh)*0.8333)] small:fixed small:top-[18px] small:bottom-[18px] small:left-[18px] small:right-[18px] small:h-auto small:w-auto small:z-0">
            <HomeMediaCycle
              items={items}
              collectionHref={`/collections/${latestCollection.handle}`}
            />
          </div>
        </Spot>
      )}

      <Spot
        id={3}
        className="hidden small:flex fixed top-[var(--nj-band-top)] left-0 h-[var(--nj-band-h)] w-[var(--nj-col1)] small:left-[18px] small:w-[calc(var(--nj-col1)-18px)] z-20 pointer-events-none"
      >
        <h1
          data-home-intro="title"
          className="nj-band-title"
        >
          {latestCollection.title}
        </h1>
      </Spot>

      <Spot id={5} className="flex flex-col justify-end" />

      {/* Mobile only: below the 75vh media */}
      <div className="small:hidden absolute inset-x-0 top-[calc(var(--nj-vh)*0.8333)] bottom-0 p-2 flex flex-col justify-between z-10">
        <LocalizedClientLink
          href={`/collections/${latestCollection.handle}`}
          className="self-start text-[12px] tracking-wide uppercase hover:italic"
        >
          view the collection
        </LocalizedClientLink>
        <h2 className="w-full text-right text-[84px] leading-none uppercase font-light">
          {latestCollection.title}
        </h2>
      </div>
    </SixSpotGrid>
  )
}
