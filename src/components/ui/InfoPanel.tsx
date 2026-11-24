import { useEffect, useRef, useState } from 'react'
import {
  CLOUDS,
  CLOUD_BY_ID,
  LAYERS,
  LAYER_BY_ID,
  ZONE_BY_ID,
  type Cloud,
  type LayerId,
  type Selection,
  type Zone,
} from '../../data/project'
import { ArrowLeft, ArrowUpRight, Close } from './icons'

function PanelShell({
  children,
  accent,
  onClose,
  label,
}: {
  children: React.ReactNode
  accent: string
  onClose: () => void
  label: string
}) {
  return (
    <aside
      className="panel"
      role="dialog"
      aria-label={label}
      style={{ '--panel-accent': accent } as React.CSSProperties}
    >
      <div className="panel__shell">
        <div className="panel__core">
          <div className="panel__handle" aria-hidden="true" />
          <button type="button" className="panel__close" onClick={onClose} aria-label="Cerrar ficha">
            <Close size={15} />
          </button>
          {children}
        </div>
      </div>
    </aside>
  )
}

function EntryList({ entries, color }: { entries: { title: string; body: string }[]; color: string }) {
  return (
    <div className="entries">
      {entries.map((entry) => (
        <article className="entry" key={entry.title} style={{ '--entry-color': color } as React.CSSProperties}>
          <div className="entry__title">
            <span className="entry__mark" />
            <h3>{entry.title}</h3>
          </div>
          <p>{entry.body}</p>
        </article>
      ))}
    </div>
  )
}

function ZoneTabs({ active, onChange }: { active: LayerId; onChange: (layer: LayerId) => void }) {
  return (
    <div className="panel__tabs" role="tablist" aria-label="Capas de la zona">
      {LAYERS.map((layer) => (
        <button
          key={layer.id}
          type="button"
          role="tab"
          aria-selected={active === layer.id}
          className={`panel-tab ${active === layer.id ? 'is-active' : ''}`}
          onClick={() => onChange(layer.id)}
          title={layer.name}
          style={{ '--tab-color': layer.color } as React.CSSProperties}
        >
          <span className="panel-tab__dot" />
          <span className="panel-tab__label">{layer.short}</span>
        </button>
      ))}
    </div>
  )
}

function ZonePanel({
  zone,
  initialLayer,
  onClose,
  onSelect,
}: {
  zone: Zone
  initialLayer?: LayerId
  onClose: () => void
  onSelect: (selection: Selection) => void
}) {
  const [tab, setTab] = useState<LayerId>(initialLayer ?? 'infra')
  const bodyRef = useRef<HTMLDivElement>(null)
  const layer = LAYER_BY_ID[tab]
  const cloud = CLOUD_BY_ID[zone.cloud]

  useEffect(() => {
    setTab(initialLayer ?? 'infra')
  }, [zone.id, initialLayer])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [tab])

  return (
    <PanelShell accent={zone.accent} onClose={onClose} label={`Zona ${zone.code}: ${zone.name}`}>
      <div className="panel__head">
        <div className="panel__eyebrow">
          <span className="panel__index">Zona {zone.code}</span>
          <span className="panel__kicker">{zone.kicker}</span>
        </div>
        <h2 className="panel__title">{zone.name}</h2>
        <p className="panel__summary">{zone.tagline}</p>
        <div className="panel__links">
          <button type="button" className="cloud-chip" onClick={() => onSelect({ type: 'cloud', cloud: zone.cloud })}>
            <span className="cloud-chip__dot" style={{ background: cloud.accent }} />
            {cloud.name}
            <ArrowUpRight size={11} />
          </button>
        </div>
      </div>

      <ZoneTabs active={tab} onChange={setTab} />

      <div className="panel__body" ref={bodyRef} role="tabpanel" aria-label={layer.name}>
        <div className="layer-head">
          <span className="layer-head__dot" style={{ background: layer.color }} />
          <span>{layer.name}</span>
        </div>
        <EntryList entries={zone.content[tab].entries} color={layer.color} />
      </div>
    </PanelShell>
  )
}

function CloudPanel({
  cloud,
  onClose,
  onSelect,
}: {
  cloud: Cloud
  onClose: () => void
  onSelect: (selection: Selection) => void
}) {
  return (
    <PanelShell accent={cloud.accent} onClose={onClose} label={cloud.name}>
      <div className="panel__head">
        <div className="panel__eyebrow">
          <span className="panel__index">{cloud.index}</span>
          <span className="panel__kicker">{cloud.region}</span>
        </div>
        <h2 className="panel__title">{cloud.name}</h2>
        <p className="panel__summary">{cloud.summary}</p>
        <div className="panel__links">
          {cloud.zones.map((zoneId) => {
            const zone = ZONE_BY_ID[zoneId]
            return (
              <button
                key={zoneId}
                type="button"
                className="cloud-chip"
                onClick={() => onSelect({ type: 'zone', zone: zoneId })}
              >
                <span className="cloud-chip__dot" style={{ background: zone.accent }} />
                Zona {zone.code}
                <ArrowUpRight size={11} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="panel__body">
        <div className="layer-head">
          <span className="layer-head__dot" style={{ background: cloud.accent }} />
          <span>Flujo y cómputo</span>
        </div>
        <EntryList entries={cloud.entries} color={cloud.accent} />
        <button type="button" className="panel__back" onClick={() => onSelect({ type: 'clouds' })}>
          <ArrowLeft size={12} />
          Volver a la arquitectura
        </button>
      </div>
    </PanelShell>
  )
}

function CloudsOverview({ onClose, onSelect }: { onClose: () => void; onSelect: (selection: Selection) => void }) {
  return (
    <PanelShell accent="#AEBBC1" onClose={onClose} label="Arquitectura de la ciudad">
      <div className="panel__head">
        <div className="panel__eyebrow">
          <span className="panel__index">Arquitectura</span>
          <span className="panel__kicker">Edge en México · cómputo internacional</span>
        </div>
        <h2 className="panel__title">Tres zonas, dos nubes</h2>
        <p className="panel__summary">
          Tres zonas geográficas conectadas a dos nubes internacionales: la nube de EE. UU. atiende las zonas A y B; la
          nube de la Unión Europea atiende la zona C.
        </p>
      </div>

      <div className="panel__body">
        <div className="arch">
          <div className="arch__edge">
            <span className="arch__label">Edge · México</span>
            <strong>Municipio y empresas privadas</strong>
            <span className="arch__meta">LGPDPPSO · LFPDPPP</span>
          </div>
          <div className="arch__connector" aria-hidden="true" />
          <div className="arch__clouds">
            {CLOUDS.map((cloud) => (
              <button
                key={cloud.id}
                type="button"
                className="arch__cloud"
                style={{ '--cloud-accent': cloud.accent } as React.CSSProperties}
                onClick={() => onSelect({ type: 'cloud', cloud: cloud.id })}
              >
                <span className="arch__cloud-code">{cloud.index}</span>
                <span className="arch__cloud-name">{cloud.name}</span>
                <span className="arch__cloud-meta">
                  {cloud.zones.length === 2 ? 'Zonas A y B' : 'Zona C'} · {cloud.region}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </PanelShell>
  )
}

export function InfoPanel({
  selection,
  onClose,
  onSelect,
}: {
  selection: Selection
  onClose: () => void
  onSelect: (selection: Selection) => void
}) {
  if (!selection) return null
  if (selection.type === 'zone') {
    return (
      <ZonePanel
        zone={ZONE_BY_ID[selection.zone]}
        initialLayer={selection.layer}
        onClose={onClose}
        onSelect={onSelect}
      />
    )
  }
  if (selection.type === 'cloud') {
    return <CloudPanel cloud={CLOUD_BY_ID[selection.cloud]} onClose={onClose} onSelect={onSelect} />
  }
  return <CloudsOverview onClose={onClose} onSelect={onSelect} />
}
