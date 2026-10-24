import { useId, useState } from 'react'
import { macroState } from './models'
import { Lab, Metrics, number, Playback, Slider, useFrames } from './LabUI'

export function InvestmentLab() {
  const [rate, setRate] = useState(6)
  return <Lab name="investment-lab" title="老周的三份设备报价，哪一份值得接？" intro="每个项目今天投入 100，一年后获得下面的净回款（含设备残值，已扣经营成本）。为单看利率，先把回款视为确定且不考虑物价变化。">
    <Slider label="融资或机会成本" value={rate} min={0} max={15} step={.5} unit="%" onChange={setRate} />
    <div className="finance-projects">
      {[['节能改造', 104], ['新增烤箱', 108], ['配送设备', 112]].map(([label, amount]) => {
        const payoff = Number(amount)
        const npv = payoff / (1 + rate / 100) - 100
        return <div key={label} className={`finance-project${npv > 1e-8 ? ' is-viable' : ''}`}>
          <strong>{label} · 一年后回款 {payoff}</strong>
          <span>净现值 {number(npv)} · {Math.abs(npv) < 1e-8 ? '刚好打平' : npv > 0 ? '在这个简化例子中可接受' : '回报不足以覆盖成本'}</span>
          <p>现在相当于值 {number(payoff / (1 + rate / 100))}，今天需要付出 100。</p>
        </div>
      })}
    </div>
    <p className="goods-demo-note">这是折现练习，不是设备投资建议。真实项目还要考虑不确定性、期限、税费和融资能否获得；自有资金也有机会成本。</p>
  </Lab>
}

const presets = [
  { label: '多修路', G: 180, rate: 4 },
  { label: '只降息', G: 150, rate: 2 },
  { label: '两边一起支持', G: 180, rate: 2 },
  { label: '少采购、降息接力', G: 130, rate: 2 },
]

export function ISLMLab() {
  const [G, setG] = useState(180)
  const [rate, setRate] = useState(4)
  const frames = useFrames()
  const id = useId()
  const g = 150 + (G - 150) * frames.fraction
  const i = 4 + (rate - 4) * frames.fraction
  const current = macroState(g, i)
  const target = macroState(G, rate)
  const x = (income: number) => 70 + (income - 500) * .8
  const y = (interest: number) => 420 - interest * 40
  const isPath = (government: number) => `M${x((145 + government - 80) / .3)} ${y(8)} L${x((145 + government) / .3)} ${y(0)}`
  return <Lab name="is-lm-lab" title="订单与利率，两只旋钮一起转" intro="初始 G = 150、利率 4%、产出 850。灰虚线保留初始 IS，黑线是当前 IS，橙线是中央银行设定的利率。选择情景后播放，或直接查看结果。">
    <div className="quiz-choices" role="group" aria-label="政策组合情景">
      {presets.map(preset => <button key={preset.label} type="button" aria-pressed={G === preset.G && rate === preset.rate}
        onClick={() => { frames.reset(); setG(preset.G); setRate(preset.rate) }}>{preset.label}</button>)}
    </div>
    <Slider label="目标政府购买 G" value={G} min={120} max={200} step={10} onChange={value => { frames.reset(); setG(value) }} />
    <Slider label="目标政策利率" value={rate} min={0} max={8} step={.5} unit="%" onChange={value => { frames.reset(); setRate(value) }} />
    <Playback frames={frames} />
    <div className="finance-graph-scroll" tabIndex={0} role="region" aria-label="IS-LM 政策组合图">
      <svg className="finance-graph" viewBox="0 0 720 500" role="img" aria-labelledby={id}>
        <title id={id}>当前政府购买 {number(g)}，利率 {number(i)}%，均衡产出 {number(current.Y)}，目标产出 {number(target.Y)}。</title>
        <path className="grid" d="M70 260H670 M270 100V420 M470 100V420" />
        <path className="axis" d="M70 60V420H680" />
        <path className="old" d={isPath(150)} /><path className="curve" d={isPath(g)} />
        <path className="policy" d={`M70 ${y(i)}H670`} />
        <path className="guide" d={`M${x(current.Y)} ${y(i)}V420`} />
        <circle cx={x(850)} cy={y(4)} r="6" fill="#97958f" />
        <circle cx={x(current.Y)} cy={y(i)} r="8" fill="#b9341f" />
        <text x="70" y="30">利率 i / %</text><text x="680" y="487" textAnchor="end">实际产出 Y</text>
        {[500,750,1000,1250].map(value => <text key={value} x={x(value)} y="453" textAnchor="middle">{value}</text>)}
        {[0,4,8].map(value => <text key={value} x="55" y={y(value)+7} textAnchor="end">{value}</text>)}
        <text x="625" y={y(i)-12} fill="#b9341f">LM</text>
      </svg>
    </div>
    <div className="finance-legend"><span>虚线：初始 IS</span><span>黑：当前 IS</span><span>橙：水平 LM</span></div>
    <Metrics values={[["当前均衡 Y", number(current.Y)], ['最终目标 Y', number(target.Y)], ['当前投资 I', number(current.I)], ['当前消费 C', number(current.C)]]} />
    <p className="finance-note">当前核对：C {number(current.C)} + I {number(current.I)} + G {number(g)} = Y {number(current.Y)}。</p>
    <p className="goods-demo-note">C = 100 + 0.6(Y − 100)，I = 105 + 0.1Y − 1,000i。式中 i 用小数，金额按万元理解。暂设预期通胀与风险溢价为零。动画逐步改变政策并显示各自均衡，不是现实经济的动态调整轨迹。</p>
  </Lab>
}
