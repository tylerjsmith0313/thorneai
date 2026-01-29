import { createClient } from "@/lib/supabase/server"
import { EmbeddableForm } from "./embeddable-form"
import { notFound } from "next/navigation"

export default async function EmbedFormPage({
  params,
}: {
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params
  const supabase = await createClient()

  // Fetch the form configuration from creative_assets
  const { data: form, error } = await supabase
    .from("creative_assets")
    .select("id, name, metadata, canvas_data")
    .eq("id", formId)
    .eq("type", "form")
    .single()

  if (error || !form) {
    notFound()
  }

  // Extract form config from canvas_data (where FormBuilder saves it)
  const formConfig = form.canvas_data || form.metadata?.formConfig || null

  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: ${formConfig?.fontFamily || 'Inter'}, system-ui, sans-serif; }
        `}</style>
      </head>
      <body>
        <EmbeddableForm formId={formId} config={formConfig} />
      </body>
    </html>
  )
}
