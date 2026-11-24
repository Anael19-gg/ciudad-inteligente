export type MainSignal = 'green' | 'amber' | 'red'

export const AVENUE_SIGNALS = [-180, -140, -100, -62, -20, -6, 6, 20, 62, 100, 140, 180]

const CYCLE = 18
const OFFSET = 10

export function getMainSignal(elapsed: number): MainSignal {
  const time = (elapsed + OFFSET) % CYCLE
  if (time < 9) return 'green'
  if (time < 11) return 'amber'
  return 'red'
}
