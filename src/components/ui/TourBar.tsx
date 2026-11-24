import {
  CLOUD_BY_ID,
  TOUR,
  ZONE_BY_ID,
  type Selection,
  type TourStep,
} from '../../data/project'
import { ChevronLeft, ChevronRight, Play } from './icons'

function freeCopy(selection: Selection) {
  if (!selection) {
    return {
      index: '—',
      title: 'Vista general',
      caption: 'Tres zonas, dos nubes y cuatro capas de lectura. Elige un distrito o entra al recorrido.',
    }
  }
  if (selection.type === 'zone') {
    const zone = ZONE_BY_ID[selection.zone]
    return {
      index: zone.index,
      title: zone.name,
      caption: `${zone.kicker} · Abre las capas de la ficha para ver la evidencia.`,
    }
  }
  if (selection.type === 'cloud') {
    const cloud = CLOUD_BY_ID[selection.cloud]
    return {
      index: cloud.index,
      title: cloud.name,
      caption: `${cloud.region} · ${cloud.tagline}`,
    }
  }
  return {
    index: 'C1 · C2',
    title: 'Arquitectura de nubes',
    caption: 'Dos regímenes jurídicos para un mismo flujo de datos.',
  }
}

export function TourBar({
  step,
  stepIndex,
  mode,
  selection,
  onPrev,
  onNext,
  onGoStep,
  onResume,
}: {
  step: TourStep
  stepIndex: number
  mode: 'tour' | 'free'
  selection: Selection
  onPrev: () => void
  onNext: () => void
  onGoStep: (index: number) => void
  onResume: () => void
}) {
  const free = freeCopy(selection)
  const title = mode === 'tour' ? step.title : free.title
  const caption = mode === 'tour' ? step.caption : free.caption
  const index = mode === 'tour' ? step.index : free.index
  const isFirst = stepIndex === 0
  const isLast = stepIndex === TOUR.length - 1

  return (
    <section className="tour" aria-label="Recorrido guiado">
      <div className="tour__shell">
        <div className="tour__core">
          <div className="tour__main">
            <div className="tour__eyebrow">
              {mode === 'tour' ? (
                <>
                  <span className="tour__pulse" />
                  Recorrido · {index} / 04
                </>
              ) : (
                <>
                  <span className="tour__pulse tour__pulse--free" />
                  Exploración libre
                </>
              )}
            </div>
            <div className="tour__copy">
              <h2 className="tour__title">{title}</h2>
              <p className="tour__caption">{caption}</p>
            </div>
          </div>

          <div className="tour__actions">
            {mode === 'free' && (
              <button type="button" className="resume-btn" onClick={onResume}>
                <Play size={13} />
                <span>Reanudar</span>
              </button>
            )}
            <div className="stepper">
              {mode === 'tour' && (
                <>
                  <button
                    type="button"
                    className="stepper__btn"
                    onClick={onPrev}
                    disabled={isFirst}
                    aria-label="Paso anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    className="stepper__btn stepper__btn--next"
                    onClick={onNext}
                    disabled={isLast}
                    aria-label="Paso siguiente"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="tour__steps" aria-label="Pasos del recorrido">
          {TOUR.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={`tour__step ${mode === 'tour' && i === stepIndex ? 'is-active' : ''}`}
              onClick={() => onGoStep(i)}
              aria-label={`Ir a ${item.label}`}
              aria-current={mode === 'tour' && i === stepIndex ? 'step' : undefined}
            >
              <span className="tour__step-bar" />
              <span className="tour__step-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
