import { useId, useState } from 'react'
import { Lab, Metrics, number, Playback, Slider, useFrames } from '../finance/LabUI'
import { labourCounts, wagePrice } from './models'
import './labour.css'

export function LabourCountLab() {
  const [leave, setLeave] = useState(false)
  const [amount, setAmount] = useState(40)
  const frames = useFrames(10)
  const moved = amount * frames.fraction
  const state = labourCounts(moved, leave)
  return <Lab name="labour-count-lab" title="少了 40 个失业者，究竟发生了什么？" intro="固定观察 1,000 位劳动年龄居民：起初就业 700、正在求职 100、不在劳动力中 200。选择变化，再逐步观察；未就业者先满足可工作且正在求职的口径。">
    <div className="quiz-choices" role="group" aria-label="人员流动情景">
      <button type="button" aria-pressed={!leave} onClick={() => { frames.reset(); setLeave(false) }}>找到工作</button>
      <button type="button" aria-pressed={leave} onClick={() => { frames.reset(); setLeave(true) }}>不再求职</button>
    </div>
    <Slider label="从失业组转出的人数" value={amount} min={10} max={80} step={10} unit=" 人" onChange={v => { frames.reset(); setAmount(v) }} />
    <Playback frames={frames} />
    <div className="labour-census" aria-label="居民分组">
      {[["就业 E",state.employed],["失业 U",state.unemployed],["劳动力之外",state.outside]].map(([name,value]) => <div key={name}><strong>{name}</strong><span>{Number(value)} 人</span><div className="labour-person-track"><span style={{ width: `${Number(value)/10}%` }} /></div></div>)}
    </div>
    <Metrics values={[["失业率 U / (E+U)", `${number(state.unemployment)}%`],['参与率 (E+U) / 1,000',`${number(state.participation)}%`],['就业人口比 E / 1,000',`${number(state.employment)}%`]]} />
    <p className="finance-note" role="status">{leave ? '失业率下降了，但就业人数没有增加。退出求职的人改变了分子，也改变了劳动力分母。' : '失业者变为就业者：就业人数增加，劳动力总数不变。'}当前已转出 {number(moved)} 人，劳动力为 {number(state.force)} 人。</p>
    <p className="goods-demo-note">简化的统计分类练习，不对应某国调查的全部细则。退出劳动力不等于没有价值、懒惰或不愿工作；照护、学习、退休及灰心停止求职等都可能在这一组。</p>
  </Lab>
}

export function WagePriceLab() {
  const [markup, setMarkup] = useState(10)
  const [z, setZ] = useState(3)
  const state = wagePrice(markup,z)
  const id = useId()
  const x = (u: number) => 75 + u * 36
  const y = (w: number) => 410 - (w - .65) * 700
  return <Lab name="wage-price-lab" title="工资单与价签，能在什么位置对上账？" intro="仅含劳动的教学经济：每人产出 A=1，劳动力 1,000，预期价格等于实际价格。工资设定 WS 向下，价格设定 PS 水平；交点是二者相容的位置，不是社会福利最优点。">
    <Slider label="价格高于单位成本的加成 m" value={markup} min={5} max={25} step={1} unit="%" onChange={setMarkup} />
    <Slider label="工资设定项 z" value={z} min={0} max={8} step={.5} unit=" 个指数点" onChange={setZ} />
    <div className="finance-graph-scroll" role="region" aria-label="工资与价格设定图" tabIndex={0}>
      <svg className="finance-graph" viewBox="0 0 720 500" role="img" aria-labelledby={id}>
        <title id={id}>加成 {markup}%，z 为 {z} 个指数点，交点失业率 {number(state.natural)}%，实际工资 {number(state.realWage)}。</title>
        <path className="axis" d="M75 45V410H665" />
        <path className="old" d={`M${x(0)} ${y(1.03)}L${x(16)} ${y(.71)}`} />
        <path className="curve" d={`M${x(0)} ${y(1+z/100)}L${x(16)} ${y(1+z/100-.32)}`} />
        <path className="policy" d={`M75 ${y(state.realWage)}H650`} />
        <path className="guide" d={`M${x(state.natural)} ${y(state.realWage)}V410`} />
        <circle cx={x(state.natural)} cy={y(state.realWage)} r="7" fill="var(--finance-red)" />
        <text x="75" y="30">实际工资 W / P</text><text x="665" y="487" textAnchor="end">失业率 u / %</text>
        {[0,4,8,12,16].map(u => <text key={u} x={x(u)} y="445" textAnchor="middle">{u}</text>)}
        {[.7,.9,1.1].map(w => <text key={w} x="60" y={y(w)+6} textAnchor="end">{w}</text>)}
        <text x="590" y={y(state.realWage)-14} fill="var(--finance-red)">PS</text><text x="590" y={y(1+z/100-.29)-12}>WS</text>
      </svg>
    </div>
    <Metrics values={[["相容失业率",`${number(state.natural)}%`],['实际工资',number(state.realWage)],['相容就业人数',number(state.employed)]]} />
    <p className="finance-note">WS：W/P = 1 + z − 2u；PS：W/P = 1/(1+m)。计算时 m、z、u 用小数。当前交点约为 u = {number(state.natural)}%，实际工资 = {state.realWage.toFixed(4)}。虚线仅保留最初 WS。</p>
    <p className="goods-demo-note">z 是其他工资设定因素的综合项，不是某项政策的百分比或福利评分。这里保持生产率与其他条件不变；现实制度还影响匹配、生产率和保障，不能据此给单项政策直接下结论。</p>
  </Lab>
}
