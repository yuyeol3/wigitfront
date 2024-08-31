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


// const staticTimeouts = []
export async function setProgressbar(newWidth) {
	const progressBar = document.getElementById("progress-bar");
	const currentWidth = progressBar.style.width == "" ? 0 : parseInt(progressBar.style.width);

	// 현재 넓이보다 새 넓이가 작은 경우
	if (currentWidth > newWidth) {
		progressBar.style.width = `${newWidth}%`;
		return;
	}

	// 현재 넓이보다 새 넓이가 큰 경우
	for (let i = currentWidth; i <= newWidth; ++i) {
		setTimeout(()=>{
			progressBar.style.width = `${i}%`;
		}, i*2);
	}

	// 끝나면 사라지게 처리
	if (newWidth >= 100) {
		setTimeout(()=>{
			progressBar.style.width = `${0}%`;
		}, (newWidth+1)*2);
	}

}