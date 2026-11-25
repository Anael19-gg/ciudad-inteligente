import { useEffect, useState } from 'react'
import { PROJECT, ZONES, type Selection } from '../../data/project'
import { Close, Compass, Menu, Moon, Sun } from './icons'

interface HeaderProps {
  selection: Selection
  onSelect: (selection: Selection) => void
  onHome: () => void
  onShowIntro: () => void
  day: boolean
  onToggleDay: () => void
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

export function Header({ selection, onSelect, onHome, onShowIntro, day, onToggleDay }: HeaderProps) {
  const [time, setTime] = useState(clockLabel())
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const interval = window.setInterval(() => setTime(clockLabel()), 15000)
    return () => window.clearInterval(interval)
  }, [])

  const activeZone = selection?.type === 'zone' ? selection.zone : null
  const cloudsActive = selection?.type === 'cloud' || selection?.type === 'clouds'

  if (hidden) {
    return (
      <button
        type="button"
        className="topbar-reopen"
        onClick={() => setHidden(false)}
        title="Mostrar barra de navegación"
      >
        <Menu size={14} />
        <span>Mostrar barra</span>
      </button>
    )
  }

  return (
    <header className="topbar" id="topbar">
      <button type="button" className="brand" onClick={onHome} aria-label="Volver a la vista general">
        <span className="brand__mark" aria-hidden="true">
          <span className="brand__ring" />
          <span className="brand__dot" />
        </span>
        <span className="brand__text">
          <span className="brand__title">
            Control<em>City</em>
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

      <div className="topbar__end">
        <button
          type="button"
          className="portada-btn"
          onClick={onShowIntro}
          title="Volver a la portada"
        >
          <Compass size={13} />
          <span>Portada</span>
        </button>

        <button
          type="button"
          className="day-toggle"
          onClick={onToggleDay}
          aria-pressed={day}
          aria-label={day ? 'Cambiar a vista nocturna' : 'Cambiar a vista diurna'}
        >
          {day ? <Moon size={13} /> : <Sun size={13} />}
          <span>{day ? 'Noche' : 'Día'}</span>
        </button>

        <div className="status" aria-label="Hora local">
          <span className="status__time">{time}</span>
          <span className="status__place">Mexicali, B.C.</span>
        </div>

        <button
          type="button"
          className="topbar__hide"
          onClick={() => setHidden(true)}
          aria-controls="topbar"
          title="Ocultar barra de navegación"
        >
          <Close size={13} />
        </button>
      </div>
    </header>
  )
}
