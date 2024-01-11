import { prefixes, TRANSLATIONS_REGEX } from './const'
import { type Args, type TranslationString } from './types'
import { removeCommentMarkup } from './utils'

/**
 * Parse a POT file content and extract translations with associated data.
 *
 * @param {string} content - Content of the POT file.
 * @returns {Object} - Object containing extracted translations with data.
 */
export function extractTranslations (content: string) {
  const translations: Array<{ msgid: string, msgstr: string, msgctxt: string, comments: string, translationKey: string | null }> = []

  // Split content into individual translation entries
  const entries = content.split('\n\n')

  entries.forEach(entry => {
    let msgid = ''
    let msgstr = ''
    let msgctxt = ''
    let comments = ''

    // Extract msgid, msgstr, and other information
    const lines = entry.split('\n')
    lines.forEach(line => {
      if (line.startsWith('msgid')) {
        msgid = line.slice(6).trim()
      } else if (line.startsWith('msgstr')) {
        msgstr = line.slice(7).trim()
      } else if (line.startsWith('msgctxt')) {
        msgctxt = line.slice(8).trim()
      } else if (line.startsWith('#')) {
        comments += line.slice(2).trim() + '\n'
      }
    })

    // Check if the msgid starts with one of the specified prefixes
    for (const prefix in prefixes) {
      if (msgid.startsWith(prefix)) {
        // Extract a translation key
        const translationKey = prefixes[prefix as keyof typeof prefixes][0]

        // Create an object representing the translation with associated data
        const translationData = {
          msgid,
          msgstr,
          msgctxt,
          comments
        }

        // Add the translation to the translation array
        translations.push({ translationKey, ...translationData })
      }
    }
  })

  return translations
}

// Helper function to find the line number from a character index
function findLineNumber (charIndex: number, indexMap: Record<number, number>): number {
  let previousIndex = 0
  for (const startIndexOfLine in indexMap) {
    const currentIndex = parseInt(startIndexOfLine, 10)
    if (charIndex < currentIndex) {
      break
    }
    previousIndex = currentIndex
  }
  return indexMap[previousIndex]
}

/**
 * Parse a PHP or JS file content and extract translations with associated data.
 *
 * @param {string} content - Content of the PHP or JS file.
 * @param {string} filename - Filename of the PHP or JS file.
 * @param {Object} args - Command line arguments.
 * @returns {Object} - Object containing extracted translations with data.
 */
export function extractTranslationsFromCode (content: string, filename: string, args: Args): TranslationString[] {
  const translations: TranslationString[] = []
  const lines = content.split('\n')
  const lineIndex: Record<number, number> = {}

  // Build an index to map character positions to line numbers
  let cumulativeLength = 0
  lines.forEach((line, idx) => {
    lineIndex[cumulativeLength] = idx + 1
    cumulativeLength += line.length + 1 // +1 for the newline character
  })

  let match

  // Match all relevant strings using the regex on the entire content
  while ((match = TRANSLATIONS_REGEX.exec(content)) !== null) {
    const [_fullMatch, translatorComment = undefined, fnPrefix, msgid, , msgctxt] = match
    const matchIndex = match.index
    const lineNumber = findLineNumber(matchIndex, lineIndex)

    if (msgctxt && msgctxt.length >= 2) {
      if (msgctxt[1] !== args.slug) {
        console.log(`⚠️ The translation in ${filename} on line ${lineNumber} doesn't match the slug. ${msgctxt[1]} !== ${args.slug}`)
      }
    }

    translations.push({
      msgid,
      msgctxt,
      comments: translatorComment !== undefined ? removeCommentMarkup(translatorComment)?.trim() : undefined,
      reference: `#: ${filename}:${lineNumber}`
    })
  }

  // console.log('Found', translations.length, 'translations in', filename)

  return translations
}
