import { useState } from 'react'
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
  const [open, setOpen] = useState(false)
  const zonePoints = activeZone
    ? DOCUMENT_POINTS.filter((point) => point.zone === activeZone)
    : DOCUMENT_POINTS
  const allLayers = LAYERS.every((layer) => layers[layer.id])

  return (
    <aside className={`doc-legend ${open ? 'is-open' : 'is-closed'} ${active ? 'is-active' : 'is-off'}`} aria-label="Puntos del documento">
      <button
        type="button"
        className="doc-legend__pill"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="doc-legend-body"
        title={open ? 'Cerrar capas del documento' : 'Abrir capas del documento'}
      >
        <span className="doc-legend__pill-main">
          <span className="doc-legend__eyebrow">Puntos del documento</span>
          <span className="doc-legend__context">
            {activeZone ? `Zona ${ZONE_BY_ID[activeZone].code} · ${zonePoints.length} puntos` : `${DOCUMENT_POINTS.length} puntos en el mapa`}
          </span>
        </span>
        <span className="doc-legend__dots" aria-hidden="true">
          {LAYERS.map((layer) => (
            <span key={layer.id} className="doc-legend__pill-dot" style={{ background: layer.color }} />
          ))}
        </span>
      </button>

      {open && (
        <div className="doc-legend__body" id="doc-legend-body">
          <div className="doc-legend__head">
            <span className="doc-legend__eyebrow">Capas de lectura</span>
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
              ? 'Elige una capa de color para ver sus etiquetas. Toca un punto para abrir su ficha.'
              : 'Activa los puntos y las capas para leer el documento sobre el mapa.'}
          </p>
        </div>
      )}
    </aside>
  )
}
