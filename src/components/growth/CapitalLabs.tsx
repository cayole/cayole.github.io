import { useState } from 'react'
import { Lab, Metrics, number, Playback, Slider, useFrames } from '../finance/LabUI'
import { GrowthChart } from './GrowthChart'
import { capitalPath, capitalSteady } from './models'

export function CapitalAccumulationLab() {
  const [saving,setSaving] = useState(20), [depreciation,setDepreciation] = useState(10)
  const [initial,setInitial] = useState(1)
  const frames = useFrames(8), period = frames.frame*5
  const rows = capitalPath(saving,depreciation,initial), current = rows[period]
  const steady = capitalSteady(saving,depreciation)
  const kMax = Math.max(1,steady.capital,initial)*1.2
  const samples = Array.from({length:61},(_,i)=>kMax*i/60)
  const yMax = Math.max(.5,saving/100*Math.sqrt(kMax),depreciation/100*kMax)*1.15
  return <Lab name="capital-accumulation-lab" title="这轮新添的设备，够不够补上旧设备的损耗？" intro="每工人产出 y=√k；人口、就业与技术固定，储蓄全部转为投资。资本 k 是存量，投资与折旧是每期流量。每帧显示 5 期模型迭代。">
    <Slider label="用于投资的储蓄率 s" min={0} max={60} step={5} value={saving} unit="%" onChange={v=>{frames.reset();setSaving(v)}} />
    <Slider label="每期折旧率 δ" min={5} max={20} step={5} value={depreciation} unit="%" onChange={v=>{frames.reset();setDepreciation(v)}} />
    <div className="quiz-choices" role="group" aria-label="起始资本">{([['设备少',1],['设备较多',4],['设备很多',9]] as const).map(([label,k])=><button type="button" key={k} aria-pressed={initial===k} onClick={()=>{frames.reset();setInitial(k)}}>{label}：k={k}</button>)}</div>
    <Playback frames={frames} />
    <GrowthChart title="投资曲线与折旧线" xLabel="每工人资本 k" yLabel="每期投资 / 折旧" xMax={kMax} yMax={yMax} lines={[
      {label:'投资 s√k',points:samples.map(k=>[k,saving/100*Math.sqrt(k)]),kind:'accent'},
      {label:'折旧 δk',points:samples.map(k=>[k,depreciation/100*k])},
      {label:'当前位置的两者差额',points:[[current.capital,current.investment],[current.capital,current.replacement]],kind:'baseline',marker:true},
    ]} />
    <Metrics values={[["当前期数",String(period)],['当前资本 k',number(current.capital)],['当前产出 y',number(current.output)],['当前消费 c',number(current.consumption)]]} />
    <p className="finance-note" role="status">当前投资 {number(current.investment)} − 折旧 {number(current.replacement)} = 下一期资本净变化 {number(current.net)}。理论稳态 k*={number(steady.capital)}、y*={number(steady.output)}、c*={number(steady.consumption)}。第 40 期只是有限展示；不代表已达到理论稳态。</p>
    <p className="goods-demo-note">kₜ₊₁=(1−δ)kₜ+s√kₜ，cₜ=(1−s)√kₜ。所有量为每工人的教学单位；模型将未消费资源转为设备，不是把剩面包直接变成烤箱。无需求不足、政府或跨境资金流动。</p>
  </Lab>
}

export function GoldenRuleLab() {
  const [saving,setSaving] = useState(50)
  const state = capitalSteady(saving)
  const samples=Array.from({length:51},(_,i)=>i*2)
  return <Lab name="golden-rule-lab" title="全都拿去造烤箱，生活会最好吗？" intro="只比较已经达到稳态的经济：y=√k，折旧率固定 10%。储蓄率高会提高稳态产出，却不保证留下的消费更多。它没有替今天的人计算过渡期代价。">
    <div className="quiz-choices" role="group" aria-label="稳态储蓄情景">{[20,50,80,100].map(s=><button type="button" key={s} aria-pressed={saving===s} onClick={()=>setSaving(s)}>{s}% 储蓄</button>)}</div>
    <Slider label="稳态储蓄率" min={0} max={100} step={5} value={saving} unit="%" onChange={setSaving} />
    <GrowthChart title="储蓄率与稳态消费" xLabel="储蓄率 s / %" yLabel="稳态每工人消费 c*" xMax={100} yMax={3} lines={[
      {label:'稳态消费',points:samples.map(s=>[s,capitalSteady(s).consumption])},
      {label:'当前选择',points:[[saving,state.consumption]],kind:'accent',marker:true},
    ]} />
    <Metrics values={[["稳态资本 k*",number(state.capital)],['稳态产出 y*',number(state.output)],['补充折旧所需',number(state.replacement)],['稳态消费 c*',number(state.consumption)]]} />
    <p className="finance-note">y* = s/0.1；c* = s(1−s)/0.1。本例 50% 时 c*=2.50 最大；20% 和 80% 的 c* 都是 1.60，但资本和产出大不相同。100% 时没有消费，产出都用来补充折旧。</p>
    <p className="goods-demo-note">“50%”来自平方根函数、固定人口和技术等特定条件，不是现实储蓄率建议。最大化稳态消费也不等于解决代际福利、风险与过渡期分配问题。</p>
  </Lab>
}
