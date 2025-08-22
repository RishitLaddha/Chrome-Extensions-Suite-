const riddleDiv = document.getElementById("riddle");
const answerInput = document.getElementById("answerInput");
const checkBtn = document.getElementById("checkBtn");
const passBtn = document.getElementById("passBtn");
const newRiddleBtn = document.getElementById("newRiddleBtn");
const resultDiv = document.getElementById("result");
const errorDiv = document.getElementById("error");

// Score elements
const correctCountSpan = document.getElementById("correctCount");
const skipCountSpan = document.getElementById("skipCount");

// Keep track of current riddle and score
let currentRiddle = null;
let correctAnswers = 0;
let skippedAnswers = 0;

// Function to fetch a new riddle from the API
async function fetchRiddle() {
  // Clear previous messages
  resultDiv.textContent = "";
  errorDiv.textContent = "";
  answerInput.value = "";

  try {
    const response = await fetch("https://api.api-ninjas.com/v1/riddles", {
      method: "GET",
      headers: {
        "X-Api-Key": "<Your API key here>"  // your API key
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching riddle: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response:", data); // For debugging

    // Check if the response is an array with at least one riddle object
    if (Array.isArray(data) && data.length > 0 && data[0].question) {
      currentRiddle = data[0]; // use the first riddle in the array
      // Display the riddle question
      riddleDiv.textContent = currentRiddle.question;
    } else {
      throw new Error("No riddle found in response.");
    }
  } catch (err) {
    errorDiv.textContent = err.message;
    console.error(err);
  }
}

// Check user's answer against the riddle's answer
function checkAnswer() {
  if (!currentRiddle) {
    errorDiv.textContent = "Please get a riddle first.";
    return;
  }

  errorDiv.textContent = "";
  const userAnswer = answerInput.value.trim().toLowerCase();
  const correctAnswer = currentRiddle.answer.trim().toLowerCase();

  if (userAnswer === "") {
    errorDiv.textContent = "Please enter an answer.";
    return;
  }

  if (userAnswer === correctAnswer) {
    resultDiv.textContent = "Correct! Well done.";
    correctAnswers++;
    correctCountSpan.textContent = correctAnswers;
  } else {
    resultDiv.textContent = "Incorrect. Try again!";
  }
}

// Show the correct answer (pass)
function showAnswer() {
  if (!currentRiddle) {
    errorDiv.textContent = "Please get a riddle first.";
    return;
  }
  errorDiv.textContent = "";
  resultDiv.textContent = `The correct answer is: ${currentRiddle.answer}`;

  // Increment skippedAnswers because user gave up
  skippedAnswers++;
  skipCountSpan.textContent = skippedAnswers;
}

// Event listeners
newRiddleBtn.addEventListener("click", fetchRiddle);
checkBtn.addEventListener("click", checkAnswer);
passBtn.addEventListener("click", showAnswer);

// Optionally, load a riddle when the popup is first opened
fetchRiddle();
