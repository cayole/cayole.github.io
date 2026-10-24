import { useState } from 'react'
import './GoodsMarketDemo.css'

const choices = ['消费 C', '投资 I', '政府购买 G', '不直接计入这三项']
const questions = [
  { icon: '☕', title: '下班后，买一杯咖啡', answer: 0, explanation: '这是居民购买最终产品或服务，记为消费 C。喝掉的是咖啡，留下的是 GDP 中的一次最终购买。' },
  { icon: '▣', title: '面包店买一台全新的烤箱', answer: 1, explanation: '烤箱可以在以后持续帮助生产，属于新增固定资本，记为投资 I。面包店日常买面粉则是中间投入，不能再与最终面包重复计算。' },
  { icon: '⌂', title: '一家人购买新建住房', answer: 1, explanation: '住房在未来持续提供居住服务，国民收入核算将新住房计为住宅投资 I。不是只有公司才能进行这里的投资。' },
  { icon: '↗', title: '用积蓄买入已有公司的股票', answer: 3, explanation: '这笔买入本身改变金融资产的所有权，没有直接增加一台机器或一项当期服务。若另付经纪服务费，那项服务另行核算。' },
  { icon: '≋', title: '镇政府购买修路服务', answer: 2, explanation: '政府购买了一项本期生产的服务，直接形成政府购买 G。这里假设采购的是本镇生产的最终服务。' },
  { icon: '＋', title: '镇政府向居民发放生活补助', answer: 3, explanation: '转账时没有直接换取产品或服务，因此不是 G。它先增加居民可支配收入；居民之后购买产品时，再形成 C。' },
]

export function SpendingQuiz() {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const question = questions[index]
  return (
    <section className="goods-demo spending-quiz" aria-label="支出分类小游戏">
      <header className="goods-demo-header">
        <span>TRY IT / 给小镇记一笔账</span>
        <h3>这笔钱，应该放进哪个篮子？</h3>
        <p>第 {index + 1} / {questions.length} 个生活情景。选一个答案，看看理由。</p>
      </header>
      <div className="quiz-scene"><span aria-hidden="true">{question.icon}</span><strong>{question.title}</strong></div>
      <div className="quiz-choices" role="group" aria-label="选择支出类别">
        {choices.map((choice, option) => (
          <button type="button" key={choice} aria-pressed={selected === option}
            onClick={() => setSelected(option)}>{choice}</button>
        ))}
      </div>
      <div className="quiz-feedback" role="status">
        {selected === null ? '先做判断，再揭晓答案。' : <>
          <strong>{selected === question.answer ? '判断正确。' : `再想一步：应选“${choices[question.answer]}”。`}</strong>
          <p>{question.explanation}</p>
        </>}
      </div>
      <div className="goods-demo-actions">
        <button type="button" onClick={() => { setIndex((index + 1) % questions.length); setSelected(null) }}>
          {index === questions.length - 1 ? '再玩一遍' : '下一个情景'}
        </button>
      </div>
    </section>
  )
}
