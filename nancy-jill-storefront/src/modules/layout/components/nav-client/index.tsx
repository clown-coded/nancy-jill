"use client"

import { useState, useEffect } from "react"
import { useParams, usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MenuDropdown from "@modules/layout/components/menu-dropdown"
import { CartPanelProvider } from "./cart-context"
import { HttpTypes } from "@medusajs/types"

export default function NavClient({
  children,
  regions,
}: {
  children: React.ReactNode
  regions: HttpTypes.StoreRegion[] | null
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const handleMenuOpen = (open: boolean) => {
    setMenuOpen(open)
    if (open) setCartOpen(false)
  }

  const handleCartOpen = (open: boolean) => {
    setCartOpen(open)
    if (open) setMenuOpen(false)
  }

  const panelOpen = menuOpen || cartOpen
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { countryCode } = useParams()
  const isHome = pathname === `/${countryCode}` || pathname === "/"
  const isProduct = pathname.includes("/products/")
  const overlay = (isHome || isProduct) && !scrolled

  // Lets fixed guide lines / labels outside the nav go white while overlaid (mobile only, see globals.css)
  useEffect(() => {
    document.documentElement.classList.toggle("nj-overlay", overlay)
    return () => document.documentElement.classList.remove("nj-overlay")
  }, [overlay])

  // Desktop home sits on full-bleed media: guides, nav and band labels go white
  // (see globals.css). Held back until the imagery fades in at 1000ms so the
  // guides draw themselves in blue first.
  useEffect(() => {
    if (!isHome) {
      document.documentElement.classList.remove("nj-home")
      return
    }
    const timeout = setTimeout(
      () => document.documentElement.classList.add("nj-home"),
      1000
    )
    return () => {
      clearTimeout(timeout)
      document.documentElement.classList.remove("nj-home")
    }
  }, [isHome])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = panelOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [panelOpen])

  return (
    <nav
      className={`flex flex-row items-center justify-between small:flex-col small:items-stretch w-full p-2 pt-[calc(8px+var(--nj-safe-top))] small:pt-[18px] small:pl-[18px] transition-colors duration-300 small:bg-transparent ${isHome ? "small:text-nj-bg" : "small:text-nj-main"} ${
        overlay ? "bg-transparent text-nj-bg" : "bg-nj-bg text-nj-main"
      }`}
    >
      <div className="w-1/2 small:w-full relative z-20">
        <LocalizedClientLink
          href="/"
          className={`block -translate-x-px -translate-y-px transition-colors duration-300 ${
            panelOpen ? "text-nj-bg" : ""
          }`}
          data-testid="nav-store-link"
        >
          <svg width="100%" height="100%" viewBox="0 0 331 62" xmlns="http://www.w3.org/2000/svg" fill="currentColor" style={{fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2}}>
            <g transform="matrix(1,0,0,1,-0.000399,0.001331)">
              <g transform="matrix(4.166667,0,0,4.166667,0,0)">
                <g transform="matrix(1,0,0,1,48.5235,10.7338)"><path d="M0,-3.047C0.511,-4.272 0.999,-5.325 1.387,-6.414C1.595,-6.998 1.91,-7.171 2.5,-7.14C3.354,-7.094 4.214,-7.128 5.16,-7.128C5.101,-6.827 5.091,-6.641 5.028,-6.474C4.091,-4.017 3.152,-1.56 2.199,0.891C2.035,1.313 1.809,1.712 1.604,2.117C0.957,3.396 -0.124,4.004 -1.529,4.067C-2.297,4.102 -3.069,4.069 -3.838,4.102C-4.322,4.124 -4.492,3.908 -4.463,3.465C-4.459,3.417 -4.464,3.369 -4.463,3.321C-4.445,2.724 -4.644,1.954 -4.344,1.585C-4.084,1.266 -3.258,1.393 -2.681,1.344C-2.025,1.286 -1.871,1.023 -2.179,0.378C-3.208,-1.782 -4.251,-3.936 -5.28,-6.096C-5.416,-6.381 -5.493,-6.694 -5.641,-7.122C-4.342,-7.122 -3.193,-7.144 -2.046,-7.099C-1.869,-7.092 -1.636,-6.811 -1.543,-6.606C-1.129,-5.691 -0.758,-4.757 -0.368,-3.831C-0.28,-3.621 -0.175,-3.418 0,-3.047"/></g>
              </g>
              <g transform="matrix(4.166667,0,0,4.166667,0,0)">
                <g transform="matrix(1,0,0,1,16.6935,7.3453)"><path d="M0,0.778C-0.374,0.857 -0.697,0.925 -1.02,0.995C-1.345,1.064 -1.703,1.071 -1.982,1.222C-2.19,1.337 -2.426,1.647 -2.409,1.85C-2.394,2.034 -2.077,2.288 -1.851,2.343C-0.743,2.617 0.011,1.992 0,0.778M0.091,3.31C-1.281,4.537 -3.77,4.808 -5.319,3.966C-6.149,3.514 -6.36,2.776 -6.319,1.904C-6.282,1.088 -5.864,0.484 -5.11,0.301C-3.833,-0.007 -2.522,-0.173 -1.226,-0.404C-0.943,-0.454 -0.645,-0.48 -0.388,-0.594C-0.218,-0.669 0.017,-0.901 -0.002,-1.029C-0.031,-1.219 -0.223,-1.455 -0.407,-1.539C-1.143,-1.877 -2.302,-1.648 -2.776,-0.991C-3.136,-0.493 -3.465,-0.515 -3.934,-0.732C-4.412,-0.953 -4.899,-1.163 -5.4,-1.326C-5.981,-1.513 -5.961,-1.837 -5.663,-2.238C-5.02,-3.104 -4.073,-3.449 -3.066,-3.64C-1.545,-3.928 -0.013,-4.03 1.504,-3.617C3.183,-3.16 3.893,-2.224 3.904,-0.504C3.908,0.26 3.875,1.028 3.924,1.79C3.938,2.016 4.228,2.214 4.289,2.45C4.416,2.943 4.522,3.454 4.524,3.957C4.524,4.072 4.07,4.275 3.817,4.289C3.026,4.332 2.231,4.303 1.437,4.303C0.782,4.302 0.249,4.122 0.091,3.31"/></g>
              </g>
              <g transform="matrix(4.166667,0,0,4.166667,0,0)">
                <g transform="matrix(1,0,0,1,4.0831,10.406)"><path d="M0,-6.019C0.954,-6.996 2.965,-7.29 4.374,-6.56C5.128,-6.169 5.531,-5.515 5.555,-4.714C5.61,-2.899 5.601,-1.082 5.572,0.735C5.57,0.907 5.258,1.21 5.076,1.219C4.19,1.271 3.298,1.224 2.41,1.252C1.932,1.266 1.771,1.073 1.779,0.62C1.796,-0.336 1.791,-1.292 1.779,-2.248C1.774,-2.606 1.746,-2.965 1.692,-3.319C1.619,-3.809 1.321,-4.069 0.811,-4.091C0.264,-4.114 -0.085,-3.848 -0.156,-3.335C-0.23,-2.793 -0.216,-2.24 -0.223,-1.69C-0.232,-0.925 -0.236,-0.161 -0.222,0.604C-0.213,1.049 -0.369,1.263 -0.85,1.251C-1.738,1.227 -2.628,1.235 -3.518,1.248C-3.913,1.252 -4.084,1.092 -4.083,0.696C-4.077,-1.623 -4.091,-3.941 -4.06,-6.259C-4.057,-6.441 -3.768,-6.764 -3.599,-6.773C-2.64,-6.824 -1.673,-6.848 -0.719,-6.764C-0.47,-6.742 -0.259,-6.301 0,-6.019"/></g>
              </g>
              <g transform="matrix(4.166667,0,0,4.166667,0,0)">
                <g transform="matrix(1,0,0,1,26.0045,10.08)"><path d="M0,-5.36C1.265,-6.689 3.474,-6.973 4.819,-6.162C5.491,-5.756 5.849,-5.126 5.869,-4.38C5.917,-2.564 5.894,-0.747 5.909,1.07C5.913,1.502 5.671,1.578 5.308,1.574C4.443,1.562 3.577,1.549 2.712,1.577C2.225,1.593 2.091,1.38 2.089,0.938C2.084,-0.329 2.065,-1.594 2.021,-2.86C2.002,-3.408 1.705,-3.748 1.114,-3.763C0.486,-3.78 0.14,-3.461 0.115,-2.717C0.076,-1.547 0.069,-0.376 0.096,0.795C0.109,1.381 -0.083,1.613 -0.692,1.58C-1.506,1.537 -2.326,1.553 -3.143,1.576C-3.612,1.589 -3.778,1.402 -3.775,0.942C-3.762,-1.329 -3.759,-3.6 -3.777,-5.871C-3.781,-6.353 -3.589,-6.495 -3.136,-6.48C-2.392,-6.456 -1.646,-6.454 -0.901,-6.48C-0.251,-6.503 0.333,-6.506 0,-5.36"/></g>
              </g>
              <g transform="matrix(4.166667,0,0,4.166667,0,0)">
                <g transform="matrix(1,0,0,1,42.3702,8.4384)"><path d="M0,-1.571C-1.12,-1.467 -2.193,-1.344 -3.27,-1.293C-3.453,-1.283 -3.753,-1.542 -3.822,-1.739C-4.028,-2.332 -4.361,-2.724 -5.02,-2.646C-5.652,-2.57 -5.896,-2.102 -5.916,-1.522C-5.933,-1.022 -5.926,-0.52 -5.89,-0.021C-5.852,0.501 -5.527,0.814 -5.017,0.877C-4.493,0.943 -4.02,0.759 -3.863,0.234C-3.739,-0.185 -3.539,-0.281 -3.143,-0.248C-2.256,-0.174 -1.368,-0.123 -0.479,-0.084C-0.055,-0.064 0.06,0.118 -0.027,0.518C-0.321,1.863 -1.247,2.608 -2.482,2.991C-4.107,3.492 -5.756,3.492 -7.376,2.945C-8.99,2.399 -9.734,1.357 -9.77,-0.326C-9.772,-0.469 -9.762,-0.614 -9.772,-0.757C-9.991,-3.775 -8.295,-4.611 -6.245,-4.873C-4.751,-5.063 -3.268,-5.043 -1.854,-4.425C-0.616,-3.884 0.097,-2.816 0,-1.571"/></g>
              </g>
              <g transform="matrix(4.166667,0,0,4.166667,0,0)">
                <g transform="matrix(1,0,0,1,64.0792,10.0955)"><path d="M0,-1.815C-0.001,-0.667 0.021,0.482 -0.006,1.63C-0.053,3.677 -1.106,4.706 -3.147,4.733C-3.797,4.741 -4.447,4.719 -5.096,4.739C-5.49,4.751 -5.669,4.613 -5.658,4.206C-5.641,3.608 -5.637,3.009 -5.66,2.412C-5.676,1.975 -5.499,1.841 -5.067,1.828C-4.133,1.796 -4.027,1.662 -4.002,0.701C-3.954,-1.236 -3.913,-3.173 -3.858,-5.11C-3.85,-5.418 -3.85,-5.753 -3.726,-6.021C-3.632,-6.222 -3.355,-6.452 -3.146,-6.467C-2.404,-6.522 -1.652,-6.441 -0.911,-6.502C-0.146,-6.566 -0.01,-6.121 -0.003,-5.547C0.011,-4.303 0.001,-3.059 0,-1.815"/></g>
              </g>
              <g transform="matrix(4.166667,0,0,4.166667,0,0)">
                <g transform="matrix(1,0,0,1,74.3087,5.811)"><path d="M0,0.031C0,1.705 -0.015,3.379 0.008,5.052C0.017,5.638 -0.198,5.873 -0.795,5.847C-1.586,5.813 -2.381,5.827 -3.174,5.843C-3.665,5.852 -3.861,5.647 -3.86,5.158C-3.851,1.739 -3.849,-1.679 -3.862,-5.098C-3.864,-5.626 -3.665,-5.824 -3.138,-5.805C-2.37,-5.777 -1.598,-5.766 -0.832,-5.808C-0.205,-5.842 0.022,-5.618 0.011,-4.989C-0.02,-3.316 0,-1.642 0,0.031"/></g>
              </g>
              <g transform="matrix(4.166667,0,0,4.166667,0,0)">
                <g transform="matrix(1,0,0,1,79.3614,5.818)"><path d="M0,0.028C0,1.701 -0.016,3.375 0.008,5.048C0.017,5.638 -0.205,5.865 -0.798,5.84C-1.59,5.806 -2.384,5.819 -3.177,5.836C-3.67,5.846 -3.861,5.634 -3.86,5.147C-3.851,1.729 -3.848,-1.69 -3.862,-5.108C-3.864,-5.64 -3.658,-5.829 -3.134,-5.812C-2.342,-5.784 -1.547,-5.779 -0.756,-5.813C-0.19,-5.837 0.014,-5.618 0.007,-5.065C-0.013,-3.368 0,-1.67 0,0.028"/></g>
              </g>
              <g transform="matrix(4.166667,0,0,4.166667,0,0)">
                <g transform="matrix(1,0,0,1,69.256,7.4246)"><path d="M0,0.354C0,1.405 -0.022,2.456 0.009,3.504C0.025,4.071 -0.189,4.261 -0.75,4.235C-1.564,4.197 -2.382,4.211 -3.198,4.231C-3.64,4.242 -3.864,4.112 -3.861,3.627C-3.847,1.456 -3.859,-0.716 -3.851,-2.888C-3.848,-3.528 -3.609,-3.907 -2.854,-3.832C-2.212,-3.767 -1.555,-3.769 -0.913,-3.832C-0.194,-3.901 -0.036,-3.473 -0.012,-2.939C0.022,-2.153 -0.001,-1.364 0,-0.577L0,0.354"/></g>
              </g>
              <g transform="matrix(4.166667,0,0,4.166667,0,0)">
                <g transform="matrix(1,0,0,1,62.2193,2.6699)"><path d="M0,-2.657C1.685,-2.657 1.685,-2.657 1.68,-0.949C1.678,-0.015 1.678,-0.014 0.724,-0.013C0.076,-0.012 -0.572,-0.026 -1.219,-0.01C-1.609,0 -1.811,-0.134 -1.771,-0.544C-1.76,-0.662 -1.771,-0.783 -1.771,-0.902C-1.776,-2.657 -1.776,-2.657 0,-2.657"/></g>
              </g>
              <g transform="matrix(4.166667,0,0,4.166667,0,0)">
                <g transform="matrix(1,0,0,1,67.2706,0.0335)"><path d="M0,2.623C-1.706,2.624 -1.706,2.624 -1.7,0.93C-1.698,-0.019 -1.698,-0.02 -0.759,-0.021C-0.135,-0.022 0.491,0.009 1.113,-0.029C1.631,-0.061 1.792,0.148 1.757,0.634C1.727,1.061 1.723,1.495 1.758,1.922C1.801,2.439 1.635,2.684 1.08,2.63C0.723,2.595 0.36,2.623 0,2.623"/></g>
              </g>
            </g>
          </svg>
        </LocalizedClientLink>
      </div>

      <div className="relative flex flex-row items-baseline gap-x-6 small:flex-col small:leading-[1.15] overflow-hidden">
        {/* Single row: Menu/Close on left, Cart hidden when panel open */}
        <button
          data-intro="menu"
          onClick={() => {
            if (panelOpen) {
              setMenuOpen(false)
              setCartOpen(false)
            } else {
              handleMenuOpen(true)
            }
          }}
          className={`hover:italic hover:opacity-75 transition-all duration-300 text-[14px] small:text-[12px] uppercase text-left relative z-20 order-last small:order-none ${
            panelOpen ? "text-nj-bg" : ""
          }`}
        >
          {panelOpen ? "Close" : "Menu"}
        </button>

        <div data-intro="cart">
          <CartPanelProvider cartOpen={cartOpen} setCartOpen={handleCartOpen} panelOpen={panelOpen} regions={regions}>
            {children}
          </CartPanelProvider>
        </div>

        {/* Menu panel */}
        <MenuDropdown open={menuOpen} onClose={() => setMenuOpen(false)} regions={regions} />
      </div>

      {/* Backdrop blur overlay */}
      <div
        className={`fixed inset-0 -z-10 transition-all duration-300 ${
          panelOpen
            ? " backdrop-blur-[1px] bg-[#dbdfee]/60"
            : "backdrop-blur-none bg-transparent pointer-events-none"
        }`}
        onClick={() => {
          setMenuOpen(false)
          setCartOpen(false)
        }}
      />
    </nav>
  )
}
