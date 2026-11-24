import { LAYERS, type LayerId } from '../../data/project'
import { Check, Layers } from './icons'

export function LayerRail({
  activeLayers,
  onToggle,
  onAll,
}: {
  activeLayers: Set<LayerId>
  onToggle: (layer: LayerId) => void
  onAll: () => void
}) {
  const allActive = LAYERS.every((layer) => activeLayers.has(layer.id))
  return (
    <aside className="layer-rail" aria-label="Capas de lectura del modelo">
      <div className="layer-rail__head">
        <span className="layer-rail__icon"><Layers size={14} /></span>
        <span>Capas de lectura</span>
        <button
          type="button"
          className={`layer-rail__all ${allActive ? 'is-active' : ''}`}
          onClick={onAll}
          aria-label="Mostrar todas las capas"
        >
          Todas
        </button>
      </div>
      <div className="layer-rail__list">
        {LAYERS.map((layer) => {
          const active = activeLayers.has(layer.id)
          return (
            <button
              key={layer.id}
              type="button"
              className={`layer-row ${active ? 'is-active' : ''}`}
              onClick={() => onToggle(layer.id)}
              aria-pressed={active}
              aria-label={`${active ? 'Ocultar' : 'Mostrar'} capa ${layer.name}`}
              title={layer.name}
              style={{ '--layer-color': layer.color } as React.CSSProperties}
            >
              <span className="layer-row__dot" />
              <span className="layer-row__text">
                <span className="layer-row__name">{layer.tab}</span>
                <span className="layer-row__desc">{layer.name}</span>
              </span>
              <span className={`layer-row__check ${active ? 'is-on' : ''}`}>
                {active && <Check size={10} />}
              </span>
            </button>
          )
        })}
      </div>
      <p className="layer-rail__foot">Filtra las balizas del lienzo. Cualquier baliza abre su evidencia.</p>
    </aside>
  )
}
