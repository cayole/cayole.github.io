import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import { Children, isValidElement } from 'react'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { safeImageUrl } from '../lib/urls'
import { GoodsMarketDemo } from './GoodsMarketDemo'
import { SpendingQuiz } from './SpendingQuiz'
import { TownDemandDemo } from './TownDemandDemo'
import { BondLab, MoneyMarketLab } from './finance/MoneyLabs'
import { InvestmentLab, ISLMLab } from './finance/PolicyLabs'
import { BankCapitalLab, CreditWedgeLab, RealRateLab } from './finance/RiskLabs'

const financeLabs = {
  'bond-price': BondLab,
  'money-market': MoneyMarketLab,
  'investment-lab': InvestmentLab,
  'is-lm-lab': ISLMLab,
  'real-rate': RealRateLab,
  'bank-capital': BankCapitalLab,
  'credit-wedge': CreditWedgeLab,
}

interface MarkdownBodyProps {
  content: string
}

export function MarkdownBody({ content }: MarkdownBodyProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, [rehypeHighlight, { plainText: ['goods-market', 'spending-quiz', 'town-demand', ...Object.keys(financeLabs)] }]]}
        urlTransform={(url, key) => {
          if (key === 'src') return safeImageUrl(url) ?? ''
          return defaultUrlTransform(url)
        }}
        components={{
          pre: ({ children, node: _node, ...props }) => {
            const child = Children.toArray(children)[0]
            if (isValidElement<{ className?: string }>(child)) {
              const classes = child.props.className?.split(' ') ?? []
              if (classes.includes('language-goods-market')) return <GoodsMarketDemo />
              if (classes.includes('language-spending-quiz')) return <SpendingQuiz />
              if (classes.includes('language-town-demand')) return <TownDemandDemo />
              for (const [language, Component] of Object.entries(financeLabs)) {
                if (classes.includes(`language-${language}`)) return <Component />
              }
            }
            return <pre {...props}>{children}</pre>
          },
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
          img: ({ alt, ...props }) => (
            <span className={typeof props.src === 'string' && props.src.endsWith('.svg')
              ? 'markdown-image markdown-diagram' : 'markdown-image'}>
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
