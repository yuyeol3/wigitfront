/**
 * 문서를 fetch하는 함수
 * @param {string} documentId 
 * @returns {{hash:string, content:string, status:string}} documentId에 대응하는 문서 데이터를 리턴
 */
export async function fetchDocument(documentId) {
	const response = await fetch(`/getdoc/${documentId}`);
	return response.ok ? await response.json() : console.error("fetch failed");
}

export async function fetchDocumentData(documentId) {
	const response = await fetchDocument(documentId);
	return response.content || response.status;
}

export async function updateDocument(documentId, content, hash) {
	const requestBody = {
		content: content,
		hash: hash
	};
	const response = await fetch(`/editdoc/${documentId}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(requestBody)
	});
	return response.ok ? await response.json() : (console.error(response.statusText), "response error");
}

export async function removeDocument(documentId, hash) {
	const requestBody = {
		"hash": hash
	};
	const response = await fetch(`/deletedoc/${documentId}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(requestBody)
	});
	return response.ok ? await response.json() : (console.error(response.statusText), "response error");
}

export async function createDocument(documentId, content) {
	const response = await fetch(`/adddoc/${documentId}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(content)
	});
	return response.ok ? await response.text() : (console.error(response.statusText), "request error");
}

export async function fetchDocumentHistory(documentId, start, limit) {
	const response = await fetch(`/gethistory/${documentId}&${start}&${limit}`);
	return response.ok ? await response.json() : console.error("fetch failed");
}
