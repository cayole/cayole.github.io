import { useId, useState } from 'react'
import { bondYield, moneyMarket } from './models'
import { Lab, Metrics, number, Playback, Slider, useFrames } from './LabUI'

export function BondLab() {
  const [price, setPrice] = useState(96)
  const id = useId()
  const rate = bondYield(price)
  const path = Array.from({ length: 61 }, (_, index) => {
    const p = 85 + index / 4
    return `${index ? 'L' : 'M'}${70 + (p - 85) * 36} ${420 - bondYield(p) * 19}`
  }).join(' ')
  return <Lab name="bond-lab" title="同一张还款凭条，买贵了还是买便宜了？" intro="它一年后确定支付 100，现在不付息。只改变今天的买价，观察持有到期收益率；所有金额为教学单位。">
    <Slider label="今天的债券价格" value={price} min={85} max={100} step={.5} onChange={setPrice} />
    <Metrics values={[["到期收到", '100.00'], ['价格差', number(100 - price)], ['一年收益率', `${number(rate)}%`]]} />
    <div className="finance-graph-scroll" tabIndex={0} role="region" aria-label="债券价格与收益率曲线">
      <svg className="finance-graph" viewBox="0 0 700 490" role="img" aria-labelledby={id}>
        <title id={id}>债券价格 {price}，收益率 {number(rate)}%。价格越高，固定到期付款对应的收益率越低。</title>
        <path className="axis" d="M70 55V420H650" /><path className="curve" d={path} />
        <path className="guide" d={`M${70 + (price - 85) * 36} ${420 - rate * 19}V420`} />
        <circle cx={70 + (price - 85) * 36} cy={420 - rate * 19} r="7" fill="#b9341f" />
        <text x="70" y="30">年收益率 %</text><text x="650" y="480" textAnchor="end">今天的价格</text>
        {[85,90,95,100].map(p => <text key={p} x={70 + (p - 85) * 36} y="450" textAnchor="middle">{p}</text>)}
        {[0,5,10,15].map(r => <text key={r} x="55" y={427-r*19} textAnchor="end">{r}</text>)}
      </svg>
    </div>
    <p className="goods-demo-note">这里只比较同期限、无违约、持有到期的零息债券；不把它当作所有债券产品的收益公式。</p>
  </Lab>
}

export function MoneyMarketLab() {
  const [income, setIncome] = useState(1000)
  const [supply, setSupply] = useState(250)
  const frames = useFrames()
  const id = useId()
  const currentIncome = 1000 + (income - 1000) * frames.fraction
  const currentSupply = 200 + (supply - 200) * frames.fraction
  const current = moneyMarket(currentIncome, currentSupply)
  const target = moneyMarket(income, supply)
  const sx = (m: number) => 70 + .9 * m
  const sy = (r: number) => 430 - r * 30
  return <Lab name="money-market-lab" title="多一点支付余额，利率会往哪里走？" intro="从名义收入 1,000、货币供给 200、利率 5% 的独立教学例子出发。选择目标值，再播放或直接查看结果。">
    <Slider label="目标名义收入 N" min={800} max={1400} step={100} value={income} onChange={value => { frames.reset(); setIncome(value) }} />
    <Slider label="目标货币供给 M" min={120} max={480} step={10} value={supply} onChange={value => { frames.reset(); setSupply(value) }} />
    <Playback frames={frames} />
    <div className="finance-graph-scroll" tabIndex={0} role="region" aria-label="货币供需图">
      <svg className="finance-graph" viewBox="0 0 700 500" role="img" aria-labelledby={id}>
        <title id={id}>当前货币供给 {number(currentSupply)}，利率 {number(current.rate)}%，目标利率 {number(target.rate)}%。</title>
        <path className="axis" d="M70 50V430H650" />
        <path className="old" d={`M${sx(60)} ${sy(12)} L${sx(300)} ${sy(0)}H${sx(600)}`} />
        <path className="curve" d={`M${sx(.06 * currentIncome)} ${sy(12)} L${sx(.3 * currentIncome)} ${sy(0)}H${sx(600)}`} />
        <path className="policy" d={`M${sx(currentSupply)} 55V430`} />
        <circle cx={sx(currentSupply)} cy={sy(current.rate)} r="8" fill="#b9341f" />
        <text x="70" y="30">利率 %</text><text x="650" y="489" textAnchor="end">货币余额 M</text>
        {[0,200,400,600].map(m => <text key={m} x={sx(m)} y="460" textAnchor="middle">{m}</text>)}
        {[0,4,8,12].map(r => <text key={r} x="55" y={sy(r)+7} textAnchor="end">{r}</text>)}
      </svg>
    </div>
    <div className="finance-legend"><span>虚线：初始需求</span><span>黑线：当前需求</span><span>橙竖线：当前供给</span></div>
    <Metrics values={[["当前供给", number(currentSupply)], ['当前利率', `${number(current.rate)}%`], ['目标利率', `${number(target.rate)}%`]]} />
    <p className="finance-note" role="status">{current.rate === 0 ? `已到模型中的零利率段，超出最低交易余额的部分为 ${number(current.excess)}。继续增加余额不会再压低这项利率。` : '在这个正利率区间，供给增加会压低利率；收入增加则使需求线向右移动。'}</p>
    <p className="goods-demo-note">货币需求设为 Md = N(0.30 − 2i)，i 用小数；零利率处允许额外余额被持有。先忽略银行，把 M 当作央行货币。不是货币量或利率的现实估计。</p>
  </Lab>
}
