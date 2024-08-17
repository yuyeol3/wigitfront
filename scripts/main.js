import { routeHandler, handleNavigation } from './routes.js';
import { setupSearch } from './search.js';
import "../css/style.css";

// Set up routing and search
window.onpopstate = routeHandler;
routeHandler();
document.querySelectorAll("a").forEach(link => {
	link.addEventListener("click", handleNavigation);
});

setupSearch();