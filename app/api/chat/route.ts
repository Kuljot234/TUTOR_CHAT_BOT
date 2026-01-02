import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    let message = "";
    let tutorMode = "explain";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      message = body.message;
      tutorMode = body.tutorMode ?? "explain";
    } else {
      const form = await req.formData();
      message = String(form.get("message") ?? "");
      tutorMode = String(form.get("tutorMode") ?? "explain");
    }

    if (!message) {
      return new Response("Missing message", { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    const prompt = `
You are a helpful AI tutor.
Mode: ${tutorMode}

Student question:
${message}
`;

    const result = await model.generateContentStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (!text) continue;

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }

          controller.enqueue(
            encoder.encode(`data: [DONE]\n\n`)
          );
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ text: "Error generating response." })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("CHAT STREAM ERROR:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
