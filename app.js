"use strict";

// load more content
function loadMore() {
  const paragraphs = document.querySelectorAll("#projects_items .load_more");
  for (let i = 0; i < paragraphs.length; i++) {
    paragraphs[i].classList.add("show");
  }
  const hr = document.querySelectorAll(".line_hr");
  for (let i = 0; i < hr.length; i++) {
    hr[i].classList.add("sh");
  }
  document.getElementById("load-more-button").style.display = "none";
  document.getElementById("hide-button").style.display = "block";
}

function hide() {
  const paragraphs = document.querySelectorAll("#projects_items .load_more");
  for (let i = 0; i < paragraphs.length; i++) {
    paragraphs[i].classList.remove("show");
  }
  const hr = document.querySelectorAll(".line_hr");
  for (let i = 0; i < hr.length; i++) {
    hr[i].classList.remove("sh");
  }
  document.getElementById("load-more-button").style.display = "block";
  document.getElementById("hide-button").style.display = "none";
}

const members_url =
  "https://api.github.com/orgs/move-fast-and-break-things/members";

// fetch authors data
async function getAuthors(apiURL) {
  const response = await fetch(apiURL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return Promise.all(
    data.map(async (element) => {
      const userResponse = await fetch(element.url);
      if (!userResponse.ok) {
        throw new Error(`HTTP error! status: ${userResponse.status}`);
      }
      const userData = await userResponse.json();
      return {
        name: userData.name || userData.login,
        bio: userData.bio,
        avatar: userData.avatar_url,
        html_url: userData.html_url,
      };
    })
  );
}

// set authors in the DOM
async function setAuthors(apiURL) {
  const authors = await getAuthors(apiURL);
  const container = document.querySelector("#creators .persons");
  if (!container) {
    throw new Error("Container element not found");
  }
  console.log(container);
  authors.forEach((author) => {
    const personDiv = document.createElement("div");
    personDiv.className = "person";
    personDiv.innerHTML = `
                <div class="name_and_img">
                <a href="${author.html_url}" class="tooltip" target="_blank">  
                    <img src="${author.avatar}" alt="${author.name}'s avatar">
                    <p class="person_name">${author.name}</p>
                    </a>
                </div>
                
                <p class="about_person">${
                  author.bio || "No biography available"
                }</p>
            `;
    container.appendChild(personDiv);
  });
}

// set contributors in the DOM
async function setContributors(apiURL, element) {
  try {
    const contributors = await getAuthors(apiURL);
    element.innerHTML =
      contributors.length === 0
        ? "No developers found"
        : contributors
            .map(
              (contributor) => `
                <span class="developer-name">
                    <a href="${contributor.html_url}" class="tooltip" target="_blank">  
                        <img src="${contributor.avatar}" alt="${contributor.name}'s avatar" class="shining-image">  
                        <span class="tooltip-text">${contributor.name}</span>  
                    </a>
                </span>
            `
            )
            .join("");
  } catch (error) {
    console.error("Error setting contributors:", error);
    element.innerHTML =
      "Can't load the developer list. Check out the repository page to see all of the contributors 😅";
  }
}

// load all contributors
async function loadAllContributors() {
  const developerLists = document.querySelectorAll(".developers-list");
  const promises = Array.from(developerLists).map((devList) => {
    const apiURL = devList.getAttribute("data-value");
    return setContributors(apiURL, devList);
  });
  await Promise.all(promises);
  renderCreators(Array.from(allContributors.values()));
}

// Scroll-to-top functionality
function setupScrollToTop() {
  const toTopButton = document.getElementById("toTop");
  if (!toTopButton) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      toTopButton.style.display = "block";
    } else {
      toTopButton.style.display = "none";
    }
  });

  toTopButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

function initCarousel() {
  const persons = document.querySelector(".persons");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const prevBtn = document.querySelector(".carousel-btn.prev");

  if (!persons || !nextBtn || !prevBtn) return;

  nextBtn.addEventListener("click", () => {
    persons.scrollBy({ left: 260, behavior: "smooth" });
  });

  prevBtn.addEventListener("click", () => {
    persons.scrollBy({ left: -260, behavior: "smooth" });
  });
}

// Wait for DOM content to be loaded before executing scripts
document.addEventListener("DOMContentLoaded", async () => {
  //since the creators are hardcoded, we can skip this step for now
  // setAuthors(members_url).catch(console.error);
  loadAllContributors();
  initCarousel();
  setupScrollToTop();
});
