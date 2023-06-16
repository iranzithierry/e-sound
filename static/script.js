// Get references to the necessary DOM elements
const container = document.querySelector(".container");
const chatbox = document.querySelector(".chat-box");
const welcomeMsg = document.querySelector(".welcome-msg");
const sendBtn = document.querySelector(".send-btn");
const microBtn = document.querySelector(".microphone");
const userMessageInput = document.querySelector("input[name='user_input']");
const indicator = document.querySelector(".indicator");
const delIcon = document.querySelector(".del-icon");

const examplePoint = document.querySelectorAll(".example-point");

// Set the height of the container based on screen size if it is below a certain threshold
let screenHeight = screen.height;
let screenWidth = screen.width;
if (screenWidth < 880) {
  let containerHeight = screenHeight - screenHeight * 0.17;
  container.style.height = `${containerHeight}px`;
}

// Attach event listeners to example points
examplePoint.forEach((point) => {
  point.addEventListener("click", examplePointClick);
});

// Handle click on example point by populating the input field and triggering a click on the send button
function examplePointClick(e) {
  userMessageInput.value = "";
  userMessageInput.value = e.target.textContent;
  sendBtn.disabled = false;
}

// Prevent default action for microphone button click
microBtn.addEventListener("click", (e) => {
  e.preventDefault();
});

// Handle input event on the user input field
userMessageInput.addEventListener("input", handleInput);

// Enable or disable the send button based on the presence of text in the input field
function handleInput(e) {
  sendBtn.disabled = e.target.value === "";
}

// Disable the send button initially
sendBtn.disabled = true;

// Handle click on the send button
sendBtn.addEventListener("click", handleSubmit);

// Handle form submission when the send button is clicked
function handleSubmit(e) {
  e.preventDefault();
  welcomeMsg.classList.toggle("remove", true);

  // Get the user message from the input field
  const userMessage = userMessageInput.value.trim();

  // Create and append the user message to the chatbox
  const userMsgDiv = createDivWithClass("sender-msg");
  const userMsgParagraph = document.createElement("p");
  userMsgParagraph.textContent = userMessage;
  appendChildren(userMsgDiv, [userMsgParagraph]);
  chatbox.appendChild(userMsgDiv);
  chatbox.scrollTop = chatbox.scrollHeight;

  // Create and append the dot message to indicate that the bot is typing
  const dotMessage = createDotMessage();
  chatbox.appendChild(dotMessage);
  userMessageInput.value = "";
  chatbox.scrollTop = chatbox.scrollHeight;

  // Send the user message to the server for processing
  const formData = new FormData();
  formData.append("user_input", userMessage);

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/response", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);

        // Process the response received from the server
        if (data.response && data.response.includes("song++")) {
          // If the response is a song, create and append a music container
          const musicContainer = createMusicContainer(
            data.response.replace("song++", "")
          );
          dotMessage.remove();
          setTimeout(() => {
            const chatMessages = Array.from(chatbox.children).filter(
              (child) => {
                return !child.querySelector("pre");
              }
            );

            const chatHistory = chatMessages
              .map((message) => message.outerHTML)
              .join("");
            localStorage.setItem("all-chats", chatHistory);
          }, 10000);
          chatbox.appendChild(musicContainer);
        } else if (data.response) {
          // If the response is a text message, create and append a bot message container
          const botMessageContainer = createBotMessageContainer();
          const botMsg = createDivWithClass("bot-msg");
          const botMsgParagraph = createBotMsgParagraph(data.response);
          const copyIconDiv = createCopyIconDiv(botMsgParagraph);

          dotMessage.remove();

          appendChildren(botMsg, [botMsgParagraph, copyIconDiv]);
          appendChildren(botMessageContainer, [botMsg]);
          chatbox.appendChild(botMessageContainer);
          chatbox.scrollTop = chatbox.scrollHeight;

          // Store all chats in the local storage after a delay of 10 seconds
          setTimeout(() => {
            const chatMessages = Array.from(chatbox.children).filter(
              (child) => {
                return !child.querySelector("pre");
              }
            );

            const chatHistory = chatMessages
              .map((message) => message.outerHTML)
              .join("");
            localStorage.setItem("all-chats", chatHistory);
          }, 10000);
        }
      } else if (xhr.status === 500) {
        // Handle internal server error
        const errorMsg = document.createElement("div");
        errorMsg.className = "error-msg";
        errorMsg.innerHTML =
          "An Error Occured while trying to connect to the server";
        chatbox.appendChild(errorMsg);
        xhr.abort();
        dotMessage.remove();
        setTimeout(() => {
          errorMsg.remove();
        }, 4000);
      } else {
        console.error("Error:", xhr.status);
      }
    }
  };

  xhr.send(formData);
}

// Prevent default action for microphone button click
microBtn.addEventListener("click", handleMicrophone);

// Handle microphone button click
function handleMicrophone() {
  // Create a speech recognition instance
  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  if (indicator.classList.contains("active")) {
    // If the microphone is already active, deactivate it
    indicator.classList.remove("active");
  } else {
    // If the microphone is not active, activate it and start listening for speech
    indicator.classList.add("active");
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      userMessageInput.value = transcript;
      sendBtn.disabled = false;
    };

    recognition.onend = () => {
      indicator.classList.remove("active");
    };

    recognition.start();
  }
}

// Utility function to create a div element with a given class name
function createDivWithClass(className) {
  const div = document.createElement("div");
  div.className = className;
  return div;
}

// Utility function to append multiple children to a parent element
function appendChildren(parent, children) {
  children.forEach((child) => {
    parent.appendChild(child);
  });
}

// Utility function to create a dot message element
function createDotMessage() {
  const dotMessage = createDivWithClass("message-dot");
  for (var i = 1; i <= 3; i++) {
    const dot = document.createElement("span");
    dot.className = "dot";
    dotMessage.appendChild(dot);
  }
  return dotMessage;
}

// Utility function to create a music container element
function createMusicContainer(songName) {
  const audio = document.createElement("audio");
  audio.setAttribute("controls", "");
  const source = document.createElement("source");
  source.setAttribute("src", songName);
  source.setAttribute("type", "audio/mp3");
  const musicContainer = createDivWithClass("music-container");
  const songNameP = document.createElement("p");
  let nameOfTheSong = songName.replace("static/songs/", "");
  songNameP.innerHTML = nameOfTheSong;

  appendChildren(audio, [source]);
  appendChildren(musicContainer, [audio, songNameP]);

  return musicContainer;
}

// Utility function to create a bot message container element
function createBotMessageContainer() {
  const botMessageContainer = createDivWithClass("bot-message-container");
  return botMessageContainer;
}

// Utility function to create a bot message paragraph element
function createBotMsgParagraph(response) {
  const botMsgParagraph = document.createElement("p");
  const pattern = /```([^`]+)```/gm;
  const matches = response.match(pattern);

  if (matches) {
    let responseWithoutCode = response;
    let remainingText = "";

    matches.forEach((match, index) => {
      const code = match.replace(/```/g, "");

      const codeElement = document.createElement("code");
      codeElement.className = "codeSnippet";
      hljs.highlightElement(codeElement);
      writingCode(code, codeElement);

      const preElement = document.createElement("pre");
      preElement.appendChild(codeElement);
      let preCodeWidth = screenWidth - screenWidth * 0.2;
      preElement.style.width = `${preCodeWidth}px`;

      responseWithoutCode = responseWithoutCode.replace(match, "");

      if (index === 0) {
        remainingText = responseWithoutCode.trim();
        responseWithoutCode = "";
        if (remainingText !== "") {
          const textElement = document.createElement("span");
          writingCode(remainingText, textElement);
          botMsgParagraph.appendChild(textElement);
        }
        botMsgParagraph.appendChild(preElement);
      } else {
        botMsgParagraph.appendChild(preElement);
      }
    });

    responseWithoutCode = responseWithoutCode.trim();
    if (responseWithoutCode !== "") {
      const textElement = document.createElement("span");
      writingCode(textElement, textElement);
      botMsgParagraph.appendChild(textElement);
    }
  } else {
    // If no code blocks are found, display the response as plain text
    typeResponse(response, botMsgParagraph);
  }

  return botMsgParagraph;
}

// Utility function to create a copy icon div element
function createCopyIconDiv(botMsgParagraph) {
  const copyIconDiv = createDivWithClass("copy-icon");
  const icon = document.createElement("i");
  icon.className = "bx bxs-copy";
  copyIconDiv.appendChild(icon);

  copyIconDiv.addEventListener("click", function () {
    const text = botMsgParagraph.innerText;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        icon.classList.remove("bxs-copy");
        icon.classList.add("bx-check");
        setTimeout(() => {
          icon.classList.remove("bx-check");
          icon.classList.add("bxs-copy");
        }, 4000);
      })
      .catch((err) => {
        console.error(`Failed to copy text: ${err}`);
      });
  });

  return copyIconDiv;
}

// Function to type a response character by character
function typeResponse(response, botMessage) {
  const typingSpeed = 5;
  let i = 0;
  setTimeout(() => {
    function typeNextCharacter() {
      if (i < response.length) {
        botMessage.innerHTML += response.charAt(i);
        i++;
        setTimeout(typeNextCharacter, typingSpeed);
      }
    }

    typeNextCharacter();
  }, 3);
}

// Function to write code character by character
function writingCode(codes, codeElement) {
  const typingSpeed = 5;
  let i = 0;
  setTimeout(() => {
    function typeNextCharacter() {
      if (i < codes.length) {
        codeElement.textContent += codes.charAt(i);
        i++;
        setTimeout(typeNextCharacter, typingSpeed);
      }
    }

    typeNextCharacter();
  }, 3);
}

// Function to load chat history from local storage
function loadDataFromLocalstorage() {
  if (localStorage.getItem("all-chats")) {
    welcomeMsg.classList.remove("remove");
    chatbox.innerHTML = localStorage.getItem("all-chats");
  }
}

// Call the function to load chat history from local storage
loadDataFromLocalstorage();
delIcon.addEventListener("click", () => {
  localStorage.removeItem("all-chats"); // Remove
  window.location.reload(); // Reload
});
