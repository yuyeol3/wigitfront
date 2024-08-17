export function setupSearch() {
	const searchButton = document.getElementById("search-btn");
	const searchBar = document.getElementById("search-bar");

	async function handleSearch() {
		const searchQuery = searchBar.value;
		if (searchQuery !== "") {
			location.hash = "w/" + searchQuery;
			searchBar.value = "";
		}
	}

	searchButton.onclick = handleSearch;
}
