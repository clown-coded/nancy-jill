"use client"

import { HttpTypes } from "@medusajs/types"
import { useCallback, useEffect, useState } from "react"
import ImageGallery from "."

const padded = (n: number) => String(n).padStart(2, "0")

const ImageGalleryWithCounter = ({ images }: { images: HttpTypes.StoreProductImage[] }) => {
  const [index, setIndex] = useState(0)
  const [total, setTotal] = useState(images.length)
  const [inDescription, setInDescription] = useState(false)
  const [inDetails, setInDetails] = useState(false)
  const [inRelated, setInRelated] = useState(false)

  const handleIndexChange = useCallback((i: number, t: number) => {
    setIndex(i)
    setTotal(t)
  }, [])

  useEffect(() => {
    const el = document.getElementById("product-description-section")
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInDescription(entry.isIntersecting),
      { rootMargin: "0px 0px -50% 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const el = document.getElementById("product-details-section")
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInDetails(entry.isIntersecting),
      { rootMargin: "0px 0px -50% 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const el = document.getElementById("related-products")
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInRelated(entry.isIntersecting),
      { rootMargin: "0px 0px -50% 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const label = inRelated
    ? "[SEE ALSO]"
    : inDetails
    ? "[DETAILS]"
    : inDescription
    ? "[DESCRIPTION]"
    : `[${padded(index + 1)}/${padded(total)}]`

  return (
    <>
      <div className="hidden small:flex fixed top-[var(--nj-band-top)] left-[calc(var(--nj-col1)+24px)] h-[var(--nj-band-h)] z-20 text-[12px] tracking-wide pointer-events-none items-center px-2 whitespace-nowrap">
        {label}
      </div>
      <div className="relative">
        <ImageGallery images={images} onIndexChange={handleIndexChange} />
      </div>
    </>
  )
}

export default ImageGalleryWithCounter
