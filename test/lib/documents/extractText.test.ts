import { extractTextFromDocument, isSupportedDocument } from '@/lib/documents/extractText'

describe('extractTextFromDocument', () => {
  it('reads markdown files as utf-8 text', async () => {
    const buffer = Buffer.from('# Heading\n\nSome description.', 'utf8')
    const result = await extractTextFromDocument(buffer, 'company.md')
    expect(result).toBe('# Heading\n\nSome description.')
  })

  it('attempts to decode .doc buffers and strips control characters', async () => {
    const chars = ['K', '\u0000', 'o', '\u0000', 'd', '\u0000', 'i', '\u0000', 'a', '\u0000', 'k', '\u0000']
    const buffer = Buffer.from(chars.join(''), 'binary')
    const result = await extractTextFromDocument(buffer, 'profile.doc')
    expect(result.toLowerCase()).toContain('kodiak')
    expect(result).not.toMatch(/[\u0000-\u001F]/)
  })

  it('throws when file type is unsupported', async () => {
    await expect(extractTextFromDocument(Buffer.from('data'), 'info.pdf')).rejects.toThrow('Unsupported file type')
  })
})

describe('isSupportedDocument', () => {
  it('accepts allowed extensions', () => {
    expect(isSupportedDocument('notes.md')).toBe(true)
    expect(isSupportedDocument('notes.doc')).toBe(true)
  })

  it('rejects other extensions', () => {
    expect(isSupportedDocument('notes.pdf')).toBe(false)
    expect(isSupportedDocument('notes')).toBe(false)
  })
})
