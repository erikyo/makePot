import { GetTextTranslation } from 'gettext-parser'
import type { TranslationStrings } from '../types'
import { getJsonComment } from './json'

/**
 * Returns the key of an object based on its value
 *
 * @param object the object that contains the key
 * @param value the key that we want to get
 * @return {Record<string, string>} the filtered keys
 */
export function getKeyByValue(
	object: Record<string, unknown>,
	value: string
): string | undefined {
	return Object.keys(object).find((key) => object[key] === value) ?? undefined
}

/**
 * returns a gettext translation object
 *
 * @param label the label of the translation
 * @param string the string of the translation
 * @param filePath the file path of the translation
 */
export const gentranslation = (
	label: string,
	string: string,
	filePath?: string | undefined
): GetTextTranslation => {
	return {
		msgctxt: undefined,
		msgid: string,
		msgid_plural: '',
		msgstr: [],
		comments: {
			extracted: label,
			reference: filePath,
		} as GetTextTranslation['comments'],
	}
}

/**
 * Extracts strings from parsed JSON data.
 *
 * @param {Record<string, any> | Parser.SyntaxNode} parsed - The parsed JSON data or syntax node.
 * @param {string | Parser} filename - The filename or parser.
 * @param filepath - the path to the file being parsed
 * @return {TranslationStrings[]} An array of translation strings.
 */
export function yieldParsedData(
	parsed: Record<string, string | string[]>,
	filename: 'block.json' | 'theme.json' | 'readme.txt',
	filepath: string
): TranslationStrings {
	if (!parsed) {
		return {}
	}
	const gettextTranslations: TranslationStrings = {}

	Object.entries(parsed).forEach(([term, item]) => {
		/**
		 * Stores a translation in the gettextTranslations object
		 *
		 * @param value The translation string to store
		 * @param valueKey The key of the translation
		 */
		function storeTranslation(value: string, valueKey: string = term) {
			const entry = gentranslation(
				getJsonComment(term, filename),
				valueKey,
				filepath
			)

			gettextTranslations[entry.msgctxt ?? ''] = {
				...(gettextTranslations[entry.msgctxt ?? ''] || {}),
				[entry.msgid]: entry,
			}
		}

		if (!item) {
			return
		} else if (typeof item === 'string') {
			storeTranslation(item)
		} else if (Array.isArray(item)) {
			item.forEach((value) => storeTranslation(value))
		} else {
			Object.entries(item).forEach(([key, value]) => {
				if (typeof value === 'string') {
					storeTranslation(value, key)
				}
			})
		}
	})

	return gettextTranslations
}
