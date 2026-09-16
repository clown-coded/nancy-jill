import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-webhook-secret")

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const tags: string[] = body.tags ?? []

  if (!tags.length) {
    return NextResponse.json(
      { message: "No tags provided" },
      { status: 400 }
    )
  }

  for (const tag of tags) {
    revalidateTag(tag)
  }

  return NextResponse.json({ revalidated: tags, now: Date.now() })
}
