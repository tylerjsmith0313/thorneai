import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("knowledge_documents")
      .select("id, title, document_type, source_url, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const documents = (data || []).map(doc => ({
      id: doc.id,
      title: doc.title,
      documentType: doc.document_type,
      sourceUrl: doc.source_url,
      status: doc.status,
      createdAt: doc.created_at,
    }))

    return NextResponse.json(documents)
  } catch (error) {
    console.error("[v0] Documents GET error:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, sourceUrl, documentType, category } = await req.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Create the document
    const { data: document, error: docError } = await supabase
      .from("knowledge_documents")
      .insert({
        user_id: user.id,
        title,
        document_type: documentType || "text",
        source_url: sourceUrl,
        category: category || "general",
        status: "processed",
      })
      .select()
      .single()

    if (docError) {
      return NextResponse.json({ error: docError.message }, { status: 500 })
    }

    // Create chunks from the content (simple chunking for now)
    const chunks = chunkContent(content, 1000)
    
    const chunkInserts = chunks.map((chunk, index) => ({
      document_id: document.id,
      content: chunk,
      chunk_index: index,
      token_count: Math.ceil(chunk.length / 4), // Rough estimate
    }))

    const { error: chunkError } = await supabase
      .from("document_chunks")
      .insert(chunkInserts)

    if (chunkError) {
      console.error("[v0] Chunk insert error:", chunkError)
      // Don't fail the request, the document was still created
    }

    return NextResponse.json({ 
      success: true, 
      document: {
        id: document.id,
        title: document.title,
        documentType: document.document_type,
        status: document.status,
      }
    })
  } catch (error) {
    console.error("[v0] Documents POST error:", error)
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 })
  }
}

// Simple content chunking function
function chunkContent(content: string, maxChunkSize: number): string[] {
  const chunks: string[] = []
  const paragraphs = content.split(/\n\n+/)
  let currentChunk = ""

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = paragraph
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks.length > 0 ? chunks : [content]
}
