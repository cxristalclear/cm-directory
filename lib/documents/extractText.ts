import { TextDecoder } from 'util'
import { DOCUMENT_EXTENSIONS, DOCUMENT_TYPE_HINT } from './constants'

type DocumentExtension = (typeof DOCUMENT_EXTENSIONS)[number]
const SUPPORTED_EXTENSIONS = new Set<DocumentExtension>(DOCUMENT_EXTENSIONS)

function getExtension(fileName: string): DocumentExtension | null {
  const parts = fileName.split('.')
  if (parts.length < 2) {
    return null
  }
  const candidate = parts.pop()?.trim().toLowerCase()
  if (!candidate) {
    return null
  }
  const matched = DOCUMENT_EXTENSIONS.find(ext => ext === candidate)
  return matched ?? null
}

function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1)
  }
  return text
}

function cleanupWhitespace(input: string): string {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function decodeDocBuffer(buffer: Buffer): string {
  const decoder = new TextDecoder('utf-16le', { fatal: false })
  let utf16Text = ''
  try {
    utf16Text = decoder.decode(buffer)
  } catch {
    utf16Text = ''
  }

  const asciiText = buffer.toString('latin1')

  const cleanedUtf16 = cleanupWhitespace(utf16Text)
  const cleanedAscii = cleanupWhitespace(asciiText)

  // Prefer the decode result with more meaningful (longer) content
  return cleanedUtf16.length >= cleanedAscii.length ? cleanedUtf16 : cleanedAscii
}

export function isSupportedDocument(fileName: string): boolean {
  const extension = getExtension(fileName)
  return extension !== null && SUPPORTED_EXTENSIONS.has(extension)
}

export function extractTextFromDocument(buffer: Buffer, fileName: string): string {
  const extension = getExtension(fileName)

  if (!extension || !SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error('Unsupported file type. Upload .md, .txt, or .doc files.')
  }

  if (extension === 'doc') {
    const extracted = decodeDocBuffer(buffer)
    if (!extracted) {
      throw new Error('Unable to extract text from the uploaded .doc file.')
    }
    return extracted
  }

  const text = buffer.toString('utf8')
  return stripBom(text)
}

export { DOCUMENT_TYPE_HINT as SUPPORTED_DOCUMENT_HINT }
