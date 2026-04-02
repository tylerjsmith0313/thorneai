"use client"

/**
 * Thorne Neural Memory Core
 * Simulates a vector-style database for continuous learning.
 */

export interface KnowledgeNode {
  id: string
  category:
    | "preference"
    | "logic"
    | "insight"
    | "technical"
    | "workflow"
    | "academy"
    | "document"
    | "link"
    | "image"
    | "written"
  content: string
  timestamp: string
  heat: number
  metadata?: Record<string, unknown>
}

// Check if we're in the browser
const isBrowser = typeof window !== "undefined"

// In-memory/LocalStorage persistent store
let neuralIndex: KnowledgeNode[] = isBrowser
  ? JSON.parse(localStorage.getItem("thorne_neural_index") || "[]")
  : []

// Add some default "Academy" nodes if the index is empty to simulate completed courses
if (neuralIndex.length === 0 && isBrowser) {
  neuralIndex.push({
    id: "course-1",
    category: "academy",
    content: "Mastering the Flow Engine",
    timestamp: new Date().toISOString(),
    heat: 0.95,
    metadata: { source: "Academy", status: "Completed" },
  })
}

export const neuralMemory = {
  record(
    content: string,
    category: KnowledgeNode["category"] = "insight",
    metadata?: Record<string, unknown>
  ): KnowledgeNode {
    const node: KnowledgeNode = {
      id: `synapse-${Date.now()}`,
      category,
      content,
      timestamp: new Date().toISOString(),
      heat: 1.0,
      metadata,
    }

    neuralIndex.push(node)
    this.persist()
    console.log(`[Thorne Memory]: New node recorded (${category}): ${content}`)
    return node
  },

  search(query: string): KnowledgeNode[] {
    const lowQuery = query.toLowerCase()
    return neuralIndex
      .filter(
        (node) =>
          node.content.toLowerCase().includes(lowQuery) ||
          node.category.toLowerCase().includes(lowQuery)
      )
      .sort((a, b) => b.heat - a.heat)
  },

  getRecentSynapses(limit: number = 5): KnowledgeNode[] {
    return [...neuralIndex].reverse().slice(0, limit)
  },

  getDocumentation(): KnowledgeNode[] {
    const validCategories: KnowledgeNode["category"][] = [
      "workflow",
      "academy",
      "document",
      "link",
      "image",
      "written",
    ]
    return neuralIndex.filter((n) => validCategories.includes(n.category))
  },

  getWorkflows(): KnowledgeNode[] {
    return neuralIndex.filter((n) => n.category === "workflow")
  },

  /**
   * Calculates the current Neural Flow stats based on memory nodes.
   * Simulates real-time learning metrics.
   */
  getFlowMetrics() {
    const docCount = this.getDocumentation().length
    // Base efficiency on documentation density and variety
    const baseEfficiency = 65
    const calculatedEfficiency = Math.min(baseEfficiency + docCount * 4, 99)

    return {
      efficiency: calculatedEfficiency,
      leadIngestion: 12 + Math.floor(docCount / 2),
      conversionRate: 64 + docCount * 1.2,
      closeRate: 42 + docCount * 0.8,
      profitability: 124500 + docCount * 3200,
    }
  },

  persist() {
    if (isBrowser) {
      localStorage.setItem("thorne_neural_index", JSON.stringify(neuralIndex))
    }
  },

  clear() {
    neuralIndex = []
    this.persist()
  },
}
