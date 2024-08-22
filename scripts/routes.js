import { loadDocument, editDocument, addDocument, viewDocumentHistory, deleteDocument, page404 } from './document.js';
import { displayLoginPage, displayUserInfo, displayRegister } from './login.js';
import { addImage, deleteImgAction } from "./imageDoc.js"
import { formatPathToDotNotation, getFirstSegment } from './utils.js';

const Routes = {
	404: page404,
	"": () => {
		location.hash = "#w/대문";
	},
	"#edit": editDocument,
	"#add": addDocument,
	"#login": displayLoginPage,
	"#w": loadDocument,
	"#history": viewDocumentHistory,
	"#delete": deleteDocument,
	// 이미지 처리
	"#addImage" : addImage,
	"#deleteImage": deleteImgAction,
	"#userinfo": displayUserInfo,
	"#register": displayRegister
};

export const routeHandler = async () => {
	const contentOuterContainer = document.querySelector("#content-outer");
	contentOuterContainer.onscroll = null;
	contentOuterContainer.scrollTo({top:0, behavior:"instant"});

	const currentPath = window.location.hash || window.location.pathname;
	const formattedPath = formatPathToDotNotation(currentPath);
	let routeFunction = Routes[getFirstSegment(currentPath)] || Routes[404];

	formattedPath !== "" ? routeFunction(formattedPath) : routeFunction();
};

export const handleNavigation = (event) => {
	event.preventDefault();
	window.history.pushState({}, "", event.target.href);
	routeHandler();
};

window.onpopstate = routeHandler;
routeHandler();
document.querySelectorAll("a").forEach(link => {
	link.addEventListener("click", handleNavigation)
});
