import { deleteLineItem } from "@lib/data/cart"
import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
}: {
  id: string
  children?: React.ReactNode
  className?: string
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    await deleteLineItem(id).catch((err) => {
      setIsDeleting(false)
    })
  }

  return (
    <div
      className={clx(
        "flex items-center justify-between font-thin text-[11px]",
        className
      )}
    >
      <button
        className="flex gap-x-1 opcity-75 cursor-pointer uppercase hover:italic"
        onClick={() => handleDelete(id)}
      >
        <span>{children}</span>
      </button>
    </div>
  )
}

export default DeleteButton
