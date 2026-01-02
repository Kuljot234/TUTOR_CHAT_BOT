"use client"

import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[
          [
            rehypeKatex,
            {
              throwOnError: false,
              strict: false,
            },
          ],
        ]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "")

            if (!inline && match) {
              return (
                <div className="relative my-4 rounded-lg bg-zinc-950 p-4 font-mono text-sm text-zinc-50 overflow-x-auto border border-zinc-800">
                  <div className="absolute right-4 top-2 text-[10px] uppercase text-zinc-500 font-sans tracking-widest">
                    {match[1]}
                  </div>
                  <code>{String(children).replace(/\n$/, "")}</code>
                </div>
              )
            }

            return (
              <code
                className={cn("rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-medium", className)}
                {...props}
              >
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
