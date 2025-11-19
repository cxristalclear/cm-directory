export const DOCUMENT_EXTENSIONS = ['md', 'markdown', 'txt', 'doc'] as const

export const DOCUMENT_ACCEPT_ATTRIBUTE = DOCUMENT_EXTENSIONS.map(ext => `.${ext}`).join(',')

export const DOCUMENT_TYPE_HINT =
  '.md, .markdown, .txt, or .doc files (Markdown, plain text, or Microsoft Word 97-2003)'
