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
    <div 
      style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: `${formConfig?.fontFamily || 'Inter'}, system-ui, sans-serif`,
        minHeight: '100%',
      }}
    >
      <EmbeddableForm formId={formId} config={formConfig} />
    </div>
  )
}
