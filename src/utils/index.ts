import path from "node:path";

/**
 * A function that removes comment markup from a given string.
 *
 * @param {string} input - The input string with comment markup.
 * @return {string} - The input string without comment markup.
 */
export function getCommentBlock(input: string): string {
	const commentBlock = input.match(/\/\*\*?[\s\S]*?\*\//);
	return commentBlock !== null ? commentBlock[0] : input;
}

/**
 * A function that starts to capture the text after the first letter.
 *
 * @param {string} input - The input string with comment markup.
 * @return {string} - The input string without comment markup.
 */
export function removeCommentMarkup(input: string): string[] | null {
	return input.match(/[a-zA-Z].*/gm);
}

/**
 * Removes the markup from a comment string.
 *
 * @param {string} comment - The comment string to remove markup from.
 * @return {string} The comment text without the markers.
 */
export function stripTranslationMarkup(comment: string): string {
	const commentPattern =
		/\/\*\*?\s*(?:translators:)\s*([\s\S]*?)\s*\*\/|\/\/\s*(?:translators:)\s*(.*)$/i;
	const matches = comment.match(commentPattern);
	return matches ? matches[1] : comment;
}

/**
 * Splits a string into an array of strings based on the presence of a comma.
 *
 * @param {string} string - The string to be split.
 * @return {string[]} An array of strings after splitting the input string.
 */
export function stringstring(
	string: string | string[] | undefined,
): string[] | null {
	if (typeof string === "string") {
		if (string.includes(",")) {
			return string.split(",");
		}
		return [string];
	}
	return null;
}

/**
 * Determines if a pattern represents a file, a directory, or a glob pattern.
 * @param pattern - The pattern string to evaluate.
 * @returns 'file', 'directory', or 'glob'.
 */
export function detectPatternType(
	pattern: string,
): "file" | "directory" | "glob" {
	const containsFileExtension = pattern.includes(".");
	const containsDirectorySeparator = pattern.includes(path.sep);

	if (pattern.includes("*")) {
		return "glob";
	} else if (!containsFileExtension && !containsDirectorySeparator) {
		return "directory";
	} else if (containsFileExtension && !containsDirectorySeparator) {
		return "file";
	} else {
		return "glob";
	}
}

/**
 * Generates a copyright comment for the specified slug and license.
 *
 * @param {string} slug - The slug to include in the copyright comment
 * @param {string} [license='GPL v2 or later'] - The license to use in the copyright comment
 * @return {string} The generated copyright comment
 */
export function getCopyright(
	slug: string,
	license = "GPL v2 or later",
): string {
	return (
		`# Copyright (C) ${new Date().getFullYear()} ${slug}\n` +
		`# This file is distributed under the ${license} license.`
	)
}
