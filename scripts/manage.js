import { removeDocPerm } from "./api";

/**
 * 
 * @param {HTMLElement} toAttach 
 * @param {[string]} permList 조작 가능한 권한 대상
 */
export function docDeletePerm(toAttach, docName) {
    const resultDiv = document.createElement("div");
    resultDiv.classList.add("manage-element")
    let resultHtml = `
        이 문서 영구 삭제하기
        <button id="deletePerm" class="dangerButton">삭제</button>
    `;

    resultDiv.innerHTML = resultHtml;
    const deletePermBtn = resultDiv.querySelector("#deletePerm");

    deletePermBtn.onclick = async ()=> {
        const res = await removeDocPerm(docName);
        alert(res.status);
        toAttach.close();
        location.hash = `#w`;
        location.hash = `#w/${docName}`;
    }

    toAttach.appendChild(resultDiv);

}