import { useId, useState } from 'react'
import { Lab, Metrics, number, Playback, Slider, useFrames } from '../finance/LabUI'
import { inflationPath, pricePath } from './models'
import './labour.css'

export function ExpectationsLab() {
  const [unemployment, setUnemployment] = useState(4)
  const [memory, setMemory] = useState(1)
  const frames = useFrames(6)
  const id = useId()
  const rows = inflationPath(unemployment,memory)
  const current = rows[frames.frame]
  const low = Math.min(0,...rows.map(r => r.inflation))-1
  const high = Math.max(4,...rows.map(r => r.inflation))+1
  const y = (rate: number) => 400 - (rate-low)/(high-low)*320
  const x = (period: number) => 80 + period * 90
  return <Lab name="expectations-lab" title="同样把失业率压到 4%，价签会走哪条路？" intro="起点通胀 2%、价格指数 100；自然失业率固定为 6%。每一步是一期离散合同更新，不对应实际月数。先选择预期如何形成，再逐步观察。">
    <div className="quiz-choices" role="group" aria-label="预期形成方式">
      <button type="button" aria-pressed={memory===0} onClick={() => { frames.reset(); setMemory(0) }}>锚定：仍预期 2%</button>
      <button type="button" aria-pressed={memory===1} onClick={() => { frames.reset(); setMemory(1) }}>追随：照着上期涨幅</button>
    </div>
    <Slider label="每期失业率 u" min={4} max={8} step={.5} value={unemployment} unit="%" onChange={v => { frames.reset(); setUnemployment(v) }} />
    <Slider label="对上期通胀的权重 θ" min={0} max={1} step={.25} value={memory} onChange={v => { frames.reset(); setMemory(v) }} />
    <Playback frames={frames} />
    <div className="finance-graph-scroll" role="region" aria-label="各期通胀率路径" tabIndex={0}>
      <svg className="finance-graph" viewBox="0 0 720 490" role="img" aria-labelledby={id}>
        <title id={id}>第 {current.period} 期，预期通胀 {number(current.expected)}%，实际通胀 {number(current.inflation)}%，价格指数 {number(current.price)}。</title>
        <path className="axis" d="M80 50V400H660" />
        <path className="grid" d={`M80 ${y(0)}H650`} />
        <path className="old" d={`M80 ${y(2)}H620`} />
        <polyline className="policy" points={rows.slice(0,frames.frame+1).map(r => `${x(r.period)},${y(r.inflation)}`).join(' ')} />
        {rows.slice(0,frames.frame+1).map(r => <circle key={r.period} cx={x(r.period)} cy={y(r.inflation)} r="6" fill="var(--finance-red)" />)}
        <text x="80" y="30">通胀率 / %</text><text x="660" y="480" textAnchor="end">推演期数</text>
        {[0,2,4,6].map(p => <text key={p} x={x(p)} y="440" textAnchor="middle">{p}</text>)}
        {[low,(low+high)/2,high].map(r => <text key={r} x="65" y={y(r)+6} textAnchor="end">{Number(r.toFixed(2))}</text>)}
      </svg>
    </div>
    <Metrics values={[["本期预期通胀",`${number(current.expected)}%`],['本期实际通胀',`${number(current.inflation)}%`],['累计价格指数',number(current.price)],['第 6 期通胀',`${number(rows[6].inflation)}%`]]} />
    <p className="finance-note">πᵉ = (1−θ) × 2% + θ × 上期 π；π = πᵉ − 0.5(u−6%)。率均按百分数代入，失业率差用百分点。{memory===1 ? '若 u<6%，通胀逐期加速；u=6% 只会稳定已有通胀，不会自动回到 2%。' : '锚定预期时，偏低失业率带来高于锚的通胀；这里人为固定锚，不表示它能无限承受反复预测失误。'}</p>
    <p className="goods-demo-note">这是预期机制的比较，不是可长期执行的政策承诺。系数为局部教学校准；供给冲击、预期失锚、指数化和名义工资向下刚性都可能改变关系。回到起点后不会自动播放。</p>
  </Lab>
}

const priceCases = [
  { label: '涨得越来越慢', rates: [6,4,2] },
  { label: '每期稳定涨 2%', rates: [2,2,2] },
  { label: '第三期真的降价', rates: [6,4,-2] },
]
export function PriceLevelLab() {
  const [active, setActive] = useState(0)
  const frames = useFrames(3)
  const data = priceCases[active]
  const prices = pricePath(data.rates)
  return <Lab name="price-level-lab" title="涨幅从 6% 降到 2%，面包变便宜了吗？" intro="同一篮子商品起价 100。三组路径都逐期连乘计算，不把通胀率相加当作价格涨幅。选择路径，再翻动价签。">
    <div className="quiz-choices" role="group" aria-label="价格变化路径">{priceCases.map((item,index) => <button key={item.label} type="button" aria-pressed={active===index} onClick={() => { frames.reset(); setActive(index) }}>{item.label}</button>)}</div>
    <Playback frames={frames} />
    <div className="labour-rate-bars">{prices.slice(0,frames.frame+1).map((price,index) => <div key={index}><span>{index===0?'起点':`第 ${index} 期`}</span><div className="track"><span className="fill" style={{width:`${price/125*100}%`}} /></div><strong>{number(price)}</strong></div>)}</div>
    <Metrics values={[["当前价签",number(prices[frames.frame])],['本期涨幅',frames.frame ? `${number(data.rates[frames.frame-1])}%` : '尚未变化'],['累计涨幅',`${number(prices[frames.frame]-100)}%`]]} />
    <p className="finance-note">{frames.frame===0 ? '先猜：涨价速度降低，是否意味着价签降低？' : data.rates[frames.frame-1] < 0 ? '本期通胀为负，价签相对上期降低；但它仍可能高于最初的 100。' : '只要本期通胀仍为正，价签就在继续上升。通胀放缓不是通货紧缩。'}</p>
    <p className="goods-demo-note">价格指数 Pₜ = Pₜ₋₁(1+πₜ)。例子代表固定商品篮子，不是对某种面包现实价格的预测。</p>
  </Lab>
}
