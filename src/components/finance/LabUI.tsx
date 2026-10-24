import { useEffect, useId, useState } from 'react'
import type { ReactNode } from 'react'
import '../GoodsMarketDemo.css'
import './finance.css'

export const number = (value: number) => value.toFixed(2)

export function Lab({ name, title, intro, children }: { name: string; title: string; intro: string; children: ReactNode }) {
  const id = useId()
  return <section className={`goods-demo finance-lab ${name}`} aria-labelledby={id}>
    <header className="goods-demo-header"><span>RIVERBEND / 河湾镇实验室</span><h3 id={id}>{title}</h3><p>{intro}</p></header>
    {children}
  </section>
}

export function Slider({ label, value, min, max, step = 1, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (value: number) => void
}) {
  const id = useId()
  return <label className="finance-slider" htmlFor={id}>
    <span>{label}<strong>{Number(value.toFixed(2))}{unit}</strong></span>
    <input id={id} type="range" value={value} min={min} max={max} step={step} onChange={event => onChange(Number(event.target.value))} />
  </label>
}

export function Metrics({ values }: { values: [string, string][] }) {
  return <dl className="goods-demo-results">{values.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
}

export function useFrames() {
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    if (frame >= 12) { setPlaying(false); return }
    const timer = window.setTimeout(() => setFrame(value => value + 1), 650)
    return () => window.clearTimeout(timer)
  }, [frame, playing])
  return { frame, playing, fraction: frame / 12, reset: () => { setPlaying(false); setFrame(0) },
    next: () => setFrame(value => Math.min(12, value + 1)),
    finish: () => { setPlaying(false); setFrame(12) },
    toggle: () => { if (frame >= 12) setFrame(0); setPlaying(value => !value) } }
}

export function Playback({ frames }: { frames: ReturnType<typeof useFrames> }) {
  return <><div className="goods-demo-actions">
    <button type="button" onClick={frames.toggle}>{frames.playing ? '暂停动画' : frames.frame === 12 ? '重新播放' : '播放动画'}</button>
    <button type="button" onClick={frames.next} disabled={frames.playing || frames.frame === 12}>下一帧</button>
    <button type="button" onClick={frames.finish}>查看结果</button>
    <button type="button" onClick={frames.reset}>回到起点</button>
  </div><p role="status">{frames.frame === 12 ? '演示结束。' : `当前第 ${frames.frame} / 12 帧。`}分帧仅用于呈现变量变化，不代表真实调整所需时间。</p></>
}
