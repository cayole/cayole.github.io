import { useEffect, useId, useState } from 'react'
import { townConsumption, townEquilibrium } from './goods-market'
import './GoodsMarketDemo.css'

const scenarios = [
  { label: '修路 +40', c0: 100, G: 190, T: 100, story: '政府多买 40 的修路服务。第一笔新增订单直接到企业，接下来再经由收入带动消费。' },
  { label: '补助 +40', c0: 100, G: 150, T: 60, story: '补助使净税收少 40，居民多出 40 的可支配收入，先消费其中的 24。第一轮需求比修路情景少 16。' },
  { label: '大家少花 40', c0: 60, G: 150, T: 100, story: '在相同收入下，全镇消费意愿减少 40。货架先变满，企业再减产；收入下降，又进一步影响消费。' },
  { label: '信心恢复 +20', c0: 120, G: 150, T: 100, story: '在相同收入下，全镇计划多消费 20。订单增加，产出与收入逐步向更高的均衡靠近。' },
]
const baseY = 850
const x = (value: number) => 65 + value * .48
const y = (value: number) => 615 - value * .48
const money = (value: number) => value.toFixed(2)

export function TownDemandDemo() {
  const id = useId()
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [round, setRound] = useState(0)
  const [playing, setPlaying] = useState(false)
  const scenario = scenarios[scenarioIndex]
  const target = townEquilibrium(scenario.c0, scenario.G, scenario.T)
  const current = target + (baseY - target) * .6 ** round
  const intercept = scenario.c0 + 150 + scenario.G - .6 * scenario.T
  const demand = intercept + .6 * current
  const stock = current - demand
  const consumption = townConsumption(current, scenario.c0, scenario.T)

  useEffect(() => {
    if (!playing) return
    if (round >= 12) { setPlaying(false); return }
    const timer = window.setTimeout(() => setRound(value => value + 1), 1000)
    return () => window.clearTimeout(timer)
  }, [round, playing])

  return (
    <section className="goods-demo town-demand" aria-labelledby={`${id}-title`}>
      <header className="goods-demo-header">
        <span>WHAT IF / 小镇情景实验</span>
        <h3 id={`${id}-title`}>换一个决定，小镇会怎样？</h3>
        <p>先选情景。橙点是当前收入下的计划需求；按“调整一轮”，观察它怎样靠近新交点。</p>
      </header>
      <div className="quiz-choices" role="group" aria-label="选择小镇情景">
        {scenarios.map((item, index) => <button type="button" key={item.label}
          aria-pressed={scenarioIndex === index} onClick={() => { setPlaying(false); setRound(0); setScenarioIndex(index) }}>{item.label}</button>)}
      </div>
      <p className="town-story">{scenario.story}</p>
      <div className="town-graph-scroll" tabIndex={0} role="region" aria-label="计划需求曲线图，小屏幕可横向滚动">
      <svg className="town-graph" viewBox="0 0 720 685" role="img" aria-labelledby={`${id}-graph-title ${id}-graph-desc`}>
        <title id={`${id}-graph-title`}>计划需求与产出的调整</title>
        <desc id={`${id}-graph-desc`}>初始均衡产出 850，新均衡 {money(target)}，当前产出 {money(current)}，计划需求 {money(demand)}。灰线为需求等于产出，黑线为原需求，橙线为新需求。</desc>
        <g className="town-grid"><path d="M65 423 H641 M65 231 H641 M257 615 V39 M449 615 V39 M641 615 V39" /></g>
        <path className="town-axis" d="M65 55 V615 H680" />
        <path className="town-diagonal" d={`M${x(0)} ${y(0)} L${x(1200)} ${y(1200)}`} />
        <path className="town-old" d={`M${x(0)} ${y(340)} L${x(1200)} ${y(1060)}`} />
        <path className="town-new" d={`M${x(0)} ${y(intercept)} L${x(1200)} ${y(intercept + 720)}`} />
        <path className="town-guide" d={`M${x(current)} ${y(demand)} V615`} />
        <circle cx={x(850)} cy={y(850)} r="6" fill="#171717" />
        <circle cx={x(target)} cy={y(target)} r="9" className="town-target" />
        <circle cx={x(current)} cy={y(demand)} r="8" className="town-current" />
        <text x="65" y="28">计划需求 Z</text><text x="695" y="667" textAnchor="end">收入 / 产出 Y</text>
        <text x="65" y="645">0</text><text x="238" y="645">400</text><text x="430" y="645">800</text><text x="613" y="645">1,200</text>
        <text x="10" y="430">400</text><text x="10" y="238">800</text>
      </svg>
      </div>
      <p className="goods-demo-note">小屏幕上可以左右滑动曲线图，下方数字会同步显示当前状态。</p>
      <div className="town-legend"><span>灰：Z = Y</span><span>黑：原需求</span><span>橙：新需求</span><span>空心圈：新均衡</span></div>
      <div className="goods-demo-actions">
        <button type="button" onClick={() => { if (round >= 12) setRound(0); setPlaying(!playing) }}>{playing ? '暂停调整' : round >= 12 ? '重新演示' : '播放调整'}</button>
        <button type="button" disabled={playing || round >= 12} onClick={() => setRound(value => value + 1)}>调整一轮</button>
        <button type="button" onClick={() => { setPlaying(false); setRound(0) }}>回到起点</button>
      </div>
      <dl className="goods-demo-results">
        <div><dt>当前产出 Y</dt><dd>{money(current)}</dd></div>
        <div><dt>当前计划需求 Z</dt><dd>{money(demand)}</dd></div>
        <div><dt>新均衡产出</dt><dd>{money(target)}</dd></div>
      </dl>
      <div className="town-stock" role="status">
        <strong>{Math.abs(stock) < .1 ? '订单和生产已很接近' : stock > 0 ? '货架变满：企业有减产动机' : '货架变空：企业有增产动机'}</strong>
        <p>第 {round} 轮。{stock >= 0 ? '产出比需求多' : '需求比产出多'} {money(Math.abs(stock))}。</p>
      </div>
      <dl className="goods-demo-results town-accounts">
        <div><dt>私人储蓄 Y − T − C</dt><dd>{money(current - scenario.T - consumption)}</dd></div>
        <div><dt>公共储蓄 T − G</dt><dd>{money(scenario.T - scenario.G)}</dd></div>
      </dl>
      <p className="goods-demo-note">每次调整让下一轮产出等于本轮计划需求。这是帮助观察方向的简化节奏，不对应固定天数。价格、投资 150 和消费倾向 0.6 保持不变；屏幕展示前 12 轮，尚未严格到达极限时仍会有微小差额。</p>
    </section>
  )
}
