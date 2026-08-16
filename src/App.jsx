import { useEffect, useRef, useState } from 'react'
import onboarding from '../mockups/harbor-church-01-onboarding.png'
import homeCalendar from '../mockups/harbor-church-02-home-calendar.png'
import communityLive from '../mockups/harbor-church-03-community-live.png'
import profileAdmin from '../mockups/harbor-church-04-profile-admin.png'

const boards = [onboarding, homeCalendar, communityLive, profileAdmin]
const screenCenters = [
  [13.67, 37.81, 61.69, 85.71],
  [13.34, 37.76, 61.62, 85.61],
  [13.2, 37.57, 61.66, 85.95],
  [13.22, 37.57, 61.65, 86.0],
]
const slides = boards.flatMap((src, board) =>
  screenCenters[board].map((center) => ({ src, center })),
)

export default function App() {
  const carouselRef = useRef(null)
  const activeIndex = useRef(0)
  const [currentSlide, setCurrentSlide] = useState(0)
  const drag = useRef({ active: false, startX: 0, startScroll: 0 })

  const goTo = (index) => {
    const carousel = carouselRef.current
    const next = Math.max(0, Math.min(slides.length - 1, index))
    activeIndex.current = next
    setCurrentSlide(next)
    carousel.scrollTo({ left: next * carousel.clientWidth, behavior: 'smooth' })
  }

  useEffect(() => {
    const carousel = carouselRef.current

    const handleScroll = () => {
      activeIndex.current = Math.round(carousel.scrollLeft / carousel.clientWidth)
      setCurrentSlide(activeIndex.current)
    }

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') goTo(activeIndex.current + 1)
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') goTo(activeIndex.current - 1)
      if (event.key === 'Home') goTo(0)
      if (event.key === 'End') goTo(slides.length - 1)
    }

    carousel.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      carousel.removeEventListener('scroll', handleScroll)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const startDrag = (event) => {
    if (event.pointerType !== 'mouse') return
    const carousel = carouselRef.current
    drag.current = { active: true, startX: event.clientX, startScroll: carousel.scrollLeft }
    carousel.setPointerCapture(event.pointerId)
    carousel.classList.add('dragging')
  }

  const moveDrag = (event) => {
    if (!drag.current.active) return
    carouselRef.current.scrollLeft = drag.current.startScroll - (event.clientX - drag.current.startX)
  }

  const endDrag = (event) => {
    if (!drag.current.active) return
    const carousel = carouselRef.current
    drag.current.active = false
    carousel.classList.remove('dragging')
    carousel.releasePointerCapture(event.pointerId)
    const next = Math.round(carousel.scrollLeft / carousel.clientWidth)
    carousel.scrollTo({ left: next * carousel.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="carousel-shell">
      <main
        ref={carouselRef}
        className="carousel"
        aria-label="Harbor Church mobile app mockups"
        tabIndex="0"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {slides.map(({ src, center }, index) => (
          <section className="slide" key={`${src}-${center}`} aria-label={`Mockup ${index + 1} of ${slides.length}`}>
            <div className="image-frame">
              <img
                src={src}
                alt={`Harbor Church mobile app mockup ${index + 1}`}
                draggable="false"
                style={{ transform: `translate(-${center}%, -50%)` }}
              />
            </div>
          </section>
        ))}
      </main>

      <nav className="indicators" aria-label="Choose a mockup">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            className={index === currentSlide ? 'indicator active' : 'indicator'}
            aria-label={`Go to mockup ${index + 1}`}
            aria-current={index === currentSlide ? 'true' : undefined}
            onClick={() => goTo(index)}
          />
        ))}
      </nav>
    </div>
  )
}
