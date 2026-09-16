import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import Nav from "@modules/layout/templates/nav"
import PageTransition from "@modules/common/components/page-transition"
import { GridGuides } from "@modules/layout/components/six-spot-grid"
import GuideToggle from "@modules/layout/components/guide-toggle"
import CookieBanner from "@modules/layout/components/cookie-banner"
import ScrollDot from "@modules/layout/components/scroll-dot"
import CursorTrail from "@modules/layout/components/cursor-trail"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <CursorTrail />
      <Nav />
      <GridGuides />
      <GuideToggle />
      <ScrollDot />
      <PageTransition>{props.children}</PageTransition>
      <CookieBanner />
    </>
  )
}
