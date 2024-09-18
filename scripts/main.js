import { routeHandler, handleNavigation } from './routes.js';
import { setupSearch } from './search.js';
import { loginStatusControl } from './login.js';
import "../css/style.css";
import "../css/katex.css";

// Set up routing and search
window.onpopstate = routeHandler;
routeHandler();
document.querySelectorAll("a").forEach(link => {
	link.addEventListener("click", handleNavigation);
});

// 초기화
setupSearch();
loginStatusControl();
// 10분마다 세션 확인
setInterval(() => {
	loginStatusControl();
}, 1000 * 60 * 10);