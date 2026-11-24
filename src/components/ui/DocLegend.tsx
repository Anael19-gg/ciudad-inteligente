import { DOCUMENT_POINTS } from '../../data/annotations'
import { LAYERS, ZONE_BY_ID, type LayerId, type ZoneId } from '../../data/project'

export function DocLegend({
  active,
  activeZone,
  layers,
  onToggle,
  onToggleLayer,
  onShowAll,
}: {
  active: boolean
  activeZone: ZoneId | null
  layers: Record<LayerId, boolean>
  onToggle: () => void
  onToggleLayer: (layer: LayerId) => void
  onShowAll: () => void
}) {
  const zonePoints = activeZone
    ? DOCUMENT_POINTS.filter((point) => point.zone === activeZone)
    : DOCUMENT_POINTS
  const allLayers = LAYERS.every((layer) => layers[layer.id])

  return (
    <aside className={`doc-legend ${active ? 'is-active' : 'is-off'}`} aria-label="Puntos del documento">
      <div className="doc-legend__head">
        <span className="doc-legend__eyebrow">Puntos del documento</span>
        <button
          type="button"
          className="doc-legend__toggle"
          onClick={onToggle}
          aria-pressed={active}
          title={active ? 'Ocultar puntos y etiquetas' : 'Mostrar puntos y etiquetas'}
        >
          {active ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      <p className="doc-legend__context">
        {activeZone ? `Zona ${ZONE_BY_ID[activeZone].code} · ${zonePoints.length} puntos` : `${DOCUMENT_POINTS.length} puntos en el mapa`}
      </p>
      <div className="doc-legend__rows">
        {LAYERS.map((layer) => {
          const count = zonePoints.filter((point) => point.layer === layer.id).length
          return (
            <button
              key={layer.id}
              type="button"
              className={`doc-legend__row ${layers[layer.id] ? 'is-on' : ''}`}
              onClick={() => onToggleLayer(layer.id)}
              aria-pressed={layers[layer.id]}
              title={`${layer.name}: ${count} puntos`}
              style={{ '--layer-color': layer.color } as React.CSSProperties}
            >
              <span className="doc-legend__dot" />
              <span className="doc-legend__name">{layer.short}</span>
              <span className="doc-legend__count">{count}</span>
            </button>
          )
        })}
      </div>
      <button type="button" className="doc-legend__all" onClick={onShowAll} disabled={allLayers}>
        {allLayers ? 'Todas las capas visibles' : 'Ver todas las capas'}
      </button>
      <p className="doc-legend__hint">
        {active
          ? 'Activa una capa de color para ver sus etiquetas. Toca un punto para abrir su ficha.'
          : 'Activa los puntos y las capas para leer el documento sobre el mapa.'}
      </p>
    </aside>
  )
}
