export function formatPathToDotNotation(path) {
	return path.split("/").slice(1).join(".")
}

export function getBasePathFromHash(hash) {
	const basePath = hash.split("&")[0];
	console.log(basePath);
	return basePath.split("/").join(".")
}

export function convertDotNotationToPath(dotNotation) {
	const basePath = dotNotation.split("&")[0];
	const segments = basePath.split(".");
	return segments.length > 0 ? segments.join("/") : basePath;
}

export function getFirstSegment(path) {
	return path.split("/")[0];
}

export function setTitle(title) {
	const titleElement = document.querySelector("title");
	titleElement.innerText = title;
}
