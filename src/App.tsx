import { useCallback, useEffect, useState } from 'react'
import { AtlasCanvas, type CameraView } from './components/scene/AtlasCanvas'
import { CreditsCard } from './components/ui/CreditsCard'
import { Header } from './components/ui/Header'
import { InfoPanel } from './components/ui/InfoPanel'
import { Intro } from './components/ui/Intro'
import { TourBar } from './components/ui/TourBar'
import {
  CLOUDS_VIEW,
  CLOUD_BY_ID,
  OVERVIEW_VIEW,
  TOUR,
  ZONE_BY_ID,
  type Selection,
} from './data/project'

const ARRIVAL_VIEW: CameraView = { pos: [0, 300, 560], target: [0, 6, -12] }

export default function App() {
  const [ready, setReady] = useState(false)
  const [introOpen, setIntroOpen] = useState(true)
  const [selection, setSelection] = useState<Selection>(null)
  const [camera, setCamera] = useState<CameraView>(ARRIVAL_VIEW)
  const [nonce, setNonce] = useState(0)
  const [tourIndex, setTourIndex] = useState(0)
  const [mode, setMode] = useState<'tour' | 'free'>('tour')
  const [notesOpen, setNotesOpen] = useState(false)
  const [day, setDay] = useState(false)

  const flyTo = useCallback((view: CameraView) => {
    setCamera(view)
    setNonce((value) => value + 1)
  }, [])

  const handleSelect = useCallback(
    (next: Selection) => {
      setSelection(next)
      setMode('free')
      if (next?.type === 'zone') {
        flyTo(ZONE_BY_ID[next.zone].camera)
      } else if (next?.type === 'cloud') {
        flyTo(CLOUD_BY_ID[next.cloud].camera)
      } else if (next?.type === 'clouds') {
        flyTo(CLOUDS_VIEW)
      } else {
        flyTo(OVERVIEW_VIEW)
      }
    },
    [flyTo],
  )

  const goHome = useCallback(() => {
    setSelection(null)
    setMode('free')
    setNotesOpen(false)
    flyTo(OVERVIEW_VIEW)
  }, [flyTo])

  const goToStep = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(TOUR.length - 1, index))
      const step = TOUR[clamped]
      setTourIndex(clamped)
      setMode('tour')
      setSelection(step.selection)
      flyTo(step.view)
    },
    [flyTo],
  )

  const handlePrev = useCallback(() => {
    goToStep(mode === 'tour' ? tourIndex - 1 : tourIndex)
  }, [goToStep, mode, tourIndex])

  const handleNext = useCallback(() => {
    goToStep(mode === 'tour' ? tourIndex + 1 : tourIndex)
  }, [goToStep, mode, tourIndex])

  const handleResume = useCallback(() => {
    goToStep(tourIndex)
  }, [goToStep, tourIndex])

  const enter = useCallback(() => {
    setMode('tour')
    setTourIndex(0)
    setSelection(null)
    flyTo(OVERVIEW_VIEW)
  }, [flyTo])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (event.key === 'Escape' && selection) {
        setSelection(null)
        setMode('free')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selection])

  const step = TOUR[tourIndex]

  const showZoneLabels = !selection && !introOpen
  const showCloudLabels = (!selection || selection.type === 'clouds') && !introOpen

  return (
    <div className={`app ${selection ? 'has-panel' : ''} ${introOpen ? 'is-intro' : ''}`}>
      <div className="atmosphere" aria-hidden="true" />
      <AtlasCanvas
        view={camera}
        nonce={nonce}
        onSelect={handleSelect}
        onReady={() => setReady(true)}
        showZoneLabels={showZoneLabels}
        showCloudLabels={showCloudLabels}
        day={day}
      />

      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <div className="ui">
        <Header selection={selection} onSelect={handleSelect} onHome={goHome} day={day} onToggleDay={() => setDay((value) => !value)} />
        <CreditsCard />
        <TourBar
          step={step}
          stepIndex={tourIndex}
          mode={mode}
          notesOpen={notesOpen}
          selection={selection}
          onPrev={handlePrev}
          onNext={handleNext}
          onGoStep={goToStep}
          onToggleNotes={() => setNotesOpen((open) => !open)}
          onResume={handleResume}
        />
        {selection && (
          <InfoPanel
            selection={selection}
            onClose={() => setSelection(null)}
            onSelect={handleSelect}
          />
        )}
      </div>

      {introOpen && (
        <Intro
          ready={ready}
          onEnter={enter}
          onDone={() => setIntroOpen(false)}
        />
      )}
    </div>
  )
}
