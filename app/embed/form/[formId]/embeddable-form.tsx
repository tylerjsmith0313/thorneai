// Embeddable form page - /app/embed/form/[formId]/page.tsx should import this
"use client"

import { useState } from "react"
import type { FormConfig } from "@/components/creative/form-builder"

interface EmbeddableFormProps {
  formId: string
  config: FormConfig | null
}

export function EmbeddableForm({ formId, config }: EmbeddableFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!config) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>
        Form not configured
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/embed/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId,
          data: formData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Submission failed")
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          backgroundColor: config.backgroundColor,
          fontFamily: config.fontFamily,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: config.primaryColor + "20",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke={config.primaryColor}
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
          Success!
        </h3>
        <p style={{ color: "#64748b", fontSize: 14 }}>{config.successMessage}</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: "32px",
        backgroundColor: config.backgroundColor,
        fontFamily: config.fontFamily,
        maxWidth: 500,
        margin: "0 auto",
      }}
    >
      {config.fields.map((field) => (
        <div key={field.id} style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 500,
              color: "#334155",
              marginBottom: 6,
            }}
          >
            {field.label}
            {field.required && <span style={{ color: "#ef4444" }}> *</span>}
          </label>

          {field.type === "text" && (
            <input
              type="text"
              name={field.id}
              placeholder={field.placeholder}
              required={field.required}
              value={formData[field.id] || ""}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                fontSize: 14,
                outline: "none",
              }}
            />
          )}

          {field.type === "email" && (
            <input
              type="email"
              name={field.id}
              placeholder={field.placeholder || "email@example.com"}
              required={field.required}
              value={formData[field.id] || ""}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                fontSize: 14,
                outline: "none",
              }}
            />
          )}

          {field.type === "phone" && (
            <input
              type="tel"
              name={field.id}
              placeholder={field.placeholder || "(555) 555-5555"}
              required={field.required}
              value={formData[field.id] || ""}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                fontSize: 14,
                outline: "none",
              }}
            />
          )}

          {field.type === "textarea" && (
            <textarea
              name={field.id}
              placeholder={field.placeholder}
              required={field.required}
              rows={4}
              value={formData[field.id] || ""}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                fontSize: 14,
                outline: "none",
                resize: "vertical",
              }}
            />
          )}

          {field.type === "select" && (
            <select
              name={field.id}
              required={field.required}
              value={formData[field.id] || ""}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                fontSize: 14,
                outline: "none",
                backgroundColor: "#fff",
              }}
            >
              <option value="">Select an option</option>
              {field.options?.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {field.type === "radio" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {field.options?.map((opt, i) => (
                <label
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#475569" }}
                >
                  <input
                    type="radio"
                    name={field.id}
                    value={opt}
                    required={field.required}
                    checked={formData[field.id] === opt}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}

          {field.type === "checkbox" && (
            <label
              style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#475569" }}
            >
              <input
                type="checkbox"
                name={field.id}
                checked={formData[field.id] === "true"}
                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.checked ? "true" : "" })}
              />
              {field.options?.[0] || "I agree"}
            </label>
          )}
        </div>
      ))}

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 12,
            color: "#dc2626",
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          width: "100%",
          padding: "14px 24px",
          backgroundColor: submitting ? "#94a3b8" : config.primaryColor,
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 600,
          cursor: submitting ? "not-allowed" : "pointer",
        }}
      >
        {submitting ? "Submitting..." : config.submitButtonText}
      </button>
    </form>
  )
}
