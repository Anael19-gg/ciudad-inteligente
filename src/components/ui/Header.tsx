import { useEffect, useState } from 'react'
import { PROJECT, ZONES, type Selection } from '../../data/project'

interface HeaderProps {
  selection: Selection
  onSelect: (selection: Selection) => void
  onHome: () => void
}

function clockLabel() {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Tijuana',
    }).format(new Date())
  } catch {
    return '--:--'
  }
}

export function Header({ selection, onSelect, onHome }: HeaderProps) {
  const [time, setTime] = useState(clockLabel())

  useEffect(() => {
    const interval = window.setInterval(() => setTime(clockLabel()), 15000)
    return () => window.clearInterval(interval)
  }, [])

  const activeZone = selection?.type === 'zone' ? selection.zone : null
  const cloudsActive = selection?.type === 'cloud' || selection?.type === 'clouds'

  return (
    <header className="topbar">
      <button type="button" className="brand" onClick={onHome} aria-label="Volver a la vista general">
        <span className="brand__mark" aria-hidden="true">
          <span className="brand__ring" />
          <span className="brand__dot" />
        </span>
        <span className="brand__text">
          <span className="brand__title">
            Ciudad <em>Inteligente</em>
          </span>
          <span className="brand__sub">
            {PROJECT.subject} · {PROJECT.activity}
          </span>
        </span>
      </button>

      <nav className="topnav" aria-label="Navegación del mapa">
        <button
          type="button"
          className={`topnav__item ${!selection ? 'is-active' : ''}`}
          onClick={onHome}
        >
          <span className="topnav__dot topnav__dot--atlas" />
          Vista general
        </button>
        {ZONES.map((zone) => (
          <button
            key={zone.id}
            type="button"
            className={`topnav__item ${activeZone === zone.id ? 'is-active' : ''}`}
            onClick={() => onSelect({ type: 'zone', zone: zone.id })}
          >
            <span className="topnav__dot" style={{ background: zone.accent }} />
            <span className="topnav__zone">Zona {zone.code}</span>
            <span className="topnav__label">{zone.name.split(' ')[0]}</span>
          </button>
        ))}
        <button
          type="button"
          className={`topnav__item ${cloudsActive ? 'is-active' : ''}`}
          onClick={() => onSelect({ type: 'clouds' })}
        >
          <span className="topnav__dot topnav__dot--cloud" />
          Nubes
        </button>
      </nav>

      <div className="status" aria-label="Hora local">
        <span className="status__time">{time}</span>
        <span className="status__place">Mexicali, B.C.</span>
      </div>
    </header>
  )
}
