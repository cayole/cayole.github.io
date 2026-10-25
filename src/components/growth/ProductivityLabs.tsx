import { useState } from 'react'
import { Lab, Metrics, number, Playback, Slider, useFrames } from '../finance/LabUI'
import { GrowthChart } from './GrowthChart'
import { productivityEmployment, productivityWage } from './models'

export function ProductivityJobsLab() {
  const [productivity,setProductivity] = useState(20), [output,setOutput] = useState(10)
  const frames=useFrames(10)
  const state=productivityEmployment(productivity,output,frames.fraction)
  return <Lab name="productivity-jobs-lab" title="效率提高了，就一定少用人吗？先把订单放进来。" intro="短期简化为 Y=AN，起点产出 100、每工人效率 1、就业 100。技术与需求的目标变化分帧展开；不是因果估计，不代表一家店的招工等于整个经济的就业。">
    <Slider label="目标劳动生产率提高" min={0} max={40} step={5} value={productivity} unit="%" onChange={v=>{frames.reset();setProductivity(v)}} />
    <Slider label="目标实际产出变化" min={-10} max={40} step={5} value={output} unit="%" onChange={v=>{frames.reset();setOutput(v)}} />
    <div className="quiz-choices" role="group" aria-label="需求响应情景">{([['订单不变',0],['订单增 10%',10],['订单增 20%',20],['订单增 30%',30]] as const).map(([label,g])=><button key={g} type="button" aria-pressed={output===g} onClick={()=>{frames.reset();setOutput(g)}}>{label}</button>)}</div>
    <Playback frames={frames} />
    {[["起点就业",100],["当前就业",state.employment]].map(([label,value])=><div className="growth-worker-row" key={label}><span>{label}</span><div className="growth-worker-track"><span style={{width:`${Number(value)/150*100}%`}} /></div><strong>{number(Number(value))}</strong></div>)}
    <Metrics values={[["当前效率 A",number(state.productivity)],['当前产出 Y',number(state.output)],['当前就业 N',number(state.employment)],['相对起点就业变化',`${number(state.employmentChange)}%`]]} />
    <p className="finance-note" role="status">N = Y/A = {number(state.output)} / {number(state.productivity)} = {number(state.employment)}。{Math.abs(state.employmentChange)<1e-8?'当前订单增加刚好抵消单位产出节省的用工。':state.employmentChange<0?'需求增长不足以抵消单位产出节省的劳动，就业减少。':'需求增长超过生产率增长，就业反而增加。'}</p>
    <p className="goods-demo-note">精确比例：(1+gN)=(1+gY)/(1+gA)。20% 效率提升、产出不变时，就业减少约 16.67%，不是 20%。现实还会改变工时、资本、工资、价格、岗位结构和参与率。</p>
  </Lab>
}

export function ProductivityWageLab() {
  const [actual,setActual] = useState(120), [expected,setExpected] = useState(120)
  const state=productivityWage(actual,expected)
  const samples=Array.from({length:41},(_,i)=>i*.5)
  return <Lab name="productivity-wage-lab" title="效率进步，工资与定价怎样一起对齐？" intro="沿用 WS 中的 1.03−2u 与加成 10%，但不再固定效率为 1。假设价格预期正确，单独观察实际效率 A 与合同预期效率 Aᵉ 的差异。指数 100 表示 A=1。">
    <div className="quiz-choices" role="group" aria-label="生产率与预期情景">{([
      ['原来一致',100,100],['提高且预期跟上',120,120],['放缓但预期滞后',110,120],['预期修正',110,110],
    ] as const).map(([label,a,e])=><button key={label} type="button" aria-pressed={actual===a&&expected===e} onClick={()=>{setActual(a);setExpected(e)}}>{label}</button>)}</div>
    <Slider label="实际效率指数 A" min={100} max={130} step={5} value={actual} onChange={setActual} />
    <Slider label="合同预期效率指数 Aᵉ" min={100} max={130} step={5} value={expected} onChange={setExpected} />
    <GrowthChart title="效率与工资价格条件的交点" xLabel="失业率 u / %" yLabel="实际工资 W/P" xMax={20} yMax={1.5} lines={[
      {label:'WS：Aᵉ(1.03−2u)',points:samples.map(u=>[u,state.expected*(1.03-2*u/100)])},
      {label:'PS：A/1.1',points:[[0,state.realWage],[20,state.realWage]],kind:'accent'},
      ...(state.unemployment===null?[]:[{label:'当前条件交点',points:[[state.unemployment,state.realWage]] as [number,number][],kind:'baseline' as const,marker:true}]),
    ]} />
    <Metrics values={[["PS 对应实际工资",number(state.realWage)],['条件交点失业率',state.unemployment===null?'无内点解':`${number(state.unemployment)}%`],['预期 / 实际效率',`${number(state.expected/state.actual)} 倍`]]} />
    <p className="finance-note">{state.unemployment===null?'当前参数下，线性 WS 与 PS 在 0%–100% 失业区间没有交点；不把负失业率当作预测。':actual===expected?'实际与预期效率一致：两条关系同比例移动，交点约 6.05%，而实际工资随效率提高。':'合同预期高于或低于实际效率，交点会变化；这是条件相容练习，不是已求出的现实动态就业路径。'}</p>
    <p className="goods-demo-note">PS：W/P=A/(1+m)；WS：W/P=AᵉF(u,z)。预期一致时 A 从等式两边约去。预期未对齐时，当前条件交点不冒充长期自然失业率；现实还需要合同、需求和政策如何调整的信息。</p>
  </Lab>
}
