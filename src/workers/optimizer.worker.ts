import { runOptimizer, type OptimizerInput } from '../lib/seating/optimizer'
import type { OptimizerResult } from '../types'

self.onmessage = (event: MessageEvent<OptimizerInput>) => {
  const result: OptimizerResult = runOptimizer(event.data)
  self.postMessage(result)
}
