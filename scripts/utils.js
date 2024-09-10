import { marked } from "marked";
import katex from "katex";

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

export async function diffContentParser(content) {

	// 1. @@ ~ @@ 파싱
	const result = []
	for (const line of content) {
		let processed = line;
		if (line.substring(0, 1) == "@") {
			let headInfo = "";
			for (const c of line.substring(2)) {
				if (c == "@")
					break;

				headInfo += c;
			}
			result.push(`@@ ${headInfo.trim()} @@`);
			processed = line.replace(`@@${headInfo}@@`, "");
		}

		result.push(processed);

	}
	return result;

}

/**
 * url의 argument를 파싱해주는 함수
 * @param {string} urlArgs 
 * @returns {object[string, string]} 파싱 결과
 */
export function urlArgParser(urlArgs) {
	const urlArgList = urlArgs.split("&");
	const result = {};
	for (const arg of urlArgList) {
		const keyVal = arg.split("=");
		const argName = keyVal[0];
		const argVal = keyVal[1];
		result[ argName ] = argVal;
	}

	return result;
}


function decodeHTMLEntities (str) {
	const tempDiv = document.createElement("div");

	tempDiv.innerHTML = str;
	const codes = tempDiv.querySelectorAll("code");
	
	codes.forEach((e)=>{
		e.innerHTML = e.innerHTML.replace(/&?amp;&?lt;/g, "&lt;");
		e.innerHTML = e.innerHTML.replace(/&amp;/g, "&");
	})
	// console.log(tempDiv.innerHTML);
	return tempDiv.innerHTML;
}

function latexCompile(str) {
	const toksCenter = RegExp("\\$\\$[^]+\\$\\$", "g").exec(str);
	const toks = RegExp("\\$[^]+\\$", "g").exec(str);
	if (toksCenter !== null) {
		for (const tok of toksCenter) {
			let res = tok.replace(/\$/g, "");
			// res = res.replace(/`/g, "");
			res = res.replace(/&lt;/g, "<");
			res = katex.renderToString(res, {
				throwOnError: false
			}),
			str = str.replace(tok, `<p style="text-align: center">${res}</p>`)
		}
	}

	
	if (toks !== null) {
		for (const tok of toks) {
			let res = tok.replace(/\$/g, "");
			// res = res.replace(/`/g, "");
			res = res.replace(/&lt;/g, "<");
			res = katex.renderToString(res, {
				throwOnError: false
			}),
			str = str.replace(tok, `<span>${res}</span>`)
		}
	}

	return str
}


export function parseMarkdown(content) {
	
	/** @type {[string]}*/
	const contentList = content.split("\n");
	const result = [];
	let codeMode = false;
	for (let line of contentList) {		
		// svg 관련 처리
		line = line.replace(/&gt;/g, ">");
		line = line.replace("></rect>", "/>");
		line = line.replace("></line>", "/>");
		line = line.replace("></circle>", "/>");
		line = line.replace("></path>", "/>");
		line = latexCompile(line);
		result.push(line);
	}
	let toParse = result.join("\n");
	toParse =  marked.parse(toParse)
	toParse = decodeHTMLEntities(toParse);

	return toParse;
}

