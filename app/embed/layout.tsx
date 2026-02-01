import { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Embedded Form",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
