import { useCallback, useState } from 'react'
import { useContainer } from '../../infrastructure/di/DIProvider'

/** Imperative: the report is only built when the user asks to export it. */
export function useCloudReport() {
  const { generateCloudReport } = useContainer()
  const [isGenerating, setIsGenerating] = useState(false)

  const generate = useCallback(
    async (selectedRegionId: string) => {
      setIsGenerating(true)
      try {
        return await generateCloudReport.execute(selectedRegionId)
      } finally {
        setIsGenerating(false)
      }
    },
    [generateCloudReport],
  )

  return { generate, isGenerating }
}
