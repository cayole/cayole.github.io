export const DEMO_ROUNDS = 12

export function multiplier(c1: number) {
  return 1 / (1 - c1)
}

export function cumulativeOutput(spending: number, c1: number, rounds: number) {
  return spending * (1 - c1 ** rounds) / (1 - c1)
}

export function townEquilibrium(c0: number, G: number, T: number) {
  return (c0 + 150 + G - .6 * T) / .4
}

export function townConsumption(Y: number, c0: number, T: number) {
  return c0 + .6 * (Y - T)
}
