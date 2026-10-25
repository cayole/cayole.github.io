import { useState } from 'react'
import { Lab, Metrics, number, Playback, Slider, useFrames } from '../finance/LabUI'
import { GrowthChart } from './GrowthChart'
import { balancedPath, growthAccounting } from './models'

export function BalancedGrowthLab() {
  const [saving,setSaving] = useState(20), [technology,setTechnology] = useState(2), [population,setPopulation] = useState(1)
  const frames = useFrames(6), year = frames.frame*5
  const state=balancedPath(saving,technology,population), current=state.rows[year]
  const yMax=Math.max(110,state.rows[30].totalIndex)*1.05
  return <Lab name="balanced-growth-lab" title="站上增长扶梯：为什么一种量不变，另一种还在长？" intro="Y=√(K·AN)，折旧 10%。每次调参都在比较一条已处均衡增长的经济，不模拟调参当天的跳跃或过渡。N 与人口同比例增长，初始 A=1。">
    <Slider label="储蓄率 s" min={10} max={40} step={5} value={saving} unit="%" onChange={v=>{frames.reset();setSaving(v)}} />
    <Slider label="劳动增进型技术增长 gA" min={0} max={4} step={.5} value={technology} unit="%" onChange={v=>{frames.reset();setTechnology(v)}} />
    <Slider label="就业与人口增长 gN" min={0} max={3} step={.5} value={population} unit="%" onChange={v=>{frames.reset();setPopulation(v)}} />
    <Playback frames={frames} />
    <GrowthChart title="均衡路径上人均与总量的增长" xLabel="模型年数" yLabel="各自起点为 100 的指数" xMax={30} yMax={yMax} lines={[
      {label:'每工人产出指数',points:state.rows.slice(0,year+1).map(r=>[r.year,r.perWorkerIndex]),marker:true},
      {label:'总产出指数',points:state.rows.slice(0,year+1).map(r=>[r.year,r.totalIndex]),kind:'accent',marker:true},
    ]} />
    <Metrics values={[["当前模型年份",String(year)],['单位有效劳动产出',number(state.outputPerEffective)],['每工人产出',number(current.outputPerWorker)],['总产出指数',number(current.totalIndex)]]} />
    <p className="finance-note">单位有效劳动资本 k̃*={number(state.capitalPerEffective)} 固定；每工人产出每年增 {technology}%，总产出精确增长 {number(state.effectiveGrowth)}%。当前需投资已有资本的 {number(state.required)}%，才能同时补折旧并维持 K/(AN)。</p>
    <p className="goods-demo-note">离散期精确分母为 δ+(1+gA)(1+gN)−1，忽略交叉项时约为 δ+gA+gN。指数各自归一化，不能用它比较不同储蓄率经济的起点高低；起点与当期的水平另见数值。A 是劳动效率，不是索洛剩余本身。</p>
  </Lab>
}

export function GrowthAccountingLab() {
  const [output,setOutput] = useState(4), [capital,setCapital] = useState(4), [labour,setLabour] = useState(1)
  const state=growthAccounting(output,capital,labour)
  return <Lab name="growth-accounting-lab" title="增长这笔账，哪些解释了，哪些还没有？" intro="采用 Y=K^(1/3)(AN)^(2/3) 的局部增长近似，资本份额 1/3、劳动份额 2/3。把产出增速拆成投入贡献与剩余；这是核算，不自动证明因果。">
    <Slider label="总产出增长 gY" min={0} max={8} step={.5} value={output} unit="%" onChange={setOutput} />
    <Slider label="资本投入增长 gK" min={0} max={10} step={.5} value={capital} unit="%" onChange={setCapital} />
    <Slider label="劳动投入增长 gN" min={0} max={3} step={.5} value={labour} unit="%" onChange={setLabour} />
    <div className="growth-decomposition"><div><span>资本贡献：⅓ × {capital}%</span><strong>{number(state.capitalContribution)} 个百分点</strong></div><div><span>劳动贡献：⅔ × {labour}%</span><strong>{number(state.labourContribution)} 个百分点</strong></div><div><span>剩余：{output}% − 两项贡献</span><strong>{number(state.residual)} 个百分点</strong></div></div>
    <Metrics values={[["劳动生产率增速（近似）",`${number(state.labourProductivity)}%`],['索洛剩余 / TFP 增速',`${number(state.residual)}%`],['模型推算的 gA',`${number(state.technology)}%`]]} />
    <p className="finance-note">gY ≈ ⅓gK + ⅔gN + ⅔gA，所以 gA ≈ 剩余 ÷ ⅔。劳动生产率增速约为 gY−gN，与剩余不是同一个数。剩余可以为负；这不是“创新必然倒退”的证据。</p>
    <p className="goods-demo-note">将份额视为给定并按边际产出付酬是解释步骤的假设。工时、劳动质量、设备利用率、组织变化与测量误差都可能进入剩余；不能把它全贴成纯发明贡献。</p>
  </Lab>
}
