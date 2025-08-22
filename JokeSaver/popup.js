const jokeEl = document.getElementById("joke");
const jokeBtn = document.getElementById("jokeBtn");

jokeBtn.addEventListener("click", async () => {
  jokeEl.textContent = "Loading joke...";
  try {
    // Fetch a random joke from the Official Joke API.
    const response = await fetch("https://official-joke-api.appspot.com/random_joke");
    const data = await response.json();
    // Combine the setup and punchline.
    jokeEl.textContent = `${data.setup} ${data.punchline}`;
  } catch (error) {
    console.error("Error fetching joke:", error);
    jokeEl.textContent = "Failed to fetch a joke. Please try again.";
  }
});
