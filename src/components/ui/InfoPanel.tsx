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
import { ArrowLeft, ArrowUpRight, Close, Globe, Layers } from './icons'

function splitTitle(name: string) {
  const words = name.split(' ')
  const last = words.pop() ?? name
  return { lead: words.join(' '), last }
}

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
            <Close size={16} />
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

function ZoneTabs({
  active,
  onChange,
  zone,
}: {
  active: LayerId
  onChange: (layer: LayerId) => void
  zone: Zone
}) {
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
          <span className="panel-tab__label">{layer.tab}</span>
          <span className="panel-tab__count">{zone.content[layer.id].entries.length}</span>
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
  const { lead, last } = splitTitle(zone.name)
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
        <h2 className="panel__title">
          {lead} <em>{last}</em>
        </h2>
        <p className="panel__summary">{zone.summary}</p>
        <div className="panel__links">
          <button type="button" className="cloud-chip" onClick={() => onSelect({ type: 'cloud', cloud: zone.cloud })}>
            <span className="cloud-chip__dot" style={{ background: cloud.accent }} />
            {cloud.name}
            <ArrowUpRight size={12} />
          </button>
          <span className={`panel__layer-pill ${layer.id}`}>
            <Layers size={11} />
            {layer.short}
          </span>
        </div>
      </div>

      <ZoneTabs active={tab} onChange={setTab} zone={zone} />

      <div className="panel__body" ref={bodyRef} role="tabpanel" aria-label={layer.name}>
        <div className="layer-head" style={{ '--layer-color': layer.color } as React.CSSProperties}>
          <span className="layer-head__dot" />
          <span>{layer.name}</span>
          <span className="layer-head__count">
            {zone.content[tab].entries.length} registros
          </span>
        </div>
        <p className="panel__intro">{zone.content[tab].intro}</p>
        <EntryList entries={zone.content[tab].entries} color={layer.color} />
        <div className="panel__note">
          <span>Lectura en el lienzo</span>
          <p>
            Las balizas de esta capa están visibles en el lienzo. También puedes filtrar capas en el panel izquierdo y
            explorar la ciudad libremente.
          </p>
        </div>
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
  const { lead, last } = splitTitle(cloud.name)
  return (
    <PanelShell accent={cloud.accent} onClose={onClose} label={cloud.name}>
      <div className="panel__head">
        <div className="panel__eyebrow">
          <span className="panel__index">{cloud.index}</span>
          <span className="panel__kicker">{cloud.region}</span>
        </div>
        <h2 className="panel__title">
          {lead} <em>{last}</em>
        </h2>
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
                <ArrowUpRight size={12} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="panel__body panel__body--cloud">
        <div className="chip-row">
          {cloud.chips.map((chip) => (
            <span className="chip" key={chip}>{chip}</span>
          ))}
        </div>
        <div className="layer-head" style={{ '--layer-color': cloud.accent } as React.CSSProperties}>
          <Globe size={13} />
          <span>Flujo, cómputo y régimen</span>
        </div>
        <EntryList entries={cloud.entries} color={cloud.accent} />
        <button type="button" className="panel__back" onClick={() => onSelect({ type: 'clouds' })}>
          <ArrowLeft size={13} />
          Ver las dos nubes
        </button>
      </div>
    </PanelShell>
  )
}

function CloudsOverview({ onClose, onSelect }: { onClose: () => void; onSelect: (selection: Selection) => void }) {
  return (
    <PanelShell accent="#7FB6FF" onClose={onClose} label="Arquitectura de nubes">
      <div className="panel__head">
        <div className="panel__eyebrow">
          <span className="panel__index">Arquitectura</span>
          <span className="panel__kicker">Edge en México · cómputo en el exterior</span>
        </div>
        <h2 className="panel__title">
          Dos nubes, <em>dos regímenes</em>
        </h2>
        <p className="panel__summary">
          La ciudad procesa en el borde lo urgente y en el exterior lo analítico. El T-MEC y el GDPR definen qué puede
          viajar, hacia dónde y bajo qué condiciones. Ningún flujo lícito sustituye la base constitucional de la
          recolección.
        </p>
      </div>

      <div className="panel__body panel__body--clouds">
        <div className="arch-flow">
          <div className="arch-edge">
            <span className="arch-edge__eyebrow">Edge · México</span>
            <strong>Municipio + concesionarias</strong>
            <small>LGPDPPSO · LFPDPPP</small>
          </div>
          <div className="arch-flow__divider">
            <span className="arch-flow__line" />
            <span className="arch-flow__label">Transferencia internacional</span>
            <span className="arch-flow__line" />
          </div>
          <div className="arch-clouds">
            {CLOUDS.map((cloud) => (
              <button
                key={cloud.id}
                type="button"
                className="arch-cloud"
                style={{ '--cloud-accent': cloud.accent } as React.CSSProperties}
                onClick={() => onSelect({ type: 'cloud', cloud: cloud.id })}
              >
                <span className="arch-cloud__name">{cloud.name}</span>
                <span className="arch-cloud__meta">
                  {cloud.zones.length === 2 ? 'Zonas A + B' : 'Zona C'} · {cloud.region}
                </span>
                <span className="arch-cloud__arrow"><ArrowUpRight size={13} /></span>
              </button>
            ))}
          </div>
        </div>

        <div className="cloud-list">
          {CLOUDS.map((cloud) => (
            <button
              key={cloud.id}
              type="button"
              className="cloud-card"
              style={{ '--cloud-accent': cloud.accent } as React.CSSProperties}
              onClick={() => onSelect({ type: 'cloud', cloud: cloud.id })}
            >
              <span className="cloud-card__head">
                <span className="cloud-card__index">{cloud.index}</span>
                <span className="cloud-card__region">{cloud.region}</span>
              </span>
              <span className="cloud-card__name">{cloud.name}</span>
              <span className="cloud-card__tagline">{cloud.tagline}</span>
              <span className="cloud-card__foot">
                <span className="chip-row">
                  {cloud.chips.slice(0, 2).map((chip) => (
                    <span className="chip chip--small" key={chip}>{chip}</span>
                  ))}
                </span>
                <span className="cloud-card__open">Abrir ficha <ArrowUpRight size={12} /></span>
              </span>
            </button>
          ))}
        </div>

        <div className="panel__note">
          <span>Lectura jurídica</span>
          <p>
            El T-MEC habilita el flujo de datos, pero no convalida la vigilancia. En la UE, la seudonimización y las
            cláusulas contractuales tipo sostienen una transferencia que México no puede amparar por adecuación.
          </p>
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
