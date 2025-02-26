const handleDefaultRadio = (e) => e?.click();

class RepoFinder {
  constructor() {
    this.button = document.querySelector("button");
    this.search = document.querySelector("input[type='text']");
    this.searchType = document.querySelectorAll("input[type='radio']");
    this.cardsContainer = document.querySelector(".cards");
    this.type = "users";

    this.button.addEventListener("click", (e) => this.displayRepos(e, this.search.value));
    this.button.addEventListener("keydown", (e) => e.key === "Enter" && this.button.click());

    this.searchType.forEach((radio) => {
      radio.addEventListener("change", (e) => this.getSearchType(e.target.value));
    });

    handleDefaultRadio(this.searchType[0]);
  }

  getSearchType(type) {
    this.type = type;
  }

  apiAssembler(term, type) {
    const params = new URLSearchParams({ q: term });
    if (type) params.append("type", type);
    return `https://api.github.com/search/users?${params.toString()}`;
  }

  async handleSearch(e, term) {
    e.preventDefault();
    try {
      const type = this.type === "users" ? "+type:user" : "+type:org";
      const response = await fetch(this.apiAssembler(term.trim(), type));

      if (!response.ok) throw new Error("Failed to fetch data");

      return response.json();
    } catch (error) {
      console.error("Error:", error);
      this.cardsContainer.innerHTML = `<p class="error">Error fetching data. Try again later.</p>`;
      return { items: [] };
    }
  }

  async displayRepos(e, searchValue) {
    const repos = await this.handleSearch(e, searchValue);
    if (repos.items?.length) {
      const articles = repos.items.map((item) => `
        <article class="card">
          <a href="${item.html_url}" target="_blank">
            <img class="img" loading="lazy" src="${item.avatar_url}">
            <h2 class="name">${item.login}</h2>
          </a>
        </article>
      `).join("");

      this.cardsContainer.innerHTML = articles;

      this.observeElements();
    } else {
      this.cardsContainer.innerHTML = this.search.value.trim()
        ? "No users found."
        : "Please, set the search term.";
    }
    this.search.value = "";
  }

  observeElements() {
    const cards = document.querySelectorAll(".card");
    const options = { 
      root: null,
      rootMargin: "-18% 0px 0px",
      threshold: 0.2,
    };
    const callback = (entries) => {
      entries.forEach((entry) => {
        entry.isIntersecting
          ? entry.target.classList.add("in-view")
          : entry.target.classList.remove("in-view");
      });
    };
    const observer = new IntersectionObserver(callback, options);
    cards.forEach((card) => observer.observe(card));
  }
}

const Find = new RepoFinder();
