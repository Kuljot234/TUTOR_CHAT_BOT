import { GoogleGenerativeAI } from "@google/generative-ai"
import type { NextRequest } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

const TUTOR_MODE_PROMPTS = {
  explain: `Patient, clear teaching. Step-by-step breakdowns with examples. Simple first, then add complexity.`,
  socratic: `Guide through questions. Never give direct answers. One question at a time.`,
  revision: `Review and consolidate. Create summaries, find patterns, test understanding.`,
  "exam-focused": `Concise, structured answers. Key terms, pitfalls, techniques. Direct and efficient.`,
}

type ContentPart = { text: string } | { inlineData: { mimeType: string; data: string } }

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type")
    let message: string
    let tutorMode: string
    let sessionSummary: string
    let subject: string
    let level: string
    const files: File[] = []
    let audio: File | null = null

    if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData()
      message = formData.get("message") as string
      tutorMode = formData.get("tutorMode") as string
      sessionSummary = formData.get("sessionSummary") as string
      subject = formData.get("subject") as string
      level = formData.get("level") as string

      // Extract files
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("file_") && value instanceof File) {
          files.push(value)
        } else if (key === "audio" && value instanceof File) {
          audio = value
        }
      }
    } else {
      const body = await req.json()
      message = body.message
      tutorMode = body.tutorMode
      sessionSummary = body.sessionSummary
      subject = body.subject
      level = body.level
    }

    const modelName = "models/gemini-2.5-flash"
    const model = genAI.getGenerativeModel({ model: modelName })

    const systemPrompt = `${TUTOR_MODE_PROMPTS[tutorMode as keyof typeof TUTOR_MODE_PROMPTS]}

Context:
Subject: ${subject || "Not specified"}
Level: ${level || "Not specified"}${sessionSummary ? `\nSession: ${sessionSummary}` : ""}

Focus on ONE concept. Use concrete examples. Normalize confusion. Ask before deeper dives. Markdown formatting. LaTeX for math.${files.length > 0 ? " Reference attached files." : ""}${audio ? " Process audio input." : ""}

Q: ${message}

A:`

    const parts: ContentPart[] = [{ text: systemPrompt }]

    if (files.length > 0) {
      for (const file of files) {
        if (file.type.startsWith("image/")) {
          const arrayBuffer = await file.arrayBuffer()
          const base64 = Buffer.from(arrayBuffer).toString("base64")
          parts.push({
            inlineData: {
              mimeType: file.type,
              data: base64,
            },
          })
        }
      }
    }

    if (audio) {
      const firstPart = parts[0]
      if ("text" in firstPart) {
        firstPart.text += "\n\n[Note: Student sent an audio message - please acknowledge this]"
      }
    }

    const result = await model.generateContentStream(parts)

    // Create a readable stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          console.error("Streaming error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Gemini API error:", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate response" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
