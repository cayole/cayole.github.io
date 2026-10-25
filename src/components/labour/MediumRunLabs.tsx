import { useId, useState } from 'react'
import { Lab, Metrics, number, Playback, useFrames } from '../finance/LabUI'
import { deflationPath, policyPath } from './models'
import type { PolicyCase } from './models'
import './labour.css'

export function MediumRunLab() {
  const [scenario, setScenario] = useState<PolicyCase>('heat')
  const rows = policyPath(scenario)
  const frames = useFrames(rows.length-1)
  const current = rows[frames.frame]
  const id = useId()
  const x = (Y: number) => 80+(Y-860)*5.5
  const rY = (r: number) => 260-r*30
  const pY = (pressure: number) => 500-pressure*20
  return <Lab name="medium-run-lab" title="同一条街，把短期和中期接起来看" intro="上图看实际政策利率与需求均衡，下图看产出缺口带来的通胀变化。这里按预设情景逐步翻页，并非由模型自动生成的央行决策或现实时间预测。">
    <div className="quiz-choices" role="group" aria-label="中期调整情景">{([['heat','需求过热'],['tax','增税与降息接力'],['energy','能源成本冲击']] as const).map(([key,label]) => <button type="button" key={key} aria-pressed={scenario===key} onClick={() => { frames.reset(); setScenario(key) }}>{label}</button>)}</div>
    <Playback frames={frames} />
    <div className="labour-path-summary" role="status"><strong>步骤 {frames.frame}：{current.label}</strong>实际政策利率 {number(current.rate)}%，税收 {current.tax}，潜在产出 {current.potential}。</div>
    <div className="finance-graph-scroll" role="region" aria-label="联动的 IS-LM 与 PC 图" tabIndex={0}>
      <svg className="finance-graph" viewBox="0 0 720 690" role="img" aria-labelledby={id}>
        <title id={id}>产出 {number(current.Y)}，潜在产出 {current.potential}，本步通胀变化 {number(current.pressure)} 个百分点。</title>
        <path className="axis" d="M80 55V260H650 M80 370V590H650" />
        <path className="old" d={`M${x(940)} 55V590`} />
        <path className="guide" d={`M${x(current.potential)} 55V590`} />
        <path className="curve" d={`M${x(870)} ${rY((360-.6*current.tax-.3*870)/6)}L${x(960)} ${rY((360-.6*current.tax-.3*960)/6)}`} />
        <path className="policy" d={`M80 ${rY(current.rate)}H640`} />
        <circle cx={x(current.Y)} cy={rY(current.rate)} r="7" fill="var(--finance-red)" />
        <path className="grid" d="M80 500H650" />
        <path className="curve" d={`M${x(860)} ${pY(.05*(860-current.potential))}L${x(960)} ${pY(.05*(960-current.potential))}`} />
        <circle cx={x(current.Y)} cy={pY(current.pressure)} r="7" fill="var(--finance-red)" />
        <text x="80" y="30">实际政策利率 r / %</text><text x="80" y="340">通胀变化 / 百分点</text>
        <text x="650" y="675" textAnchor="end">产出 Y</text>
        {[860,900,940,960].map(Y => <text key={Y} x={x(Y)} y="625" textAnchor="middle">{Y}</text>)}
        {[0,3,6].map(r => <text key={r} x="65" y={rY(r)+6} textAnchor="end">{r}</text>)}
        {[-2,0,2].map(p => <text key={p} x="65" y={pY(p)+6} textAnchor="end">{p}</text>)}
        <text x="610" y={rY(current.rate)-12} fill="var(--finance-red)">LM</text><text x="610" y={pY(.05*(956-current.potential))-14}>PC</text>
      </svg>
    </div>
    <Metrics values={[["当前产出 Y",number(current.Y)],['潜在产出 Yₙ',number(current.potential)],['本步通胀变化',`${number(current.pressure)} 个百分点`],['通胀率',`${number(current.inflation)}%`]]} />
    <p className="finance-note">核对账本：C {number(current.C)} + I {number(current.I)} + G 150 = Y {number(current.Y)}。当前自然失业率 {number(current.natural)}%，失业率 {number(current.unemployment)}%。使 Y=Yₙ 的中性实际利率为 {number(current.neutral)}%。</p>
    <p className="goods-demo-note">新校准：L=1,000，A=1，C=100+0.6(Y−T)，I=110+0.1Y−600r，G=150；r 在公式中用小数。PC：Δπ=0.05(Y−Yₙ)，单位为百分点，预期等于上期通胀。不沿用前几篇 850 的数值标尺。能源情景只移动潜在产出，暂忽略它对 IS 的影响。</p>
  </Lab>
}

export function DeflationLab() {
  const [anchored, setAnchored] = useState(false)
  const frames = useFrames(3)
  const rows = deflationPath(anchored)
  const current = rows[frames.frame]
  return <Lab name="deflation-lab" title="名义利率已经是零，为什么还会越借越贵？" intro="一次需求收缩后，即使名义政策利率降到 0%，产出仍不足。对比预期随通缩下修与保持在 0% 两种情况；只展示四期，不把这个简化反馈外推到无穷。">
    <div className="quiz-choices" role="group" aria-label="通缩预期情景"><button type="button" aria-pressed={!anchored} onClick={() => { frames.reset(); setAnchored(false) }}>预期随通缩下修</button><button type="button" aria-pressed={anchored} onClick={() => { frames.reset(); setAnchored(true) }}>预期锚定在 0%</button></div>
    <Playback frames={frames} />
    <ol className="labour-period-list">{rows.map(row => <li key={row.period} aria-current={row.period===current.period?'step':undefined}>第 {row.period} 期</li>)}</ol>
    <Metrics values={[["预期通胀",`${number(current.expected)}%`],['近似实际政策利率',`${number(current.real)}%`],['本期产出',number(current.Y)],['实际通胀',`${number(current.inflation)}%`]]} />
    <p className="finance-note">0% − ({number(current.expected)}%) = {number(current.real)}% 的近似实际利率；Y = 930 − 20 × {number(current.real)} = {number(current.Y)}。{anchored ? '锚定打断了不断抬升实际利率的反馈，但产出仍低于潜在 940：它不是万能复苏按钮。' : '本期负通胀进入下一期预期；在零名义利率处，预期通缩会抬高实际利率，进一步压低需求。'}</p>
    <p className="goods-demo-note">同一 PC：π=πᵉ+0.05(Y−940)。IS 比正常状态少了 70 单位需求，名义利率固定为 0；不含信用利差。实际利率用 Fisher 近似，未模拟债务违约及其他政策。此处是机制实验，不表示现实必然落入通缩螺旋。</p>
  </Lab>
}
