import { getBasePathFromHash, convertDotNotationToPath } from "./utils.js";
import { search } from "./api.js";

export function setupSearch() {
    const searchButton = document.getElementById("search-btn");
    const searchBar = document.getElementById("search-bar");
    const searchList = document.getElementById("search-list");

	searchBar.onfocus = () => {searchList.style.display = "block";}
	searchBar.onblur = () => {setTimeout(()=>{ searchList.style.display = "none";}, 200);}

    async function handleSearch(e, title) {
        if (searchBar.value === "")
            return;
        
		let target;
		if (title === undefined)
			target = searchBar.value;
		else
			target = title;

		searchList.innerHTML = "";
		searchBar.value = "";
		searchBar.blur();

		location.hash = "w/" + target;
    }

    let delayTimer = null;

    async function updateSearchedList(e) {
        // Ensure that the update happens only after IME composition has finished
        let target = searchBar.value;

		searchBar.value = target;
        if (target === "")
            return;

        if (e.key == "ArrowUp" || e.key == "ArrowDown")
            return;
            
        if (delayTimer !== null)
            clearTimeout(delayTimer);

        delayTimer = setTimeout(async ()=> {
            const response = await search( getBasePathFromHash(target) );

            searchList.innerHTML = "";
            for (const element of response.content) {
                const opt = document.createElement("div");
                opt.innerText = convertDotNotationToPath( element );
				opt.classList.add("searchopt")
				opt.onclick = ()=> {handleSearch(undefined, element);}
                searchList.appendChild(opt);
            }
        }, 750);
    }


    searchButton.onclick = handleSearch;
    // searchBar.onchange = handleSearch;
    searchBar.onkeyup = updateSearchedList;
}
