import { useCallback, useRef, useState } from 'react'
import type { OptimizerResult } from '../types'
import { useSeatingStore } from '../store/useSeatingStore'

export function useOptimizer() {
  const [isRunning, setIsRunning] = useState(false)
  const workerRef = useRef<Worker | null>(null)

  const run = useCallback(
    (keepCurrentAssignment: boolean): Promise<OptimizerResult> => {
      const state = useSeatingStore.getState()
      const input = {
        guests: state.guests,
        groups: state.groups,
        tables: state.tables,
        constraints: state.constraints,
        weights: state.weights,
        keepCurrentAssignment,
        iterations: 6000,
        restarts: 4,
      }

      setIsRunning(true)

      return new Promise((resolve) => {
        try {
          const worker = new Worker(
            new URL('../workers/optimizer.worker.ts', import.meta.url),
            { type: 'module' },
          )
          workerRef.current = worker

          worker.onmessage = (event: MessageEvent<OptimizerResult>) => {
            setIsRunning(false)
            worker.terminate()
            workerRef.current = null
            resolve(event.data)
          }

          worker.onerror = () => {
            setIsRunning(false)
            worker.terminate()
            workerRef.current = null
            import('../lib/seating/optimizer').then(({ runOptimizer }) => {
              resolve(runOptimizer(input))
            })
          }

          worker.postMessage(input)
        } catch {
          import('../lib/seating/optimizer').then(({ runOptimizer }) => {
            const result = runOptimizer(input)
            setIsRunning(false)
            resolve(result)
          })
        }
      })
    },
    [],
  )

  const autoArrange = useCallback(async () => {
    const result = await run(false)
    useSeatingStore.getState().applyOptimizerResult(result.assignments)
    return result
  }, [run])

  const reseatUnlocked = useCallback(async () => {
    const result = await run(true)
    useSeatingStore.getState().applyOptimizerResult(result.assignments)
    return result
  }, [run])

  return { isRunning, autoArrange, reseatUnlocked }
}
