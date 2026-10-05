interface FlowParticlesProps {
  pathD: string
  color: string
  durationSeconds: number
  count?: number
}

/** Small arrow markers traveling along an SVG path (native SMIL animateMotion), looping
 *  forever. Several staggered per line so traffic reads as a continuous stream rather
 *  than a single dot doing laps. */
export function FlowParticles({ pathD, color, durationSeconds, count = 2 }: FlowParticlesProps) {
  if (!pathD) return null

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <path key={index} d="M-4,-3 L4,0 L-4,3 Z" fill={color} opacity={0.9}>
          <animateMotion
            path={pathD}
            dur={`${durationSeconds}s`}
            begin={`${(index * durationSeconds) / count}s`}
            repeatCount="indefinite"
            rotate="auto"
          />
        </path>
      ))}
    </>
  )
}
