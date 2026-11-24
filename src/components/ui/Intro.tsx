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
    window.setTimeout(onDone, 920)
  }

  return (
    <div className={`intro ${leaving ? 'is-leaving' : ''}`} role="dialog" aria-label="Portada del atlas">
      <div className="intro__veil" />
      <div className="intro__grain" aria-hidden="true" />
      <div className="intro__inner">
        <div className="intro__main">
          <div className="intro__meta">
            <span>Proyecto final · Derecho y datos</span>
            <span className="intro__meta-sep" />
            <span>Noviembre 2026</span>
          </div>

          <h1 className="intro__title">
            <span className="intro__title-line">Ciudad</span>
            <span className="intro__title-line intro__title-line--em">Inteligente</span>
          </h1>

          <p className="intro__lede">
            Un atlas en <em>tres dimensiones</em> para recorrer la ciudad que decide con datos: su infraestructura, sus
            riesgos constitucionales, su marco legal y la propiedad de lo que la hace funcionar.
          </p>

          <div className="intro__actions">
            <button type="button" className="enter-btn" onClick={enter}>
              <span className="enter-btn__label">Entrar al recorrido</span>
              <span className="enter-btn__icon">
                <ArrowRight size={17} />
              </span>
            </button>
            <span className="intro__hint">
              Arrastra para orbitar · Rueda para acercar
              <br />
              Toca balizas, zonas y nubes para leer
              {!ready && (
                <span className="intro__loading">
                  <span className="intro__loading-dot" />
                  Preparando el modelo
                </span>
              )}
            </span>
          </div>
        </div>

        <aside className="intro__index" aria-label="Contenido del recorrido">
          <span className="intro__index-label">El territorio</span>
          <div className="intro__zones">
            {ZONES.map((zone) => (
              <div className="intro__zone" key={zone.id} style={{ '--zone-accent': zone.accent } as React.CSSProperties}>
                <span className="intro__zone-num">{zone.index}</span>
                <span className="intro__zone-copy">
                  <strong>{zone.name}</strong>
                  <span>{zone.kicker}</span>
                </span>
                <span className="intro__zone-dot" />
              </div>
            ))}
          </div>
          <div className="intro__clouds">
            <span className="intro__clouds-label">Cómputo</span>
            <span>Nube EE. UU.</span>
            <span className="intro__clouds-divider" />
            <span>Nube UE</span>
          </div>
        </aside>
      </div>

      <footer className="intro__footer">
        <div className="intro__footer-block">
          <span>Docente</span>
          <strong>{PROJECT.docent}</strong>
        </div>
        <div className="intro__footer-block">
          <span>Entrega</span>
          <strong>{PROJECT.date} · {PROJECT.year}</strong>
        </div>
        <div className="intro__footer-block intro__footer-block--right">
          <span>Modelo</span>
          <strong>03 distritos · 02 nubes · 04 capas</strong>
        </div>
      </footer>
    </div>
  )
}
