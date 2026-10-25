import { useId } from 'react'
import './growth.css'

export interface ChartLine { label: string; points: [number,number][]; kind?: 'accent' | 'baseline'; marker?: boolean }
const tick = (v: number) => v >= 10 ? Math.round(v) : Number(v.toFixed(2))

export function GrowthChart({ title, xLabel, yLabel, xMax, yMax, lines, logarithmic = false }: {
  title: string; xLabel: string; yLabel: string; xMax: number; yMax: number; lines: ChartLine[]; logarithmic?: boolean
}) {
  const id = useId(), clipId = useId()
  const x = (v: number) => 80 + v / xMax * 550
  const y = (v: number) => 410 - (logarithmic ? Math.log(v/100)/Math.max(Math.log(yMax/100),.01) : v/yMax)*330
  const yTicks = logarithmic ? [100,Math.sqrt(100*yMax),yMax] : [0,yMax/2,yMax]
  return <>
    <div className="finance-graph-scroll growth-chart" tabIndex={0} role="region" aria-label={title}>
      <svg className="finance-graph" viewBox="0 0 720 510" role="img" aria-labelledby={id}>
        <title id={id}>{title}。{logarithmic?'纵轴采用对数刻度。':'纵轴采用线性刻度。'}</title>
        <defs><clipPath id={clipId}><rect x="77" y="55" width="560" height="360" /></clipPath></defs>
        <path className="axis" d="M80 55V410H650" />
        <text x="80" y="30">{yLabel}</text><text x="650" y="495" textAnchor="end">{xLabel}</text>
        {[0,xMax/2,xMax].map(v=><text key={v} x={x(v)} y="450" textAnchor="middle">{tick(v)}</text>)}
        {yTicks.map(v=><text key={v} x="65" y={y(v)+6} textAnchor="end">{tick(v)}</text>)}
        <g clipPath={`url(#${clipId})`}>{lines.map(line=><g key={line.label}>
          <polyline className={line.kind==='baseline'?'old':line.kind==='accent'?'policy':'curve'} points={line.points.map(p=>`${x(p[0])},${y(p[1])}`).join(' ')} />
          {line.marker&&line.points.length>0&&<circle cx={x(line.points.at(-1)![0])} cy={y(line.points.at(-1)![1])} r="7" fill={line.kind==='accent'?'var(--finance-red)':'var(--ink)'} />}
        </g>)}</g>
      </svg>
    </div>
    <div className="finance-legend">{lines.map(line=><span key={line.label}>{line.points.length===1?'圆点':line.kind==='baseline'?'灰点线':line.kind==='accent'?'橙虚线':'黑实线'}：{line.label}</span>)}</div>
  </>
}
