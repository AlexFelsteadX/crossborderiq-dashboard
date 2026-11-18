import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PeoplePreviewClient } from "./client"

export const metadata: Metadata = {
  title: "People Intelligence: Vendor View (preview)",
  robots: { index: false, follow: false },
}

const STAFF_DOMAIN = "@gemevents.co"

export default async function PeoplePreviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email?.toLowerCase().endsWith(STAFF_DOMAIN)) notFound()

  return <PeoplePreviewClient />
}
