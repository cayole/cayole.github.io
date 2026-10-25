// All rates exposed to the UI are percentages, not decimals.
export function labourCounts(moved: number, leave: boolean) {
  const employed = 700 + (leave ? 0 : moved)
  const unemployed = 100 - moved
  const outside = 200 + (leave ? moved : 0)
  const force = employed + unemployed
  return { employed, unemployed, outside, force, unemployment: unemployed / force * 100,
    participation: force / 1000 * 100, employment: employed / 1000 * 100 }
}

// P=(1+m)W, A=1; W/P=1+z-2u when expected and actual prices coincide.
export function wagePrice(markupPercent: number, zPoints: number) {
  const realWage = 1 / (1 + markupPercent / 100)
  const natural = (1 + zPoints / 100 - realWage) / 2 * 100
  return { realWage, natural, employed: 1000 * (1 - natural / 100) }
}

export function inflationPath(unemployment: number, memory: number, periods = 6) {
  const rows = [{ period: 0, expected: 2, inflation: 2, price: 100 }]
  for (let period = 1; period <= periods; period++) {
    const previous = rows[period - 1]
    const expected = (1 - memory) * 2 + memory * previous.inflation
    const inflation = expected - .5 * (unemployment - 6)
    rows.push({ period, expected, inflation, price: previous.price * (1 + inflation / 100) })
  }
  return rows
}

export function pricePath(rates: number[]) {
  let price = 100
  return [price, ...rates.map(rate => { price *= 1 + rate / 100; return price })]
}

// New employment-compatible calibration: C=100+.6(Y-T), I=110+.1Y-600r, G=150.
export function mediumState(tax: number, rate: number, potential = 940) {
  const Y = (360 - .6 * tax - 6 * rate) / .3
  const C = 100 + .6 * (Y - tax)
  const I = 110 + .1 * Y - 6 * rate
  const unemployment = 100 * (1 - Y / 1000)
  const natural = 100 * (1 - potential / 1000)
  const pressure = -.5 * (unemployment - natural)
  return { Y, C, I, G: 150, unemployment, natural, potential, pressure,
    neutral: (360 - .6 * tax - .3 * potential) / 6 }
}

export type PolicyCase = 'heat' | 'tax' | 'energy'
export function policyPath(scenario: PolicyCase) {
  const plans = scenario === 'heat' ? [
    [100,3,940,'原来：订单与供给相容'], [100,2,940,'利率偏低，需求偏热'],
    [100,2,940,'继续维持，通胀再升'], [100,3,940,'回到中性，只停止加速'],
    [100,4,940,'暂时偏紧，通胀回落'], [100,4,940,'继续降温到原来通胀'], [100,3,940,'回到中性，稳定在 2%'],
  ] as const : scenario === 'tax' ? [
    [100,3,940,'原来：税收 100'], [110,3,940,'税收增加，利率未配合'],
    [110,2.5,940,'降息一半，缺口缩小'], [110,2,940,'恢复潜在产出，通胀不再降'],
  ] as const : [
    [100,3,940,'原来：潜在产出 940'], [100,3,900,'能源冲击，潜在产出降至 900'],
    [100,4,900,'提高利率，减小正缺口'], [100,5,900,'新中期均衡，不再加速'],
  ] as const
  let inflation = 2
  return plans.map(([tax,rate,potential,label], index) => {
    const state = mediumState(tax,rate,potential)
    if (index) inflation += state.pressure
    return { ...state, tax, rate, label, inflation }
  })
}

// Four-period bounded illustration; no claim of long-run forecasting or convergence.
export function deflationPath(anchored: boolean) {
  let previous = 0
  return Array.from({ length: 4 }, (_, index) => {
    const expected = anchored ? 0 : previous
    const real = -expected // nominal policy rate stays at zero; Fisher approximation.
    const Y = 930 - 20 * real // demand falls by 70 from Y=1000-20r.
    const inflation = expected + .05 * (Y - 940)
    previous = inflation
    return { period: index + 1, expected, real, Y, inflation, gap: Y - 940 }
  })
}
