import { search } from "./api";
import { convertDotNotationToPath, formatPathToDotNotation, getBasePathFromHash } from "./utils";

export function setupSearch() {
	const searchButton = document.getElementById("search-btn");
	const searchBar = document.getElementById("search-bar");
	const searchedList = document.getElementById("searched-list");

	async function handleSearch() {
		const searchQuery = searchBar.value;
		if (searchQuery !== "") {
			location.hash = "w/" + searchQuery;
			searchBar.value = "";
		}
	}

	let delayTimer = null;
	async function updateSearchedList(e) {
		if (this.value === "")
			return;
		// console.log(e.key);

		if (e.key == "ArrowUp" || e.key == "ArrowDown")
			return;
			
		if (delayTimer !== null)
			clearTimeout(delayTimer);

		delayTimer = setTimeout(async ()=> {
			const response = await search( getBasePathFromHash(searchBar.value) );

			searchedList.innerHTML = "";
			for (const element of response.content) {
				const opt = document.createElement("option");
				opt.value = convertDotNotationToPath( element );
				searchedList.appendChild(opt);
			}
		}, 500);


	}

	searchButton.onclick = handleSearch;
	searchBar.onchange = handleSearch;
	searchBar.onkeyup = updateSearchedList;
}
