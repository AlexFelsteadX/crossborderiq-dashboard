import Link from "next/link"
import type { ReactNode } from "react"

/**
 * Lightweight, dependency-free markdown renderer for CBIQ legal pages.
 * Supports the subset used in the policy documents: H1/H2 headings,
 * paragraphs, bold (**...**), bullet lists with one level of nesting,
 * and autolinked email addresses. This is a server component (no hooks),
 * so the pages that use it can export `metadata` and stay indexable.
 */

type ListItem = { text: string; children: string[] }

// Render inline formatting: **bold** and email autolinks.
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  // Split on bold markers first, keeping the segments.
  const segments = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)

  segments.forEach((segment, segIdx) => {
    const key = `${keyPrefix}-s${segIdx}`
    if (segment.startsWith("**") && segment.endsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-slate-100">
          {linkifyEmails(segment.slice(2, -2), key)}
        </strong>,
      )
    } else {
      nodes.push(<span key={key}>{linkifyEmails(segment, key)}</span>)
    }
  })

  return nodes
}

// Turn any email address in a string into a mailto link.
function linkifyEmails(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/([\w.+-]+@[\w.-]+\.\w+)/g).filter(Boolean)
  return parts.map((part, idx) => {
    if (/^[\w.+-]+@[\w.-]+\.\w+$/.test(part)) {
      return (
        <a
          key={`${keyPrefix}-m${idx}`}
          href={`mailto:${part}`}
          className="text-primary hover:underline"
        >
          {part}
        </a>
      )
    }
    return <span key={`${keyPrefix}-t${idx}`}>{part}</span>
  })
}

export function LegalContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n")
  const blocks: ReactNode[] = []
  let i = 0
  let key = 0

  const isListLine = (line: string) => /^\s*[-•]\s+/.test(line)

  while (i < lines.length) {
    const raw = lines[i]
    const line = raw.trimEnd()

    // Skip blank lines
    if (line.trim() === "") {
      i++
      continue
    }

    // Skip the internal note blockquote entirely (defensive — also excluded at source)
    if (line.trimStart().startsWith(">")) {
      i++
      continue
    }

    // Headings
    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={key++} className="text-xl font-semibold text-slate-100 mt-10 mb-3 scroll-mt-24">
          {renderInline(line.slice(3), `h2-${key}`)}
        </h2>,
      )
      i++
      continue
    }
    if (line.startsWith("# ")) {
      blocks.push(
        <h1 key={key++} className="text-3xl lg:text-4xl font-bold text-slate-100 mb-4 text-balance">
          {renderInline(line.slice(2), `h1-${key}`)}
        </h1>,
      )
      i++
      continue
    }

    // Lists (with one level of nesting via indentation)
    if (isListLine(line)) {
      const items: ListItem[] = []
      while (i < lines.length && (isListLine(lines[i]) || lines[i].trim() === "")) {
        // stop a trailing blank line from being swallowed if the list has ended
        if (lines[i].trim() === "") {
          // peek: if next non-blank isn't a list line, end the list
          let j = i + 1
          while (j < lines.length && lines[j].trim() === "") j++
          if (j >= lines.length || !isListLine(lines[j])) break
          i++
          continue
        }
        const current = lines[i]
        const indent = current.length - current.trimStart().length
        const value = current.trimStart().replace(/^[-•]\s+/, "")
        if (indent >= 2 && items.length > 0) {
          items[items.length - 1].children.push(value)
        } else {
          items.push({ text: value, children: [] })
        }
        i++
      }

      blocks.push(
        <ul key={key++} className="list-disc pl-6 my-4 space-y-2 text-slate-300 leading-relaxed marker:text-primary">
          {items.map((item, idx) => (
            <li key={idx}>
              {renderInline(item.text, `li-${key}-${idx}`)}
              {item.children.length > 0 && (
                <ul className="list-[circle] pl-6 mt-2 space-y-2 marker:text-primary/70">
                  {item.children.map((child, cIdx) => (
                    <li key={cIdx}>{renderInline(child, `li-${key}-${idx}-${cIdx}`)}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>,
      )
      continue
    }

    // Paragraph: collect consecutive non-blank, non-special lines.
    // Single newlines within a paragraph render as <br/> (useful for addresses).
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].trimStart().startsWith(">") &&
      !isListLine(lines[i])
    ) {
      paraLines.push(lines[i].trim())
      i++
    }

    // Only the standalone meta line (e.g. "**Last updated: 8 June 2026**") gets the
    // small muted styling. Match the start of the line so body sentences that merely
    // mention the "Last updated" date keep normal paragraph styling.
    const isLastUpdated = paraLines.length === 1 && /^(\*\*)?last updated/i.test(paraLines[0].trim())

    blocks.push(
      <p
        key={key++}
        className={
          isLastUpdated
            ? "text-sm text-slate-400 mb-8"
            : "text-base text-slate-300 leading-relaxed my-4"
        }
      >
        {paraLines.map((pl, plIdx) => (
          <span key={plIdx}>
            {renderInline(pl, `p-${key}-${plIdx}`)}
            {plIdx < paraLines.length - 1 && <br />}
          </span>
        ))}
      </p>,
    )
  }

  return <div>{blocks}</div>
}

// Re-export Link in case future legal pages need internal cross-links.
export { Link }
