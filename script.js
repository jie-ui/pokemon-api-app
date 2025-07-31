

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const pokemonDetails = document.getElementById("pokemon-details");
const loading = document.getElementById("loading");
const modal = document.getElementById("pokemon-modal");
const closeModalBtn = document.getElementById("close-modal");
const toggleFavouritesBtn = document.getElementById("toggle-favourites");



const favouritesKey = "favouritePokemons";
let viewingFavourites = false;


searchButton.addEventListener("click", async () => {
  const value = searchInput.value.trim().toLowerCase();
  if (!value) return;

  pokemonDetails.innerHTML = "";
  showLoading(true);

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${value}`);
    if (!response.ok) throw new Error("Not Found");

    const data = await response.json();

    const card = document.createElement("div");
    card.className = "pokemon-card";
    card.innerHTML = `
      <h2>${data.name}</h2>
      <img src="${data.sprites.other['official-artwork'].front_default || data.sprites.front_default}" alt="${data.name}" />
      <p><strong>ID:</strong> ${data.id}</p>
      <p><strong>Types:</strong> ${data.types.map(t => t.type.name).join(", ")}</p>
      <p><strong>Abilities:</strong> ${data.abilities.map(a => a.ability.name).join(", ")}</p>
      <button class="more-info-btn">More Info</button>
      <button class="add-fav-btn">Add to Favourites</button>
    `;

    const moreInfoBtn = card.querySelector(".more-info-btn");
    const favBtn = card.querySelector(".add-fav-btn");

    moreInfoBtn.addEventListener("click", () => showMoreInfo(data));
    favBtn.addEventListener("click", () => addToFavourites(data));

    pokemonDetails.appendChild(card);
  } catch (err) {
    pokemonDetails.innerHTML = `<p style="color:red;">Pokémon not found!</p>`;
  } finally {
    showLoading(false);
  }
});


function showLoading(show) {
  loading.style.display = show ? "block" : "none";
}


function showMoreInfo(data) {
  document.getElementById("modal-name").textContent = data.name;
  document.getElementById("modal-id").textContent = `#${data.id.toString().padStart(3, '0')}`;
  document.getElementById("modal-img").src =
  data.sprites.other["official-artwork"].front_default ||
  data.sprites.front_default;

  document.querySelector("#modal-height").textContent = `Height: ${(data.height / 10).toFixed(1)} m`;
  document.querySelector("#modal-weight").textContent = `Weight: ${(data.weight / 10).toFixed(1)} kg`;
  document.querySelector("#modal-abilities").textContent = `Abilities: ${data.abilities
    .map(a => a.ability.name)
    .join(", ")}`;

  const modalStats = document.getElementById("modal-stats");
  modalStats.innerHTML = "";
  data.stats.forEach(stat => {
    modalStats.innerHTML += `${stat.stat.name}: ${stat.base_stat}<br>`;
  });;

  modal.classList.remove("hidden");
}


closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.add("hidden");
  }
});




function addToFavourites(pokemon) {
  const favs = JSON.parse(localStorage.getItem(favouritesKey)) || [];
  console.log("Current Favs (Before Adding):", favs); 

  if (favs.length >= 6) {
    alert("You can only have 6 favourite Pokémon!");
    return;
  }


  if (favs.find(p => p.id === pokemon.id)) {
    alert("Already in favourites!");
    return;
  }


  favs.push({
    id: pokemon.id,
    name: pokemon.name,
    sprite:
      pokemon.sprites.other["official-artwork"].front_default ||
      pokemon.sprites.front_default,
    types: pokemon.types.map(t => t.type.name),
    abilities: pokemon.abilities.map(a => a.ability.name),
  });

  localStorage.setItem(favouritesKey, JSON.stringify(favs));
  console.log("After Adding:", favs); 
  alert(`${pokemon.name} added to favourites!`);
}



toggleFavouritesBtn.addEventListener("click", () => {
  pokemonDetails.innerHTML = "";

  if (viewingFavourites) {
    searchButton.style.display = "block"; 
    searchInput.style.display = "block"; 
    toggleFavouritesBtn.textContent = "View Favourites";
    viewingFavourites = false;
    return;
  }

  const favs = JSON.parse(localStorage.getItem(favouritesKey)) || [];
  console.log("Favourites array:", favs);


  if (favs.length === 0) {
    pokemonDetails.innerHTML = `You have no favourites yet!</p>`;
   
    toggleFavouritesBtn.textContent = "View Favourites";
    viewingFavourites = false;
    return;
  }
  searchButton.style.display = "none"; 
  searchInput.style.display = "none";

  favs.forEach(pokemon => {
    const card = document.createElement("div");
    card.className = "pokemon-card";
    card.innerHTML = `
      <h2>${pokemon.name}</h2>
      <img src="${pokemon.sprite}" alt="${pokemon.name}" />
      <p><strong>ID:</strong> ${pokemon.id}</p>
      <p><strong>Types:</strong> ${pokemon.types ? pokemon.types.join(", ") : "N/A"}</p>
      <p><strong>Abilities:</strong> ${pokemon.abilities ? pokemon.abilities.join(", ") : "N/A"}</p>

      <button class="more-info-btn">More Info</button>
    `;


    const moreInfoBtn = card.querySelector(".more-info-btn");
    moreInfoBtn.addEventListener("click", async () => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
      if (!res.ok) {
        alert("Failed to load detailed info!");
        return;
      }
      const fullData = await res.json();
      showMoreInfo(fullData);
    });

    pokemonDetails.appendChild(card);
  });
  
  toggleFavouritesBtn.textContent = "Back to Search";
  viewingFavourites = true;
});
