"use client"

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import Link from "next/link"
import { ArrowUp, FileSearch, Lock, MessageSquareText, RotateCcw, X } from "lucide-react"
import { UNLOCK_HREF, UNLOCK_LINE } from "@/components/dashboard/locked-panel"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

const MAX_HISTORY_TURNS = 10
const DAILY_LIMIT = 20
const MEMBERS_ONLY_MESSAGE = "Ask CBIQ is available to vendor members."
const NETWORK_ERROR_MESSAGE = "Couldn’t reach Ask CBIQ. Check your connection and try again."

const LOCKED_INPUT_LINE = "Ask the benchmark anything. Included with 30-day access."

export const VENDOR_STARTER_QUESTIONS = [
  "Where is RFP activity building in Europe?",
  "What share of the market outsources immigration?",
  "How has AI adoption moved since 2025?",
]

export const CORPORATE_STARTER_QUESTIONS = [
  "How does my program compare to my peers?",
  "What share of the market outsources immigration?",
  "How has AI adoption moved since 2025?",
]

interface AskCbiqProps {
  starterQuestions?: string[]
  /** Shown for 401/403 responses. Pass null to display the route's error message verbatim. */
  forbiddenMessage?: string | null
  /** Free-tier preview: drawer opens, but chips are disabled and no request is ever sent. */
  locked?: boolean
  /** Corporate only: footer link and inline chips for requesting a custom analysis. */
  customAnalysis?: boolean
}

const CANT_HELP_PATTERN =
  /outside the dataset|outside the benchmark|not part of this dashboard|sample is too small|not collected|request it as a custom analysis/i
const CUSTOM_REQUEST_SLA_LINE = "Our team will review and come back to you within two working days."
const CUSTOM_REQUEST_SENT_LINE = "Request sent. Our team will come back to you within two working days."
const MAX_CUSTOM_REQUEST_CHARS = 2000
const MAX_CUSTOM_CONTEXT_CHARS = 4000

type CustomRequestDraft = { text: string; context: string | null }
type CustomRequestStatus = "idle" | "sending" | "sent" | "error"

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

export function AskCbiq({
  starterQuestions = VENDOR_STARTER_QUESTIONS,
  forbiddenMessage = MEMBERS_ONLY_MESSAGE,
  locked = false,
  customAnalysis = false,
}: AskCbiqProps = {}) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [requestDraft, setRequestDraft] = useState<CustomRequestDraft | null>(null)
  const [requestStatus, setRequestStatus] = useState<CustomRequestStatus>("idle")
  const [requestError, setRequestError] = useState<string | null>(null)
  const threadEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const showCustomAnalysis = customAnalysis && !locked

  const openCustomRequest = (text: string, context: string | null) => {
    setRequestDraft({ text: text.slice(0, MAX_CUSTOM_REQUEST_CHARS), context })
    setRequestStatus("idle")
    setRequestError(null)
  }

  const openFromFooter = () => {
    const lastQuestion = [...messages].reverse().find((m) => m.role === "user")
    openCustomRequest(lastQuestion?.content ?? "", null)
  }

  const openFromAnswer = (assistantId: string) => {
    const index = messages.findIndex((m) => m.id === assistantId)
    const question = messages[index - 1]
    const answer = messages[index]
    if (index < 1 || question?.role !== "user" || !answer) return
    const context = `Question: ${question.content}\n\nAnswer: ${answer.content}`.slice(0, MAX_CUSTOM_CONTEXT_CHARS)
    openCustomRequest(question.content, context)
  }

  const submitCustomRequest = async () => {
    if (!requestDraft || !requestDraft.text.trim() || requestStatus === "sending") return
    setRequestStatus("sending")
    setRequestError(null)
    try {
      const res = await fetch("/api/custom-data-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_text: requestDraft.text.trim(),
          ...(requestDraft.context ? { chat_context: requestDraft.context } : {}),
        }),
      })
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (!res.ok || !body?.ok) {
        setRequestError(body?.error ?? "Something went wrong sending your request. Please try again.")
        setRequestStatus("error")
        return
      }
      setRequestStatus("sent")
    } catch {
      setRequestError(NETWORK_ERROR_MESSAGE)
      setRequestStatus("error")
    }
  }

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
      if (locked || !question || streaming) return

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
          const body = (await res.json().catch(() => null)) as { error?: string } | null
          if (body?.error) message = body.error
          if ((res.status === 401 || res.status === 403) && forbiddenMessage) message = forbiddenMessage
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
    [locked, streaming, forbiddenMessage, updateMessage],
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

  const canSend = !locked && input.trim().length > 0 && !streaming && remaining !== 0

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
                  {starterQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void send(q, messages)}
                      disabled={locked || streaming || remaining === 0}
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
                        {showCustomAnalysis && m.status === "done" && CANT_HELP_PATTERN.test(m.content) && (
                          <button
                            type="button"
                            onClick={() => openFromAnswer(m.id)}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:border-primary/60 hover:bg-primary/20"
                          >
                            <FileSearch className="h-3.5 w-3.5" aria-hidden="true" />
                            Request this as a custom analysis
                          </button>
                        )}
                      </div>
                    </li>
                  ),
                )}
              </ul>
            )}
            <div ref={threadEndRef} />
          </div>

          {locked ? (
            <div className="border-t border-slate-700/60 p-4">
              <div className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-brand-navy-3/60 px-4 py-3 text-sm text-slate-400">
                <Lock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {LOCKED_INPUT_LINE}
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-relaxed text-slate-400 text-pretty">{UNLOCK_LINE}</p>
                <Link
                  href={UNLOCK_HREF}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-primary/90"
                >
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  Unlock full access
                </Link>
              </div>
            </div>
          ) : (
          <>
          {showCustomAnalysis && requestDraft && (
            <div className="border-t border-slate-700/60 px-4 pt-4">
              {requestStatus === "sent" ? (
                <div className="flex items-start justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
                  <p className="text-sm text-slate-200" role="status">
                    {CUSTOM_REQUEST_SENT_LINE}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRequestDraft(null)}
                    aria-label="Close"
                    className="shrink-0 text-slate-400 hover:text-slate-200"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <form
                  className="rounded-xl border border-primary/30 bg-brand-navy-3/60 p-3"
                  onSubmit={(e) => {
                    e.preventDefault()
                    void submitCustomRequest()
                  }}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label htmlFor="ask-cbiq-custom-request" className="text-sm font-medium text-slate-100">
                      Request custom analysis
                    </label>
                    <button
                      type="button"
                      onClick={() => setRequestDraft(null)}
                      aria-label="Cancel custom analysis request"
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <textarea
                    id="ask-cbiq-custom-request"
                    value={requestDraft.text}
                    onChange={(e) => setRequestDraft({ ...requestDraft, text: e.target.value })}
                    rows={3}
                    maxLength={MAX_CUSTOM_REQUEST_CHARS}
                    disabled={requestStatus === "sending"}
                    placeholder="Describe the analysis you need…"
                    className="w-full resize-none rounded-lg border border-slate-700/60 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary/50 focus:outline-none disabled:opacity-60"
                  />
                  {requestError && (
                    <p className="mt-2 text-xs text-red-300" role="alert">
                      {requestError}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs leading-relaxed text-slate-400 text-pretty">{CUSTOM_REQUEST_SLA_LINE}</p>
                    <button
                      type="submit"
                      disabled={!requestDraft.text.trim() || requestStatus === "sending"}
                      className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-brand-navy-3 transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                      {requestStatus === "sending" ? "Sending…" : "Send"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
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
            {(showCustomAnalysis || remaining !== null) && (
              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                {showCustomAnalysis ? (
                  <button
                    type="button"
                    onClick={openFromFooter}
                    className="text-left text-slate-400 transition-colors hover:text-primary"
                  >
                    Need something deeper?{" "}
                    <span className="underline underline-offset-2">Request custom analysis.</span>
                  </button>
                ) : (
                  <span />
                )}
                {remaining !== null && (
                  <span className="shrink-0">
                    {remaining} of {DAILY_LIMIT} left today
                  </span>
                )}
              </div>
            )}
          </form>
          </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
