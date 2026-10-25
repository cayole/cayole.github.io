import { useState } from 'react'
import { Lab, Metrics, number, Playback, Slider, useFrames } from '../finance/LabUI'
import { GrowthChart } from './GrowthChart'
import { basketComparison, compoundPath } from './models'

export function CompoundingLab() {
  const [first,setFirst] = useState(2), [second,setSecond] = useState(3)
  const [log,setLog] = useState(false)
  const frames = useFrames(8), year = frames.frame*5
  const rows = compoundPath(first,second), current = rows[year]
  const max = Math.max(110,rows[40].first,rows[40].second)*1.05
  return <Lab name="compounding-lab" title="每年只差 1 个百分点，四十年后差多少？" intro="两条人均实际产出路径都从指数 100 出发，暂定增长率不变。每帧跳过 5 个模型年；不是收益承诺，也不是现实增长预测。">
    <Slider label="河湾镇年增长率" min={0} max={5} step={.5} value={first} unit="%" onChange={v=>{frames.reset();setFirst(v)}} />
    <Slider label="对照镇年增长率" min={0} max={5} step={.5} value={second} unit="%" onChange={v=>{frames.reset();setSecond(v)}} />
    <div className="quiz-choices" role="group" aria-label="增长图刻度"><button type="button" aria-pressed={!log} onClick={()=>setLog(false)}>线性：看绝对差距</button><button type="button" aria-pressed={log} onClick={()=>setLog(true)}>对数：看增长速度</button></div>
    <Playback frames={frames} />
    <GrowthChart title="两条复合增长路径" xLabel="模型年数" yLabel={log?'产出指数（对数）':'人均实际产出指数'} xMax={40} yMax={max} logarithmic={log} lines={[
      {label:'河湾镇',points:rows.slice(0,year+1).map(r=>[r.year,r.first]),marker:true},
      {label:'对照镇',points:rows.slice(0,year+1).map(r=>[r.year,r.second]),kind:'accent',marker:true},
    ]} />
    <Metrics values={[["当前模型年份",String(year)],['河湾镇指数',number(current.first)],['对照镇指数',number(current.second)],['对照 / 河湾',`${number(current.second/current.first)} 倍`]]} />
    <p className="finance-note">第 40 年理论计算：河湾 {number(rows[40].first)}，对照 {number(rows[40].second)}。当前展示到第 {year} 年。固定增长率在对数图上是直线；在线性图上会越来越陡。</p>
    <p className="goods-demo-note">Yₜ / 人口 = 起点 × (1+g)ᵗ。这里直接设定人均实际增长率，既不解释增长来源，也不保证每个家庭收入都按平均数增长。</p>
  </Lab>
}

export function PurchasingPowerLab() {
  const [exchange,setExchange] = useState(5)
  const state = basketComparison(exchange)
  return <Lab name="purchasing-power-lab" title="汇率一跳，生活水准真的跟着跳了吗？" intro="两个虚构经济的月人均收入和本地价格不变，只改变兑换报价。用同样质量的一篮子生活品做简化比较；不是完整 GDP 购买力平价估算。">
    <div className="growth-comparison"><div><strong>河湾镇：硬币</strong><span>人均收入 6,000 / 月</span><span>同一篮子 200</span></div><div><strong>山丘镇：券</strong><span>人均收入 3,000 / 月</span><span>同一篮子 100</span></div></div>
    <Slider label="每 1 券兑换河湾硬币" min={1} max={8} step={.5} value={exchange} onChange={setExchange} />
    <Metrics values={[["河湾收入折为券",number(state.riverConverted)],['按汇率收入比',`${number(state.marketRatio)} 倍`],['河湾可买篮子',`${number(state.riverBaskets)} 份`],['山丘可买篮子',`${number(state.hillBaskets)} 份`]]} />
    <p className="finance-note">同篮价格对应的购买力换算为 1 券 = {state.pppExchange} 河湾硬币。当前市场报价为 {exchange}；可买篮子数之比仍为 {number(state.basketRatio)}，不会因为兑换屏幕变化而立即改变。</p>
    <p className="goods-demo-note">同篮比较不能抹去质量、偏好、住房、公共服务和品种差异。购买力换算适合讨论本地实际购买力，市场汇率在跨境支付、进口与债务问题里仍有重要作用。</p>
  </Lab>
}
