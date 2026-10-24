import { useEffect, useId, useState } from 'react'
import { cumulativeOutput, DEMO_ROUNDS, multiplier } from './goods-market'
import './GoodsMarketDemo.css'

const format = (value: number) => value.toFixed(2)
const stops = ['修路工程队', '面包店', '理发店', '书店', '小餐馆', '修车店']

export function GoodsMarketDemo() {
  const id = useId()
  const [c1, setC1] = useState(0.6)
  const [spending, setSpending] = useState(40)
  const [rounds, setRounds] = useState(0)
  const [playing, setPlaying] = useState(false)
  const total = cumulativeOutput(spending, c1, rounds)
  const limit = spending * multiplier(c1)
  const tail = cumulativeOutput(spending, c1, DEMO_ROUNDS)
    - cumulativeOutput(spending, c1, 6)
  const barScale = Math.max(spending, tail)

  useEffect(() => {
    if (!playing) return
    if (rounds >= DEMO_ROUNDS) {
      setPlaying(false)
      return
    }
    const timer = window.setTimeout(() => setRounds((value) => value + 1), 900)
    return () => window.clearTimeout(timer)
  }, [playing, rounds])

  function reset() {
    setPlaying(false)
    setRounds(0)
  }

  const contributions = Array.from({ length: 7 }, (_, index) => {
    if (index < 6) {
      return {
        label: `第 ${index + 1} 轮`,
        value: rounds > index ? spending * c1 ** index : 0,
      }
    }
    return {
      label: '7–12 轮',
      value: rounds > 6 ? total - cumulativeOutput(spending, c1, 6) : 0,
    }
  })

  return (
    <section className="goods-demo multiplier-demo" aria-labelledby={`${id}-title`}>
      <header className="goods-demo-header">
        <span>INTERACTIVE / 乘数实验室</span>
        <h3 id={`${id}-title`}>跟着一笔订单，逛逛这座小镇。</h3>
        <p>工程队接单后，有人去买面包；面包店多了收入，又有人去理发。假想每轮新增收入都按同一比例消费，看看订单能传多远。</p>
      </header>

      <div className="goods-demo-controls">
        <label htmlFor={`${id}-c1`}>
          <span>边际消费倾向 c₁ <strong>{c1.toFixed(1)}</strong></span>
          <input id={`${id}-c1`} type="range" min="0.2" max="0.9" step="0.1" value={c1}
            onChange={(event) => { reset(); setC1(Number(event.target.value)) }} />
        </label>
        <label htmlFor={`${id}-spending`}>
          <span>新增政府购买 ΔG <strong>{spending}</strong></span>
          <input id={`${id}-spending`} type="range" min="20" max="100" step="10" value={spending}
            onChange={(event) => { reset(); setSpending(Number(event.target.value)) }} />
        </label>
      </div>

      <div className="goods-demo-actions">
        <button type="button" onClick={() => {
          if (rounds >= DEMO_ROUNDS) setRounds(0)
          setPlaying(!playing)
        }}>{playing ? '暂停' : rounds >= DEMO_ROUNDS ? '重新播放' : '播放动画'}</button>
        <button type="button" disabled={playing || rounds >= DEMO_ROUNDS}
          onClick={() => setRounds((value) => value + 1)}>下一轮</button>
        <button type="button" onClick={reset}>重置</button>
      </div>

      <ol className={`town-route${playing ? ' is-playing' : ''}`} aria-label="新增订单的传递路线">
        {stops.map((stop, index) => <li key={stop}
          className={`${rounds > index ? 'is-reached' : ''} ${rounds === index + 1 ? 'is-active' : ''}`}>
          <svg viewBox="0 0 100 80" aria-hidden="true">
            <path d="M12 32 25 12H75L88 32Z" className="shop-roof" />
            <path d="M17 34V73H83V34 M43 73V48H60V73 M25 44H35V56H25Z M67 44H77V56H67Z" className="shop-front" />
            <path d="M8 74H92" className="shop-front" />
          </svg>
          <small>第 {index + 1} 轮</small><strong>{stop}</strong>
          <span>{rounds > index ? format(spending * c1 ** index) : '等待订单'}</span>
        </li>)}
      </ol>
      <p className="goods-demo-note">店铺仅用来想象各轮新增最终产品与服务的购买；一轮的收入可以分散给许多家庭和店铺，并非同一张纸币必须按此路线流转。</p>

      <div className="goods-demo-chart" aria-label="各轮新增产出，横条长度按金额比例绘制">
        {contributions.map(({ label, value }) => (
          <div className="goods-demo-row" key={label}>
            <span>{label}</span>
            <div className="goods-demo-track" aria-hidden="true">
              <span style={{ width: `${value / barScale * 100}%` }} />
            </div>
            <span>{format(value)}</span>
          </div>
        ))}
      </div>

      <dl className="goods-demo-results">
        <div><dt>累计新增产出</dt><dd>{format(total)}</dd></div>
        <div><dt>理论最终增量</dt><dd>{format(limit)}</dd></div>
        <div><dt>支出乘数</dt><dd>{format(multiplier(c1))} 倍</dd></div>
      </dl>
      <p className="goods-demo-status" role="status">
        {rounds === 0 ? '尚未开始。点击“下一轮”，先看到最初的政府购买。'
          : rounds === DEMO_ROUNDS
            ? `已演示 12 轮；后续尚有 ${format(limit - total)} 的增量，继续累加才趋近理论值。`
            : `已演示 ${rounds} 轮，累计新增产出 ${format(total)}。`}
      </p>
      <p className="goods-demo-note">金额可按万元理解。一轮表示一次支出与收入的反馈，不代表一天或一个季度。演示固定税收、投资与价格，只让消费随收入变化；动画默认不自动播放。</p>
    </section>
  )
}
