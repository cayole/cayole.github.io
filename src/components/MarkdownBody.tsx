import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { safeImageUrl } from '../lib/urls'

interface MarkdownBodyProps {
  content: string
}

export function MarkdownBody({ content }: MarkdownBodyProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        urlTransform={(url, key) => {
          if (key === 'src') return safeImageUrl(url) ?? ''
          return defaultUrlTransform(url)
        }}
        components={{
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
          img: ({ alt, ...props }) => (
            <span className="markdown-image">
              <img {...props} alt={alt ?? ''} loading="lazy" />
              {alt && <span className="image-caption">{alt}</span>}
            </span>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
