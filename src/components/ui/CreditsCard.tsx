import { useState } from 'react'
import { PROJECT } from '../../data/project'
import { Check, Edit } from './icons'

const STORAGE_KEY = 'ciudad-inteligente/creditos'

interface Credits {
  docent: string
  team: string[]
}

function readCredits(): Credits {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Credits>
      if (parsed.docent || parsed.team) {
        return {
          docent: parsed.docent || PROJECT.docent,
          team: Array.isArray(parsed.team) && parsed.team.length ? parsed.team : PROJECT.team,
        }
      }
    }
  } catch {
    // localStorage may be unavailable in private contexts
  }
  return { docent: PROJECT.docent, team: PROJECT.team }
}

export function CreditsCard() {
  const [credits, setCredits] = useState<Credits>(readCredits)
  const [editing, setEditing] = useState(false)
  const [draftDocent, setDraftDocent] = useState(credits.docent)
  const [draftTeam, setDraftTeam] = useState(credits.team.join('\n'))

  const beginEdit = () => {
    setDraftDocent(credits.docent)
    setDraftTeam(credits.team.join('\n'))
    setEditing(true)
  }

  const save = () => {
    const team = draftTeam
      .split(/[\n,]/)
      .map((name) => name.trim())
      .filter(Boolean)
    const next = {
      docent: draftDocent.trim() || PROJECT.docent,
      team: team.length ? team : PROJECT.team,
    }
    setCredits(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore storage failures
    }
    setEditing(false)
  }

  return (
    <aside className="credits" aria-label="Ficha del proyecto">
      <div className="credits__shell">
        <div className="credits__core">
          <div className="credits__head">
            <span className="credits__kicker">
              <span className="credits__dot" />
              Ficha del proyecto
            </span>
            {!editing && (
              <button type="button" className="credits__edit" onClick={beginEdit} aria-label="Editar créditos del proyecto">
                <Edit size={12} />
                Editar
              </button>
            )}
          </div>

          {editing ? (
            <div className="credits__form">
              <label>
                <span>Docente</span>
                <input value={draftDocent} onChange={(event) => setDraftDocent(event.target.value)} />
              </label>
              <label>
                <span>Integrantes — uno por línea</span>
                <textarea rows={4} value={draftTeam} onChange={(event) => setDraftTeam(event.target.value)} />
              </label>
              <div className="credits__form-actions">
                <button type="button" className="credits__save" onClick={save}>
                  <Check size={12} />
                  Guardar
                </button>
                <button type="button" className="credits__cancel" onClick={() => setEditing(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="credits__title">
                Ciudad <em>Inteligente</em>
              </h2>
              <p className="credits__subtitle">Arquitectura de datos, territorio y derecho</p>
              <dl className="credits__meta">
                <div>
                  <dt>Docente</dt>
                  <dd>{credits.docent}</dd>
                </div>
                <div>
                  <dt>Equipo</dt>
                  <dd>
                    {credits.team.map((name) => (
                      <span key={name}>{name}</span>
                    ))}
                  </dd>
                </div>
              </dl>
              <div className="credits__foot">
                <span>{PROJECT.place}</span>
                <span>{PROJECT.date}, {PROJECT.year}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
