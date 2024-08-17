import { setTitle } from './utils.js';
import { StatusMessages } from './constants.js';
import { convertDotNotationToPath, getBasePathFromHash } from './utils.js';
// import { handleNotFoundError } from './error.js';
import { fetchDocument, fetchDocumentData, updateDocument, createDocument, removeDocument, fetchDocumentHistory } from './api.js';
import { marked } from "marked";

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

export async function loadDocument(hash) {
	const documentContent = await fetchDocumentData(hash);
	let parsedContent;
	if (documentContent != StatusMessages.DOC_NOT_EXIST) {
		parsedContent = marked.parse(documentContent);
	} else {
		page404();
		return;
	}
	const contentHtml = `
        <h1>${convertDotNotationToPath(decodeURI(hash))}</h1>
        <a href="./#edit/${convertDotNotationToPath(hash)}">수정하기</a>
        <a href="./#history/${convertDotNotationToPath(hash)}">히스토리 보기</a>
        <a href="./#delete/${convertDotNotationToPath(hash)}">삭제하기</a>
    `;
	document.getElementById("content").innerHTML = contentHtml + parsedContent;
	setTitle(`wigit: ${decodeURI(hash)}`);
}

export async function editDocument(hash) {
	const documentData = await fetchDocument(hash);
	if (documentData.status == StatusMessages.DOC_NOT_EXIST) {
		loadDocument(hash);
		return;
	}
	setTitle(`${decodeURI(hash)} 수정`);
	const editHtml = `
      <h1>문서 수정</h1>
      <input placeholder="제목">
      <textarea id='edit'></textarea>
      <input id="redirections" placeholder="리디렉션 목록">
      <button id='upload'>업로드</button>
    `;
	document.getElementById("content").innerHTML = editHtml;
	
	const uploadButton = document.getElementById("upload");
	const editTextarea = document.getElementById("edit");
	editTextarea.innerHTML = documentData.content;
	let documentHash = documentData.hash;

	uploadButton.onclick = async () => {
		const updatedContent = editTextarea.value;
		const response = await updateDocument(getBasePathFromHash(hash), updatedContent, decodeURI(documentHash));
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
      <h1>문서 추가</h1>
      <textarea id='edit'></textarea>
      <button id='upload'>업로드</button>
    `;
	document.getElementById("content").innerHTML = addHtml;

	const uploadButton = document.getElementById("upload");
	const editTextarea = document.getElementById("edit");

	uploadButton.onclick = async () => {
		const newContent = editTextarea.value;
		const newDocumentHash = hash;
		const response = await createDocument(newDocumentHash, newContent);
		alert(response);
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
			let historyElement = document.createElement("p");
			historyElement.innerHTML = `
                - ${historyItem.message.split(" ")[0]} (<a href="./#w/${hash}&${historyItem.hash}">보기</a>|<a href="./#edit/${hash}&${historyItem.hash}">이 버전에서부터 수정하기</a>)
            `;
			historyContainer.appendChild(historyElement);
		});
	};

	loadHistory();

	const contentOuterContainer = document.querySelector("#content-outer");
	contentOuterContainer.onscroll = async () => {
		const scrollRatio = contentOuterContainer.clientHeight / (contentOuterContainer.scrollHeight - contentOuterContainer.scrollTop) * 100;
		if (scrollRatio >= 90) {
			start = limit;
			limit += 30;
			await loadHistory();
		}
	};
}

export async function deleteDocument(hash) {
	const documentHash = (await fetchDocument(hash)).hash;
	if (confirm("이 문서를 삭제합니까?")) {
		const response = await removeDocument(hash, documentHash);
		location.hash = `w/${convertDotNotationToPath(hash)}`;
		alert(response.status);
	}
}

export async function displayLoginPage() {
	setTitle("로그인");
	const loginHtml = `
        <h1>로그인</h1>
        <form action="/login" method="post">
            <input type="text" name="userID" placeholder="아이디" required>
            <input type="password" name="userPW" placeholder="비밀번호" required>
            <input type="submit" value="로그인">
        </form>
    `;
	document.getElementById("content").innerHTML = loginHtml;
}