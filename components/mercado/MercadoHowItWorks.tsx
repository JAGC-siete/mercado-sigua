import { useEffect, useId, useRef, useState } from 'react'
import { HelpCircle, X } from 'lucide-react'
import { MERCADO_HOW_IT_WORKS_STEPS } from '../../lib/mercado/how-it-works'
import styles from './mercado.module.css'

export default function MercadoHowItWorks() {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        className={styles.howTrigger}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <HelpCircle className="h-4 w-4" aria-hidden />
        <span>¿Cómo funciona?</span>
      </button>

      {open ? (
        <div
          className={styles.howOverlay}
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className={styles.howDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id={titleId} className={styles.sectionTitle} style={{ fontSize: '1.25rem' }}>
                Pedí y recogé en 3 pasos
              </h2>
              <button
                ref={closeRef}
                type="button"
                className={styles.howClose}
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ol className={styles.howSteps}>
              {MERCADO_HOW_IT_WORKS_STEPS.map((step) => (
                <li key={step.n}>
                  <span className={styles.howStepN} aria-hidden>
                    {step.n}
                  </span>
                  <div>
                    <p className={styles.howStepTitle}>{step.title}</p>
                    <p className={styles.howStepBody}>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}
    </>
  )
}
