import { useState } from 'react'
import { PROJECT } from '../../data/project'
import { Close, Info } from './icons'

export function CreditsCard() {
  const [open, setOpen] = useState(true)

  return (
    <>
      {!open && (
        <button
          type="button"
          className="credits-reopen"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-controls="credits-card"
          title="Mostrar ficha del proyecto"
        >
          <Info size={13} />
          <span>Ficha del proyecto</span>
        </button>
      )}

      {open && (
        <aside className="credits" id="credits-card" aria-label="Ficha del proyecto">
          <button
            type="button"
            className="credits__hide"
            onClick={() => setOpen(false)}
            aria-expanded
            aria-controls="credits-card"
            title="Ocultar ficha del proyecto"
          >
            <Close size={12} />
          </button>
          <div className="credits__inner">
            <span className="credits__uni">{PROJECT.university}</span>
            <span className="credits__fac">{PROJECT.faculty}</span>

            <div className="credits__subject">
              <span>{PROJECT.program}</span>
              <span>
                {PROJECT.subject} · {PROJECT.activity}
              </span>
            </div>

            <h2 className="credits__title">
              Ciudad <span>Inteligente</span>
            </h2>
            <p className="credits__subtitle">{PROJECT.subtitle}</p>

            <div className="credits__field">
              <span>Docente</span>
              <strong>{PROJECT.docent}</strong>
            </div>

            <div className="credits__field credits__field--team">
              <span>Equipo</span>
              <ul className="credits__team">
                {PROJECT.team.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>

            <div className="credits__foot">
              <span>{PROJECT.group}</span>
              <span>{PROJECT.place} · {PROJECT.date}</span>
            </div>
          </div>
        </aside>
      )}
    </>
  )
}
