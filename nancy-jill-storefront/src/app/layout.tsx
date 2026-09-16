import { getBaseURL } from "@lib/util/env"
import { Metadata, Viewport } from "next"
import "styles/globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className="small:overflow-x-clip" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{sessionStorage.removeItem("nj-guides-intro-done")}catch(e){}
// Stable viewport height: set once, and only re-measure when the WIDTH changes
// (orientation/rotate). iOS toolbar show/hide changes height only, and updating
// on that is what makes sticky sections jump.
;(function(){var w=0;function set(){var vw=innerWidth;if(vw===w)return;w=vw;
document.documentElement.style.setProperty("--nj-vh",innerHeight+"px")}
set();addEventListener("resize",set);addEventListener("orientationchange",function(){setTimeout(function(){w=0;set()},300)})})();
// Firefox has no -webkit-user-drag: kill the drag image at the source
addEventListener("dragstart",function(e){var t=e.target;if(t&&(t.tagName==="IMG"||t.tagName==="VIDEO"))e.preventDefault()});`,
          }}
        />
      </head>
      <body className="min-h-screen text-nj-main small:overflow-x-clip bg-[var(--nj-bg)]">
        <main className="relative small:w-[calc(100vw-18px)] small:overflow-x-clip">{props.children}</main>
        <div style={{ viewTransitionName: "nj-sidebar" }} className="hidden small:flex items-end pb-6 justify-center fixed right-0 top-[18px] bottom-[18px] w-[18px] z-30 text-nj-main nj-fade-in-2">
          <div className="[writing-mode:vertical-rl] leading-none whitespace-nowrap text-[18px]">a working document, all made in nz</div>
        </div>
      </body>
    </html>
  )
}
