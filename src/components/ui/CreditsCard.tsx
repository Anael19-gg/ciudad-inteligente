import { PROJECT } from '../../data/project'

export function CreditsCard() {
  return (
    <aside className="credits" aria-label="Ficha del proyecto">
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
  )
}
