import { expr } from "jquery";

/**
 * 문서를 fetch하는 함수
 * @param {string} documentId 
 * @returns {{hash:string, content:string, status:string, redirections:string, doc_title:stirng}} documentId에 대응하는 문서 데이터를 리턴
 */
export async function fetchDocument(documentId) {
	const response = await fetch(`/getdoc/${documentId}`);
	return response.ok ? await response.json() : console.error("fetch failed");
}

/**
 * 문서의 내용만 fetch하는 함수
 * @param {string} documentId 
 * @returns {string} 문서의 content 속성. content가 비었으면 status 속성
 */
export async function fetchDocumentData(documentId) {
	const response = await fetchDocument(documentId);
	return response.content || response.status;
}

export async function updateDocument(documentId, content, hash, redirections, doc_title) {
	const requestBody = {
		content: content,
		hash: hash,
		redirections: redirections,
		doc_title: doc_title,
	};
	console.log(requestBody);
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


export async function uploadImage(imageName, imagePath) {
	let formData = new FormData();
	formData.append('file',imagePath);


	const response = await fetch(`/addimage/${imageName}`, {
		method: 'POST',
		body: formData
	});

	return response.ok ? await response.json() : (console.error(response.statusText), "request error");
}

export async function fetchImage(imageName) {

	const response = await fetch(`/getimage/${imageName}`);
	return response.ok ? await response.json() : console.error("fetch failed");
}

export async function deleteImage(imageName) {
	const response = await fetch(`/deleteimage/${imageName}`);
	return response.ok ? await response.json() : console.error("fetch failed");
}

/**
 * 
 * @param {*} isDetailed 
 * @returns {{user_id:string, registered_date:string, user_status:string, email:string} | undefined}
 */
export async function getUserInfo(isDetailed=false) {
	const fetchURL = '/userinfo/' + (isDetailed ? "detailed" : "");

	/**
	 * @type {{user_id:string, registered_date:string, user_status:string, email:string}}
	 */
	const response = await fetch(fetchURL);

	return response.ok ? await response.json() : console.error("fetch error");
}

export async function checkIdUsable(newId) {
	const content = {
		user_id : newId
	};

	const response = await fetch(`/useridcheck`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(content)
	});
	return response.ok ? await response.json() : (console.error(response.statusText), "request error");
}

export async function registUser(user_id, pwd, email) {
	const content = {
		user_id : user_id,
		pwd : btoa(pwd),
		email : email
	}
	const response = await fetch(`/register`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(content)
	});
	return response.ok ? await response.json() : (console.error(response.statusText), "request error");
}

export async function checkPwd(pwd) {
	const content = {
		pwd : btoa(pwd)
	};

	const response = await fetch(`/userpwdcheck`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(content)
	});
	return response.ok ? await response.json() : (console.error(response.statusText), "request error");
}

export async function setUser(args) {
	const content = {};
	
	if (args.email !== undefined) {
		content.email = args.email;
	}

	if (args.pwd !== undefined) {
		content.pwd = btoa(args.pwd);
	}
	const response = await fetch(`/setuserinfo`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(content)
	});
	return response.ok ? await response.json() : (console.error(response.statusText), "request error");
}

export async function deleteUser() {
	const response = await fetch(`/deleteuser`);
	return response.ok ? await response.json() : (console.error(response.statusText), "request error");
}