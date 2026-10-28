"use client"

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { ArrowUp, MessageSquareText, RotateCcw } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

const MAX_HISTORY_TURNS = 10
const DAILY_LIMIT = 20
const MEMBERS_ONLY_MESSAGE = "Ask CBIQ is available to vendor members."
const NETWORK_ERROR_MESSAGE = "Couldn’t reach Ask CBIQ. Check your connection and try again."

const STARTER_QUESTIONS = [
  "Where is RFP activity building in Europe?",
  "What share of the market outsources immigration?",
  "How has AI adoption moved since 2025?",
]

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  status: "streaming" | "done" | "error"
  retryable?: boolean
}

type HistoryTurn = { role: "user" | "assistant"; content: string }

function newId() {
  return Math.random().toString(36).slice(2)
}

function buildHistory(messages: ChatMessage[]): HistoryTurn[] {
  const turns: HistoryTurn[] = []
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    const reply = messages[i + 1]
    if (msg.role === "user" && reply?.role === "assistant" && reply.status === "done" && reply.content.trim()) {
      turns.push({ role: "user", content: msg.content }, { role: "assistant", content: reply.content })
      i++
    }
  }
  return turns.slice(-MAX_HISTORY_TURNS)
}

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 last:mb-0 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 last:mb-0 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
  h1: ({ children }) => <h3 className="mb-2 mt-1 text-base font-semibold text-slate-100">{children}</h3>,
  h2: ({ children }) => <h3 className="mb-2 mt-1 text-base font-semibold text-slate-100">{children}</h3>,
  h3: ({ children }) => <h4 className="mb-2 mt-1 text-sm font-semibold text-slate-100">{children}</h4>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-800/80 px-1 py-0.5 font-mono text-[0.85em] text-slate-200">{children}</code>
  ),
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-left text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-slate-700/60 px-2 py-1.5 font-semibold text-slate-200">{children}</th>,
  td: ({ children }) => <td className="border-b border-slate-800 px-2 py-1.5 tabular-nums">{children}</td>,
}

function BetaTag() {
  return (
    <span className="rounded-full border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wider text-primary">
      Beta
    </span>
  )
}

export function AskCbiq() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const threadEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: "end" })
  }, [messages])

  useEffect(() => () => abortRef.current?.abort(), [])

  const updateMessage = useCallback((id: string, patch: Partial<ChatMessage> | ((m: ChatMessage) => Partial<ChatMessage>)) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...(typeof patch === "function" ? patch(m) : patch) } : m)),
    )
  }, [])

  const send = useCallback(
    async (rawQuestion: string, priorMessages: ChatMessage[]) => {
      const question = rawQuestion.trim()
      if (!question || streaming) return

      const userMsg: ChatMessage = { id: newId(), role: "user", content: question, status: "done" }
      const assistantMsg: ChatMessage = { id: newId(), role: "assistant", content: "", status: "streaming" }
      const history = buildHistory(priorMessages)
      setMessages([...priorMessages, userMsg, assistantMsg])
      setInput("")
      setStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch("/api/ask-cbiq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, history }),
          signal: controller.signal,
        })

        const remainingHeader = res.headers.get("X-Chat-Remaining")
        if (remainingHeader !== null && Number.isFinite(Number(remainingHeader))) {
          setRemaining(Number(remainingHeader))
        }

        if (!res.ok) {
          let message = "Something went wrong. Please try again."
          if (res.status === 401 || res.status === 403) {
            message = MEMBERS_ONLY_MESSAGE
          } else {
            const body = (await res.json().catch(() => null)) as { error?: string } | null
            if (body?.error) message = body.error
          }
          updateMessage(assistantMsg.id, { content: message, status: "error", retryable: res.status >= 500 })
          return
        }

        if (!res.body) throw new Error("Empty response")
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          if (chunk) updateMessage(assistantMsg.id, (m) => ({ content: m.content + chunk }))
        }
        updateMessage(assistantMsg.id, { status: "done" })
      } catch (err) {
        if (controller.signal.aborted) return
        updateMessage(assistantMsg.id, { content: NETWORK_ERROR_MESSAGE, status: "error", retryable: true })
      } finally {
        if (abortRef.current === controller) abortRef.current = null
        setStreaming(false)
      }
    },
    [streaming, updateMessage],
  )

  const retry = (assistantId: string) => {
    const index = messages.findIndex((m) => m.id === assistantId)
    const question = messages[index - 1]
    if (index < 1 || question?.role !== "user") return
    void send(question.content, messages.slice(0, index - 1))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey) return
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    e.preventDefault()
    void send(input, messages)
  }

  const canSend = input.trim().length > 0 && !streaming && remaining !== 0

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/60"
      >
        <MessageSquareText className="h-4 w-4" aria-hidden="true" />
        Ask CBIQ
        <BetaTag />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-0 text-slate-300 sm:max-w-lg"
        >
          <SheetHeader className="border-b border-slate-700/60 p-5 pr-12">
            <SheetTitle className="flex items-center gap-2 text-lg font-semibold text-slate-100">
              Ask CBIQ
              <BetaTag />
            </SheetTitle>
            <SheetDescription className="text-sm text-slate-400">
              Answers are computed from the live benchmark. Every figure states its base.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5" aria-live="polite">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col justify-end gap-3">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Try asking</p>
                <div className="flex flex-col items-start gap-2">
                  {STARTER_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void send(q, messages)}
                      disabled={streaming || remaining === 0}
                      className="rounded-full border border-primary/30 bg-brand-navy-3/60 px-3 py-1.5 text-left text-sm text-slate-200 transition-colors hover:border-primary/60 hover:bg-primary/10 disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {messages.map((m) =>
                  m.role === "user" ? (
                    <li key={m.id} className="flex justify-end">
                      <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary/15 px-4 py-2.5 text-sm text-slate-100">
                        {m.content}
                      </div>
                    </li>
                  ) : (
                    <li key={m.id} className="flex justify-start">
                      <div
                        className={`max-w-[92%] rounded-2xl rounded-bl-sm border px-4 py-3 text-sm ${
                          m.status === "error"
                            ? "border-red-500/30 bg-red-500/10 text-red-200"
                            : "border-slate-700/60 bg-brand-navy-3/60 text-slate-300"
                        }`}
                      >
                        {m.status === "streaming" && !m.content ? (
                          <span className="inline-flex gap-1 py-1" aria-label="Ask CBIQ is thinking">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/70" />
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/70 [animation-delay:150ms]" />
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/70 [animation-delay:300ms]" />
                          </span>
                        ) : m.status === "error" ? (
                          <div className="flex flex-col items-start gap-2">
                            <p>{m.content}</p>
                            {m.retryable && (
                              <button
                                type="button"
                                onClick={() => retry(m.id)}
                                disabled={streaming}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-50"
                              >
                                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                                Retry
                              </button>
                            )}
                          </div>
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {m.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    </li>
                  ),
                )}
              </ul>
            )}
            <div ref={threadEndRef} />
          </div>

          <form
            className="border-t border-slate-700/60 p-4"
            onSubmit={(e) => {
              e.preventDefault()
              void send(input, messages)
            }}
          >
            <div className="flex items-end gap-2 rounded-xl border border-slate-700/60 bg-brand-navy-3/60 p-2 focus-within:border-primary/50">
              <label htmlFor="ask-cbiq-input" className="sr-only">
                Ask a question about the benchmark
              </label>
              <textarea
                id="ask-cbiq-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                maxLength={1000}
                disabled={streaming}
                placeholder={streaming ? "Answering…" : "Ask about the benchmark…"}
                className="max-h-40 flex-1 resize-none bg-transparent px-2 py-1 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!canSend}
                aria-label="Send question"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-brand-navy-3 transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {remaining !== null && (
              <p className="mt-2 text-right text-xs text-slate-500">
                {remaining} of {DAILY_LIMIT} left today
              </p>
            )}
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
