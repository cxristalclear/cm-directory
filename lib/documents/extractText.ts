import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import WordExtractor from 'word-extractor'
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

async function decodeDocBuffer(buffer: Buffer): Promise<string> {
  let tempDir: string | null = null
  try {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cm-doc-'))
    const tempFile = path.join(tempDir, 'upload.doc')
    await fs.writeFile(tempFile, buffer)

    const extractor = new WordExtractor()
    const document = await extractor.extract(tempFile)
    const bodyText = typeof document?.getBody === 'function' ? document.getBody() : ''
    const cleaned = cleanupWhitespace(bodyText ?? '')

    if (cleaned) {
      return cleaned
    }
  } catch (error) {
    console.warn('WordExtractor failed to parse .doc file, falling back to legacy decoding:', error)
  } finally {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => undefined)
    }
  }

  return decodeDocBufferLegacy(buffer)
}

function decodeDocBufferLegacy(buffer: Buffer): string {
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

export async function extractTextFromDocument(buffer: Buffer, fileName: string): Promise<string> {
  const extension = getExtension(fileName)

  if (!extension || !SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported file type. Supported extensions: ${DOCUMENT_EXTENSIONS.join(', ')}`)
  }

  if (extension === 'doc') {
    const extracted = await decodeDocBuffer(buffer)
    if (!extracted) {
      throw new Error('Unable to extract text from the uploaded .doc file.')
    }
    return extracted
  }

  const text = buffer.toString('utf8')
  const stripped = stripBom(text)
  return cleanupWhitespace(stripped)
}

export { DOCUMENT_TYPE_HINT as SUPPORTED_DOCUMENT_HINT }
