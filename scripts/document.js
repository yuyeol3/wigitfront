import { diffContentParser, setTitle, urlArgParser } from './utils.js';
import { StatusMessages } from './constants.js';
import { convertDotNotationToPath, getBasePathFromHash } from './utils.js';
// import { handleNotFoundError } from './error.js';
import { fetchDocument, fetchDocumentData, updateDocument, createDocument, removeDocument, fetchDocumentHistory, diff } from './api.js';
import { marked } from "marked";
import * as imageDoc from "./imageDoc.js";


export function page404() {
	setTitle("404");
	const errorMessage = `
    <h1>오류 : 페이지를 찾을 수 없습니다.</h1>
    <a href="./#">홈으로</a>
  `;
	document.getElementById("content").innerHTML = errorMessage;

	const addDocumentLink = document.createElement("a");
	addDocumentLink.innerHTML = "이 문서 추가";
	addDocumentLink.setAttribute("href", `./#add/${location.hash.replace("#w/","")}`);
	document.getElementById("content").appendChild(addDocumentLink);
}

/**
 * 
 * @param {string} hash 
 * @returns 
 */
export async function loadDocument(hash) {
	// 이미지인 경우 이미지 함수로 넘겨주기
	if (decodeURI(hash).substring(0, 7) == "image::") {
		imageDoc.loadImage(hash);
		return;
	}

	const docu = await fetchDocument(hash);
	let parsedContent;

	// 리다이렉션 명령인 경우
	if (docu.status == StatusMessages.DOC_REDIRECT) {
		location.hash = `#w/${docu.content}`;
		return;
	}

	if (docu.status != StatusMessages.DOC_NOT_EXIST) {
		parsedContent = marked.parse(docu.content);
	} else {
		page404();
		return;
	}
		
	const contentHtml = `
        <h1>${convertDotNotationToPath(decodeURI(hash))}</h1>
        <a href="./#edit/${convertDotNotationToPath(hash)}">수정하기</a>
        <a href="./#history/${convertDotNotationToPath(hash)}">히스토리 보기</a>
        <a href="javascript:null;" id="deleteThis">삭제하기</a>
    `;
	document.getElementById("content").innerHTML = contentHtml + parsedContent;
	document.getElementById("deleteThis").onclick = () => {deleteDocument(hash)};
	setTitle(`WIGIT : ${convertDotNotationToPath(decodeURI(hash))}`);
}

export async function editDocument(hash) {
	const documentData = await fetchDocument(hash);
	if (documentData.status == StatusMessages.DOC_NOT_EXIST) {
		loadDocument(hash);
		return;
	}
	documentData.doc_title = convertDotNotationToPath(documentData.doc_title);

	setTitle(`${decodeURI(hash)} 수정`);
	const editHtml = `
      <h1>문서 수정</h1>
	  <h2>제목</h2>
      <input placeholder="제목" id="doc-title">
	  <h2>문서 내용 <button id="preview">결과 미리보기</button></h2>
      <textarea id='edit'></textarea>
      <h2>리디렉션</h2>
	  <input id="redirections" placeholder="리디렉션 목록">
	  
	  <button id='upload'>업로드</button>
	  <dialog id="preview-dialog">
	 	<p><button id="close-dialog">X</button> 결과 미리보기</p>
	 	<div id="preview-content"></div>
	  </dialog>
    `;
	document.getElementById("content").innerHTML = editHtml;
	
	/** @type {HTMLElement} 업로드 버튼 */
	const uploadButton = document.getElementById("upload");
	/** @type {HTMLElement} 문서 입력 textarea */
	const editTextarea = document.getElementById("edit");
	/** @type {HTMLElement} redirection 입력 input */
	const redirectInput = document.getElementById("redirections");
	/** @type {HTMLElement} title 입력 input */
	const doctitleInput = document.getElementById("doc-title");
	/** @type {HTMLElement} preview 보기 버튼 */
	const previewButton = document.getElementById("preview");
	/** @type {HTMLElement} preview dialog */
	const previewDialog = document.getElementById("preview-dialog");
	/** @type {HTMLElement} 결과 미리보기 content div */
	const previewContentDiv = document.getElementById("preview-content");
	/** @type {HTMLElement} dialog 닫기 */
	const closePreviewButton = document.getElementById("close-dialog");

	editTextarea.innerHTML = documentData.content;  // 문서 내용 넣어주기
	redirectInput.value = documentData.redirections  // redirection 내용 넣어주기
	doctitleInput.value = documentData.doc_title;  // title 넣어주기
	let documentHash = documentData.head_hash;  // hash는 head의 hash로 설정

	// tab 입력 시 들여쓰기 추가
	editTextarea.onkeydown = function(e) {
		if (e.key == "Tab") {
			e.preventDefault();
			
			/** @type {HTMLElement} */
			const textarea = this;
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			
			textarea.value = textarea.value.substring(0, start) + "  " + textarea.value.substring(end);
			textarea.selectionStart = textarea.selectionEnd = start + 2;
		}
	}

	// 모달 창 보여주기
	previewButton.onclick = () => {
		previewDialog.showModal();
		previewContentDiv.innerHTML = marked.parse(editTextarea.value);
	}

	// 모달 창 닫기
	closePreviewButton.onclick = ()=> {
		previewDialog.close();
	}



	// 업로드 처리
	uploadButton.onclick = async () => {
		const updatedContent = editTextarea.value;
		const updatedRedirect = redirectInput.value;
		
		let updatedTitle = documentData.doc_title;
		if (doctitleInput.value != documentData.doc_title) {
			if (confirm("문서 제목을 정말로 수정합니까?")) {
				updatedTitle = doctitleInput.value;
			}
		}
		const response = await updateDocument(
			getBasePathFromHash(hash), // 문서 id
			updatedContent,  // 업데이트된 내용
			decodeURI(documentHash),   // 해쉬
			updatedRedirect,  // 리다이렉션
			getBasePathFromHash(updatedTitle)  // 업데이트된 제목
		);

		if (response.status == StatusMessages.SUCCESS) {
			alert("수정되었습니다.");
			location.hash = "w/" + convertDotNotationToPath(hash);
		} else if (response.status == StatusMessages.MERGE_CONFLICT) {
			console.log(response);
			alert("자동 병합에 실패했습니다. 수동 병합 후 제출 버튼을 누르세요.");
			document.getElementById("edit").value = response.content;
			documentHash = "";
		} else {
			alert(response.status);
		}
	};
}

export async function addDocument(hash) {
	setTitle(`${decodeURI(hash)} 추가`);
	const addHtml = `
      <h1>문서 추가 <button id="preview">결과 미리보기</button></h1>
      <textarea id='edit'></textarea>
      <button id='upload'>업로드</button>
	  <dialog id="preview-dialog">
	 	<p><button id="close-dialog">X</button> 결과 미리보기</p>
	 	<div id="preview-content"></div>
	  </dialog>
    `;
	document.getElementById("content").innerHTML = addHtml;

	const uploadButton = document.getElementById("upload");
	const editTextarea = document.getElementById("edit");
	/** @type {HTMLElement} preview 보기 버튼 */
	const previewButton = document.getElementById("preview");
	/** @type {HTMLElement} preview dialog */
	const previewDialog = document.getElementById("preview-dialog");
	/** @type {HTMLElement} 결과 미리보기 content div */
	const previewContentDiv = document.getElementById("preview-content");
	/** @type {HTMLElement} dialog 닫기 */
	const closePreviewButton = document.getElementById("close-dialog");

	editTextarea.onkeydown = function(e) {
		if (e.key == "Tab") {
			e.preventDefault();
			
			/** @type {HTMLElement} */
			const textarea = this;
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			
			textarea.value = textarea.value.substring(0, start) + "  " + textarea.value.substring(end);
			textarea.selectionStart = textarea.selectionEnd = start + 2;
		}
	}

	// 모달 창 보여주기
	previewButton.onclick = () => {
		previewDialog.showModal();
		previewContentDiv.innerHTML = marked.parse(editTextarea.value);
	}

	// 모달 창 닫기
	closePreviewButton.onclick = ()=> {
		previewDialog.close();
	}
	

	uploadButton.onclick = async () => {
		const newContent = editTextarea.value;
		const newDocumentHash = hash;
		const response = await createDocument(newDocumentHash, newContent);
		alert(response.status);
		
		if (response.status == StatusMessages.SUCCESS) 
			location.hash = "w/" + convertDotNotationToPath(newDocumentHash);
	};
}

export async function viewDocumentHistory(hash) {
	setTitle(`${decodeURI(hash)} 히스토리`);
	const historyHtml = `
        <div id="doc-history">
            <h1>${convertDotNotationToPath(decodeURI(hash))}/히스토리</h1>
        </div>
    `;
	document.getElementById("content").innerHTML = historyHtml;
	const historyContainer = document.getElementById("doc-history");

	let start = 0;
	let limit = 30;

	const loadHistory = async () => {
		(await fetchDocumentHistory(hash, start, limit)).content.forEach(historyItem => {
			const commitedDate = new Date(historyItem.updated_time);
			const stringDate = commitedDate.toISOString().split("T")[0];

			let historyElement = document.createElement("p");
			historyElement.innerHTML = `
                - ${stringDate}(<a href="./#w/${hash}&${historyItem.hash}">보기</a>|<a href="./#edit/${hash}&${historyItem.hash}">이 버전에서부터 수정하기</a>|<a href="./#diffSelect/${hash}/${historyItem.hash}">비교하기</a>)(by ${historyItem.message.split(" ")[0]})
            `;
			historyContainer.appendChild(historyElement);
		});
	};

	loadHistory();

	// 스크롤 시 추가 히스토리 로딩
	const contentOuterContainer = document.querySelector("#content-outer");

	let reached_100 = false;
	contentOuterContainer.onscroll = async () => {
		if (reached_100)
			return;

		const scrollRatio = contentOuterContainer.clientHeight / (contentOuterContainer.scrollHeight - contentOuterContainer.scrollTop) * 100;
		if (scrollRatio >= 90) {
			start = limit;
			limit += 30;
			await loadHistory();
		}

		if (scrollRatio >= 100) {
			reached_100 = true;
		}
	};

	// 비교하기
}

export async function deleteDocument(hash) {
	const documentHash = (await fetchDocument(hash)).hash;
	if (confirm("이 문서를 삭제합니까?")) {
		const response = await removeDocument(hash, documentHash);
		alert(response.status);
		location.href = `#w/${convertDotNotationToPath(hash)}`;
		// location.reload();
	}
}
(()=>{}).toString

export async function diffDocument(path) {
	const pathList = path.split(".");
	const hash = pathList.slice(0, -1).join(".");




	setTitle(`${decodeURI(hash)} 버전 비교하기`);
	const historyHtml = `
        <div id="doc-history">
            <h1>비교할 버전을 선택하세요.</h1>
        </div>
    `;
	document.getElementById("content").innerHTML = historyHtml;
	const historyContainer = document.getElementById("doc-history");

	let start = 0;
	let limit = 30;

	const loadHistory = async () => {
		(await fetchDocumentHistory(hash, start, limit)).content.forEach(historyItem => {
			const commitedDate = new Date(historyItem.updated_time);
			const stringDate = commitedDate.toISOString().split("T")[0];

			let historyElement = document.createElement("p");
			historyElement.innerHTML = `
                - ${stringDate}(<a href="./#diff/name=${hash}&src=${pathList.at(-1)}&dest=${historyItem.hash}">비교하기</a>)(by ${historyItem.message.split(" ")[0]})
            `;
			// historyElement.querySelector("a").onclick = () => {diffDisplay(pathList.at(-1), historyItem.hash)}

			historyContainer.appendChild(historyElement);
		});
	};
	loadHistory();

	// 스크롤 시 추가 히스토리 로딩
	const contentOuterContainer = document.querySelector("#content-outer");

	let reached_100 = false;
	contentOuterContainer.onscroll = async () => {
		if (reached_100)
			return;

		const scrollRatio = contentOuterContainer.clientHeight / (contentOuterContainer.scrollHeight - contentOuterContainer.scrollTop) * 100;
		if (scrollRatio >= 90) {
			start = limit;
			limit += 30;
			await loadHistory();
		}

		if (scrollRatio >= 100) {
			reached_100 = true;
		}
	};

	// 비교하기
}


export async function diffDisplay(hash) {
	// location.hash = `${location.hash}&${dest}`
	// console.log(hash);
	const args = urlArgParser(hash);

	const response = await diff(args.name, args.src, args.dest);
	
	const parsedContent = await diffContentParser(response.content);
	
	document.getElementById("content").innerHTML = `
	<h1>비교</h1>
	<div id="diffDiv">
	</div>
	`;
	
	const diffDiv = document.getElementById("diffDiv");

	if (parsedContent.join("").trim() === "") {
		diffDiv.innerHTML = "<h2>문서의 내용이 같아 비교할 수 없습니다.</h2>";
		return;
	}

	for (const line of parsedContent) {
		const lineHead = line.substring(0, 1)
		if (lineHead == '@') {
			const head_3 = document.createElement("h3");
			head_3.innerHTML = line;
			diffDiv.appendChild(head_3);
		} else if (lineHead == "+") {
			const pAdd = document.createElement("p");
			pAdd.classList.add("diff-add");
			pAdd.innerText = line;
			diffDiv.appendChild(pAdd);
		} else if (lineHead == "-") {
			const pAdd = document.createElement("p");
			pAdd.classList.add("diff-del");
			pAdd.innerText = line;
			diffDiv.appendChild(pAdd);
		} else {
			const pAdd = document.createElement("p");
			// pAdd.classList.add("diff-del");
			pAdd.innerText = line;
			diffDiv.appendChild(pAdd);
		}
	}


}
// export async function displayLoginPage() {
// 	setTitle("로그인");
// 	const loginHtml = `
//         <h1>로그인</h1>
//         <form action="/login" method="post">
//             <input type="text" name="userID" placeholder="아이디" required>
//             <input type="password" name="userPW" placeholder="비밀번호" required>
//             <input type="submit" value="로그인">
//         </form>
//     `;
// 	document.getElementById("content").innerHTML = loginHtml;
// }