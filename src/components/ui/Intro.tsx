import { useRef, useState } from 'react'
import { PROJECT, ZONES } from '../../data/project'
import { ArrowRight } from './icons'

export function Intro({
  ready,
  onEnter,
  onDone,
}: {
  ready: boolean
  onEnter: () => void
  onDone: () => void
}) {
  const [leaving, setLeaving] = useState(false)
  const entered = useRef(false)

  const enter = () => {
    if (entered.current) return
    entered.current = true
    setLeaving(true)
    onEnter()
    window.setTimeout(onDone, 650)
  }

  return (
    <div className={`cover ${leaving ? 'is-leaving' : ''}`} role="dialog" aria-label="Portada del proyecto">
      <div className="cover__grid" aria-hidden="true" />

      <header className="cover__header">
        <div className="cover__institution">
          <span className="cover__uni">{PROJECT.university}</span>
          <span>{PROJECT.faculty}</span>
          <span>{PROJECT.program}</span>
        </div>
        <div className="cover__meta">
          <span>{PROJECT.subject}</span>
          <span>{PROJECT.activity} · {PROJECT.group}</span>
          <span>{PROJECT.date}</span>
        </div>
      </header>

      <div className="cover__main">
        <div className="cover__intro">
          <span className="cover__eyebrow">Recorrido interactivo</span>
          <h1 className="cover__title">
            Control
            <span>City</span>
          </h1>
          <p className="cover__subtitle">{PROJECT.subtitle}</p>
          <p className="cover__lede">
            Tres zonas geográficas conectadas a dos nubes internacionales. Un recorrido por la infraestructura, los
            riesgos y el marco legal de cada sector de la ciudad.
          </p>
          <p className="cover__conclusion">
            <span>Conclusión</span>
            La innovación urbana solo es válida si convive con los derechos humanos, la separación de regímenes
            público/privado, la evaluación de impacto y las transferencias internacionales legales.
          </p>

          <button type="button" className="cover__enter" onClick={enter}>
            <span>Entrar al recorrido</span>
            <ArrowRight size={15} />
          </button>

          <p className="cover__hint">
            Arrastra para mover la ciudad · Rueda o pinza para acercar
            <br />
            Abre una zona o una nube para consultar su ficha
            {!ready && <span className="cover__loading"> · Preparando el modelo</span>}
          </p>
        </div>

        <aside className="cover__aside">
          <div className="cover__team">
            <h2>Equipo</h2>
            <ul>
              {PROJECT.team.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>

          <div className="cover__teacher">
            <h2>Docente</h2>
            <strong>{PROJECT.docent}</strong>
          </div>

          <div className="cover__zones">
            <h2>Zonas del recorrido</h2>
            {ZONES.map((zone) => (
              <div className="cover__zone" key={zone.id} style={{ '--zone-accent': zone.accent } as React.CSSProperties}>
                <span className="cover__zone-code">{zone.code}</span>
                <span className="cover__zone-name">{zone.name}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <footer className="cover__footer">
        <span>{PROJECT.place}</span>
        <span>{PROJECT.faculty} · {PROJECT.university}</span>
        <span>{PROJECT.date}</span>
      </footer>
    </div>
  )
}
