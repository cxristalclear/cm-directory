export const DOCUMENT_EXTENSIONS = ['md', 'markdown', 'txt', 'doc'] as const

export const DOCUMENT_ACCEPT_ATTRIBUTE = ['.md', '.markdown', '.txt', '.doc'].join(',')

export const DOCUMENT_TYPE_HINT =
  '.md, .txt, or .doc files (Markdown, plain text, or Microsoft Word 97-2003)'
