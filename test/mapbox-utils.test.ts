import { 
  createSecurePopup, 
  createSanitizedPopup, 
  sanitizeUrl, 
  validatePopupData,
  safeExtractText,
  createPopupFromFacility
} from '../lib/mapbox-utils'

describe('Mapbox Security Utils', () => {
  describe('URL Sanitization', () => {
    test('should allow safe URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com')
      expect(sanitizeUrl('/companies/test')).toBe('/companies/test')
    })

    test('should block dangerous protocols', () => {
      expect(sanitizeUrl('javascript:void(0)')).toBeNull()
      expect(sanitizeUrl('data:text/html,<h1>Test</h1>')).toBeNull()
    })
  })

  describe('Data Validation', () => {
    test('should validate proper data', () => {
      const result = validatePopupData({
        title: 'Test Company',
        subtitle: 'Test Location'
      })
      expect(result).toEqual({
        title: 'Test Company',
        subtitle: 'Test Location'
      })
    })

    test('should reject invalid data', () => {
      expect(validatePopupData(null)).toBeNull()
      expect(validatePopupData({ title: null })).toBeNull()
    })
  })

  describe('Safe Text Extraction', () => {
    test('should extract text safely', () => {
      expect(safeExtractText('Hello World')).toBe('Hello World')
      expect(safeExtractText(null)).toBe('')
      expect(safeExtractText(123)).toBe('')
    })
  })
})
describe('Create Secure Popup', () => {
  test('should create popup with title only', () => {
    const popup = createSecurePopup({ title: 'Test' })
    expect(popup).toBeDefined()
  })
})

describe('Create Sanitized Popup', () => {
  test('should sanitize HTML content', () => {
    const popup = createSanitizedPopup('<h1>Test</h1>')
    expect(popup).toBeDefined()
  })
})

describe('Create Popup From Facility', () => {
  test('should handle facility data', () => {
    const popup = createPopupFromFacility({
      company: { company_name: 'Test', slug: 'test' },
      city: 'Boston',
      state: 'MA'
    })
    expect(popup).toBeDefined()
  })
})

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  (console.warn as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
});

it('blocks javascript: and data: URLs', () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  sanitizeUrl('javascript:void(0)');
  sanitizeUrl('data:text/html,<h1>Test</h1>');
  expect(warnSpy).toHaveBeenCalledTimes(2);
});