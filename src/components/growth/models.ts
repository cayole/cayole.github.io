export function compoundPath(first: number, second: number, years = 40) {
  return Array.from({ length: years + 1 }, (_, year) => ({ year,
    first: 100 * (1 + first / 100) ** year, second: 100 * (1 + second / 100) ** year }))
}

export function basketComparison(exchange: number) {
  // Fictional Riverbend coins and Hilltown coupons per resident per month.
  return { riverConverted: 6000 / exchange, hillIncome: 3000,
    marketRatio: 6000 / exchange / 3000, riverBaskets: 6000 / 200,
    hillBaskets: 3000 / 100, basketRatio: (6000 / 200) / (3000 / 100), pppExchange: 200 / 100 }
}

export function capitalSteady(savingPercent: number, depreciationPercent = 10) {
  const s = savingPercent / 100, d = depreciationPercent / 100
  const capital = (s / d) ** 2, output = Math.sqrt(capital)
  return { capital, output, consumption: (1 - s) * output, replacement: d * capital }
}

export function capitalPath(savingPercent: number, depreciationPercent: number, initial = 1, periods = 40) {
  const s = savingPercent / 100, d = depreciationPercent / 100
  let capital = initial
  return Array.from({ length: periods + 1 }, (_, period) => {
    const output = Math.sqrt(capital), investment = s * output, replacement = d * capital
    const row = { period, capital, output, investment, replacement, consumption: (1-s)*output,
      net: investment - replacement }
    capital += row.net
    return row
  })
}

export function balancedPath(savingPercent: number, technologyPercent: number, populationPercent: number, years = 30) {
  const s = savingPercent / 100, a = technologyPercent / 100, n = populationPercent / 100
  const effectiveGrowth = (1+a)*(1+n)-1
  const required = .1 + effectiveGrowth
  const capitalPerEffective = (s / required) ** 2
  const outputPerEffective = Math.sqrt(capitalPerEffective)
  const rows = Array.from({ length: years+1 }, (_, year) => {
    const technology = (1+a)**year, workers = (1+n)**year
    return { year, technology, workers, outputPerWorker: technology*outputPerEffective,
      perWorkerIndex: 100*technology, totalIndex: 100*technology*workers }
  })
  return { required: required*100, effectiveGrowth: effectiveGrowth*100,
    capitalPerEffective, outputPerEffective, rows }
}

// theta is the CAPITAL share; A is labor-augmenting technology, not TFP.
export function growthAccounting(output: number, capital: number, labour: number, theta = 1/3) {
  const capitalContribution = theta*capital, labourContribution = (1-theta)*labour
  const residual = output-capitalContribution-labourContribution
  return { capitalContribution, labourContribution, residual,
    technology: residual/(1-theta), labourProductivity: output-labour }
}

export function productivityEmployment(productivityGrowth: number, outputGrowth: number, fraction = 1) {
  const productivity = 1 + productivityGrowth/100*fraction
  const output = 100*(1 + outputGrowth/100*fraction)
  const employment = output/productivity
  return { productivity, output, employment, employmentChange: employment-100 }
}

export function productivityWage(actualIndex: number, expectedIndex: number) {
  const actual = actualIndex/100, expected = expectedIndex/100
  const realWage = actual/1.1
  const raw = (1.03-realWage/expected)/2*100
  return { actual, expected, realWage, raw,
    unemployment: raw>=0 && raw<=100 ? raw : null }
}
