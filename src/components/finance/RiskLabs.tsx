import { useState } from 'react'
import { bankBalance, defaultPremium, macroState, realRate } from './models'
import { Lab, Metrics, number, Playback, Slider, useFrames } from './LabUI'

export function RealRateLab() {
  const [nominal, setNominal] = useState(4)
  const [inflation, setInflation] = useState(2)
  const rate = realRate(nominal, inflation)
  return <Lab name="real-rate-lab" title="还款数字没变，为什么面包负担会变？" intro="借入 100 元，今天一份标准面包篮子值 10 元，可买 10 份。一年后还本付息，再按预期的新价格换算。">
    <Slider label="一年名义利率 i" value={nominal} min={0} max={10} step={.5} unit="%" onChange={setNominal} />
    <Slider label="预期通胀率" value={inflation} min={-5} max={8} step={.5} unit="%" onChange={setInflation} />
    <div className="finance-price-baskets">
      <div><span>今天借到的购买力</span><strong>10.00 份面包篮子</strong><span>100 元 ÷ 10 元</span></div>
      <div><span>预计明年还款购买力</span><strong>{number(10 * (1 + rate / 100))} 份</strong><span>{number(100 + nominal)} 元 ÷ {number(10 * (1 + inflation / 100))} 元</span></div>
    </div>
    <Metrics values={[["精确事前实际利率", `${number(rate)}%`], ['近似 i − 预期通胀', `${number(nominal - inflation)}%`]]} />
    <p className="finance-note" role="status">{inflation < 0 ? '通缩预期让明年的货币更值钱：即使名义利率很低，实际还款负担也可能上升。' : rate < 0 ? '这个例子中，预期物价上涨超过利息增长，预计还款购买力低于借入时。' : '名义还款与物价都变了，比较购买力才能判断实际成本。'}</p>
    <p className="goods-demo-note">精确式：1 + r = (1 + i) / (1 + 预期通胀)。现在做决策用预期；事后回看才使用实际发生的通胀。单一面包篮子是价格指数的教学替身。</p>
  </Lab>
}

export function BankCapitalLab() {
  const [equity, setEquity] = useState(20)
  const [loss, setLoss] = useState(10)
  const frames = useFrames()
  const current = bankBalance(equity, loss * frames.fraction)
  const target = bankBalance(equity, loss)
  return <Lab name="bank-capital-lab" title="资产少了 10，为什么资本会少一半？" intro="河湾银行初始资产 100。负债承诺先不变，资产估值损失由资本吸收。选择资本厚度和损失幅度，再播放。">
    <Slider label="初始资本" value={equity} min={5} max={30} step={5} onChange={value => { frames.reset(); setEquity(value) }} />
    <Slider label="目标资产损失" value={loss} min={0} max={25} step={1} onChange={value => { frames.reset(); setLoss(value) }} />
    <Playback frames={frames} />
    <div className="bank-ledger">
      <div><strong>当前资产</strong><span>{number(current.assets)}</span></div>
      <div><strong>当前负债</strong><span>{number(current.debt)}</span></div>
      <div className={`capital${current.equity <= 0 ? ' loss-warning' : ''}`}><strong>当前资本 = 资产 − 负债</strong><span>{number(current.equity)}</span></div>
    </div>
    <Metrics values={[["初始杠杆", `${number(current.initialLeverage)} 倍`], ['当前杠杆', current.leverage === null ? '资本非正，失去意义' : `${number(current.leverage)} 倍`], ['最终资本', number(target.equity)]]} />
    <p className="finance-note" role="status">{current.shrink === null
      ? '资本已耗尽或为负。按账面价值卖资产并偿债不会补回资本，需要处理损失或补充资本。'
      : `若不补资本，要恢复初始资本比例，在无额外折价且用变现款偿债的假设下，还需缩减资产 ${number(current.shrink)}。`}</p>
    <p className="goods-demo-note">账本单位均为同一教学单位。没有模拟挤兑、救助或真实监管规则；缩表测算先假设资产可以按当前账面价值出售，现实中的折价可能使情况更差。</p>
  </Lab>
}

const creditCases = [
  { label: '平静时', i: 4, pi: 2, x: 2 },
  { label: '风险上升', i: 4, pi: 2, x: 6 },
  { label: '降息仍未抵消', i: 2, pi: 2, x: 6 },
  { label: '零利率也吃力', i: 0, pi: 2, x: 8 },
  { label: '再遇通缩预期', i: 0, pi: -2, x: 8 },
]

export function CreditWedgeLab() {
  const [nominal, setNominal] = useState(4)
  const [inflation, setInflation] = useState(2)
  const [spread, setSpread] = useState(2)
  const [probability, setProbability] = useState(2)
  const policyReal = nominal - inflation
  const borrowing = policyReal + spread
  const state = macroState(150, borrowing)
  return <Lab name="credit-wedge-lab" title="中央银行降了息，老周为什么还嫌贷款贵？" intro="把政策利率、预期物价和信用利差放在同一张报价单上。下面的产出模型采用近似实际利率 i − 预期通胀，沿用上一讲的消费与投资关系。">
    <div className="quiz-choices" role="group" aria-label="信用环境情景">
      {creditCases.map(item => <button type="button" key={item.label} aria-pressed={nominal === item.i && inflation === item.pi && spread === item.x}
        onClick={() => { setNominal(item.i); setInflation(item.pi); setSpread(item.x) }}>{item.label}</button>)}
    </div>
    <Slider label="名义政策利率" value={nominal} min={0} max={5} step={.5} unit="%" onChange={setNominal} />
    <Slider label="预期通胀" value={inflation} min={-2} max={5} step={.5} unit="%" onChange={setInflation} />
    <Slider label="信用利差 x" value={spread} min={0} max={8} step={.5} unit="个百分点" onChange={setSpread} />
    <div className="finance-steps"><div>政策实际利率<br /><strong>{number(policyReal)}%</strong></div><div>加上信用利差<br /><strong>{number(spread)} 个百分点</strong></div><div>近似实际借款利率<br /><strong>{number(borrowing)}%</strong></div></div>
    <Metrics values={[["名义借款报价 i + x", `${number(nominal + spread)}%`], ['模型均衡产出 Y', number(state.Y)], ['模型投资 I', number(state.I)]]} />
    <p className="finance-note">对照起点：近似实际借款利率 4%，Y = 850，I = 150。当前 Y 变化 {number(state.Y - 850)}。降低政策利率并不保证信用利差也下降；真实借款还可能遭遇直接拒贷。</p>
    <details><summary>再算一步：违约概率怎样影响最低风险补偿？</summary>
      <Slider label="假设违约概率 p" value={probability} min={0} max={10} step={.5} unit="%" onChange={setProbability} />
      <p>若无风险名义利率为 {nominal}%，违约时回收为零，且投资者风险中性，使预期回款相等的利差为 {number(defaultPremium(nominal, probability))} 个百分点。</p>
      <p>这是独立的定价练习，不会自动修改上面的信用利差滑块；风险厌恶、回收率、流动性和中介成本也会影响现实利差。</p>
    </details>
    <p className="goods-demo-note">精确的借款实际利率应为 (1 + (i + x)/100) / (1 + 预期通胀/100) − 1。本面板用加减近似突出机制；大幅通胀时不能机械套用。所有参数均为假设。</p>
  </Lab>
}
