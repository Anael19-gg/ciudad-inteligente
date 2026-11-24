import { Html } from '@react-three/drei'
import { ZONES, type Selection, type Zone } from '../../data/project'
import { ArrowUpRight } from '../ui/icons'

function ZoneTag({
  zone,
  onSelect,
  visible,
}: {
  zone: Zone
  onSelect: (selection: Selection) => void
  visible: boolean
}) {
  return (
    <Html
      position={zone.markerAnchor}
      center
      zIndexRange={[13, 0]}
      style={{ pointerEvents: 'none', display: visible ? undefined : 'none' }}
    >
      <button
        type="button"
        className="zone-tag"
        style={{ pointerEvents: 'auto', '--zone-accent': zone.accent } as React.CSSProperties}
        onClick={(event) => {
          event.stopPropagation()
          onSelect({ type: 'zone', zone: zone.id })
        }}
      >
        <span className="zone-tag__code">{zone.code}</span>
        <span className="zone-tag__body">
          <span className="zone-tag__name">{zone.name}</span>
          <span className="zone-tag__meta">{zone.kicker}</span>
        </span>
        <span className="zone-tag__arrow">
          <ArrowUpRight size={12} />
        </span>
      </button>
    </Html>
  )
}

export function Overlays({
  onSelect,
  showAnnotations,
}: {
  onSelect: (selection: Selection) => void
  showAnnotations: boolean
}) {
  return (
    <group>
      {ZONES.map((zone) => (
        <ZoneTag key={zone.id} zone={zone} onSelect={onSelect} visible={showAnnotations} />
      ))}
    </group>
  )
}
