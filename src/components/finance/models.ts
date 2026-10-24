export function bondYield(price: number, face = 100) {
  return (face / price - 1) * 100
}

// Independent nominal-money example: Md = N(0.30 - 2i), i in decimals.
export function moneyMarket(income: number, supply: number) {
  const saturation = .3 * income
  return { rate: Math.max(0, (.3 - supply / income) / 2 * 100), excess: Math.max(0, supply - saturation), saturation }
}

// C=100+.6(Y-100); I=105+.1Y-1000b; b is a decimal borrowing rate.
export function macroState(G: number, borrowingPercent: number) {
  const Y = (145 + G - 10 * borrowingPercent) / .3
  const C = 100 + .6 * (Y - 100)
  const I = 105 + .1 * Y - 10 * borrowingPercent
  return { Y, C, I, G }
}

export function realRate(nominal: number, inflation: number) {
  return ((1 + nominal / 100) / (1 + inflation / 100) - 1) * 100
}

export function defaultPremium(safePercent: number, probabilityPercent: number) {
  const p = probabilityPercent / 100
  return (1 + safePercent / 100) * p / (1 - p) * 100
}

export function bankBalance(initialEquity: number, assetLoss: number) {
  const assets = 100 - assetLoss
  const debt = 100 - initialEquity
  const equity = assets - debt
  const targetRatio = initialEquity / 100
  return { assets, debt, equity, initialLeverage: 100 / initialEquity,
    leverage: equity > 0 ? assets / equity : null,
    shrink: equity > 0 ? Math.max(0, assets - equity / targetRatio) : null }
}
