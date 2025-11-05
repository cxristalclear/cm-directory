require('@testing-library/jest-dom')

// Mock mapboxgl
jest.mock('mapbox-gl', () => ({
  Popup: jest.fn(() => ({
    setDOMContent: jest.fn().mockReturnThis(),
  }))
}))

// Mock DOMPurify
jest.mock('dompurify', () => ({
  default: {
    sanitize: jest.fn((html) => html)
  }
}))