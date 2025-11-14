require('@testing-library/jest-dom')

jest.mock('mapbox-gl', () => {
  class Popup {
    addClassName() {
      return this
    }
    setDOMContent() {
      return this
    }
    setLngLat() {
      return this
    }
    addTo() {
      return this
    }
  }

  return {
    Popup: jest.fn(() => new Popup()),
  }
})

jest.mock('dompurify', () => {
  const sanitize = jest.fn((html) => html)
  return {
    __esModule: true,
    default: { sanitize },
    sanitize,
  }
})
