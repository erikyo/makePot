import { type Args } from './types'
import path from 'path'

/**
 * Generates a POT header for a given set of arguments.
 * https://developer.wordpress.org/cli/commands/i18n/make-pot/ ->
 * String that should be added as a comment to the top of the resulting POT file.
 * By default, a copyright comment is added for WordPress plugins and themes in the following manner:
 * `
 * Copyright (C) 2018 Example Plugin Author
 * This file is distributed under the same license as the Example Plugin package.
 * `
 * If a plugin or theme specifies a license in their main plugin file or stylesheet,
 * the comment looks like this: Copyright (C) 2018 Example Plugin Author This file is distributed under the GPLv2.
 *
 * @param {Args} args - The arguments object containing the headers and their values.
 * @return {string} The generated POT header.
 */
export function generateHeaderComments(args: Args): string {
	const { author, email, license } = {
		author: args.headers?.author ?? 'AUTHOR',
		email: args.headers?.email ?? 'EMAIL',
		license: args.headers?.license ?? 'gpl-2.0 or later',
	}

	return `# Copyright (C) ${new Date().getFullYear()} ${author} (${email})
# This file is distributed under the ${license}.`
}

/**
 * A function that removes comment markup from a given string.
 *
 * @param {string} input - The input string with comment markup.
 * @return {string} - The input string without comment markup.
 */
export function getCommentBlock(input: string): string {
	const commentBlock = input.match(/\/\*\*?[\s\S]*?\*\//)
	return commentBlock !== null ? commentBlock[0] : input
}

/**
 * A function that removes comment markup from a given string.
 *
 * @param {string} input - The input string with comment markup.
 * @return {string} - The input string without comment markup.
 */
export function removeCommentMarkup(input: string): string {
	return input.replace(/\/\*[\s\S]*?\*\/|\/\/.*/gm, '')
}

/**
 * Removes the markup from a comment string.
 *
 * @param {string} comment - The comment string to remove markup from.
 * @return {string} The comment text without the markers.
 */
export function stripTranslationMarkup(comment: string): string {
	// Match anything between the comment start `/**` and end `*/`, including `translators:`
	const commentPattern = /\/\*\*[\s]*translators:[\s]*(.*)[\s]*\*\//
	const matches = comment.match(commentPattern)

	// Return the first capture group, which is the comment text without the markers
	return matches ? matches[1].trim() : ''
}

/**
 * Splits a string into an array of strings based on the presence of a comma.
 *
 * @param {string} string - The string to be split.
 * @return {string[]} An array of strings after splitting the input string.
 */
export function stringstring(
	string: string | string[] | undefined
): string[] | null {
	if (typeof string === 'string') {
		if (string.includes(',')) {
			return string.split(',')
		}
		return [string]
	}
	return null
}

/**
 * Determines if a pattern represents a file, a directory, or a glob pattern.
 * @param pattern - The pattern string to evaluate.
 * @returns 'file', 'directory', or 'glob'.
 */
export function detectPatternType(
	pattern: string
): 'file' | 'directory' | 'glob' {
	const containsFileExtension = pattern.includes('.')
	const containsDirectorySeparator =
		pattern.includes(path.sep) || pattern.endsWith(path.sep)

	if (pattern.includes('*')) {
		return 'glob'
	} else if (!containsFileExtension && !containsDirectorySeparator) {
		return 'directory'
	} else if (containsFileExtension && !containsDirectorySeparator) {
		return 'file'
	} else {
		return 'glob'
	}
}

/**
 * Maps each path in the includePath array based on its type.
 *
 * @param {string[]} includePath - array of paths to be mapped
 * @return {string[]} mapped array of paths
 */
export function includeFunction(includePath: string[]) {
	return includePath.map((path) => {
		const type = detectPatternType(path)
		switch (type) {
			case 'directory':
				return path + '/**'
			case 'file':
				return '**/' + path
			default:
				return path
		}
	})
}
