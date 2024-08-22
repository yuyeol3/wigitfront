import { setTitle, getBasePathFromHash, convertDotNotationToPath } from "./utils.js";
import { fetchImage, uploadImage, deleteImage } from "./api.js"
import { StatusMessages as stmsg } from "./constants.js"; 

export function page404() {
	setTitle("404");
	const errorMessage = `
    <h1>오류 : 이미지를 찾을 수 없습니다.</h1>
    <a href="./#">홈으로</a>
  `;
	document.getElementById("content").innerHTML = errorMessage;

	const addDocumentLink = document.createElement("a");
	addDocumentLink.innerHTML = "이 이미지 추가";
	addDocumentLink.setAttribute("href", `./#addImage/${location.hash.replace("#w/","")}`);
	document.getElementById("content").appendChild(addDocumentLink);
}

/**
 * 
 * @param {string} imageHashId 
 */
export function addImage(imageHashId) {
    console.log(imageHashId);

    const addHtml = `
    <h1>문서 추가</h1>
    <form id="uploadForm">
        <input type="file" id="fileInput" name="file" required>
        <button id='upload'>업로드</button>
    </form>

  `;

    document.getElementById("content").innerHTML = addHtml;

    const uploadButton = document.getElementById("upload");
    const fileInput = document.getElementById("fileInput");
    const uploadForm = document.getElementById("uploadForm");

    uploadForm.onsubmit = async (e)=> {
        e.preventDefault();

        let file = fileInput.files[0];
        let fileName = imageHashId  // 그냥 imageHashId로 저장하기
        fileName = getBasePathFromHash(fileName);
        console.log(fileName);
        if (!file) {
            alert("이미지 파일을 선택하세요!");
            return;
        }

        const result = await uploadImage(fileName, file);
        alert(result.status);
        location.hash = "#w/" + imageHashId;
    }
}

export async function loadImage(imageHashId) {
    const imageDocu = await fetchImage(getBasePathFromHash(imageHashId));

    if (imageDocu.status == stmsg.DOC_NOT_EXIST) {
        page404();
        return;
    }

    const contentHtml = `
        <h1>${convertDotNotationToPath(decodeURI(imageHashId))}</h1>
        <a href="./#deleteImage/${convertDotNotationToPath(imageHashId)}">삭제하기</a>
        <img src="${imageDocu.content}" id="view-image" style="">
    `
    // const imageTag = `<img src="${imageDocu.content}">`
    document.getElementById("content").innerHTML = contentHtml;
    setTitle(`wigit: ${decodeURI(imageHashId)}`);
}

export async function deleteImgAction(imageHashId) {

    if (confirm("이 이미지를 삭제합니까?")) {
        const res = await deleteImage(getBasePathFromHash(imageHashId));
        alert(res.status);
    }
    
}