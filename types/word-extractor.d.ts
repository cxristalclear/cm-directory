declare module 'word-extractor' {
  export interface WordExtractorDocument {
    getBody?: () => string
  }

  export default class WordExtractor {
    extract(filePath: string): Promise<WordExtractorDocument>
  }
}
