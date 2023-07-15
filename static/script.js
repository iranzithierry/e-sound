// Get references to the necessary DOM elements
const chatbox = document.querySelector(".chat-box");
const sendBtn = document.querySelector(".send-btn");
const microBtn = document.querySelector(".microphone");
const userMessageInput = document.querySelector("input[name='user_input']");
const indicator = document.querySelector(".indicator");
const delIcon = document.querySelector(".del-icon");

const songlistpoint = document.querySelectorAll(".song-list-point");

let screenHeight = screen.height;
let screenWidth = screen.width;
if (screenWidth < 880) {
  let chatbox = screenHeight - screenHeight * 0.17;
  chatbox.style.height = `${chatbox}px`;
}

songlistpoint.forEach((song) => {
  song.addEventListener("click", songlistClick);
});

function songlistClick(e) {
  userMessageInput.value = "";
  userMessageInput.value = e.target.textContent;
  sendBtn.disabled = false;
}

microBtn.addEventListener("click", (e) => {
  e.preventDefault();
});

userMessageInput.addEventListener("input", handleInput);

function handleInput(e) {
  sendBtn.disabled = e.target.value === "";
}

sendBtn.disabled = true;

sendBtn.addEventListener("click", handleSubmit);

function handleSubmit(e) {
  e.preventDefault();
  const userMessage = userMessageInput.value.trim();

  const userMsgDiv = createDivWithClass("d-flex flex-row justify-content-end user-msg sender-msg");
  const userMsgParagraph = createParagraphWithClass("h5 p-2 me-3 mb-1 text-white rounded-3 bg-primary");
  const avatar = createImageWithSrc("rounded-circle chat-img", "static/avatars/user-1.jpg");
  userMsgParagraph.textContent = userMessage;
  appendChildren(userMsgDiv, [userMsgParagraph, avatar]);
  chatbox.appendChild(userMsgDiv);
  chatbox.scrollTop = chatbox.scrollHeight;

  const dotMessage = createDotMessage();
  chatbox.appendChild(dotMessage);
  userMessageInput.value = "";

  const formData = new FormData();
  formData.append("user_input", userMessage);

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/response", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);

        if (data.response && data.response.includes("songlist++")) {
        } else if (data.response && data.response.includes("song++")) {
          const playerId = Math.floor(Math.random() * 100000); // Generate a random ID
          const musicContainer = createMusicContainer(data.response.replace("song++", ""), playerId);
          dotMessage.remove();
          setTimeout(() => {
            const chatHistory = chatbox.innerHTML;
            localStorage.setItem("chats", chatHistory);
          }, 10000);
          chatbox.appendChild(musicContainer);
          new Plyr(`#player-${playerId}`);
        }
      } else if (xhr.status === 500) {
        const errorMsg = document.createElement("div");
        const pMsg = document.createElement("p");
        errorMsg.className = "d-flex flex-row justify-content-start";
        pMsg.className = "small p-2 me-3 mb-1 text-white rounded-3 bg-danger";
        pMsg.innerHTML = "An Error Occured while trying to connect to the server";
        errorMsg.appendChild(pMsg);
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

function createDivWithClass(className) {
  const div = document.createElement("div");
  div.className = className;
  return div;
}
function createParagraphWithClass(className) {
  const p = document.createElement("p");
  p.className = className;
  return p;
}
function createImageWithSrc(className, src) {
  const image = document.createElement("img");
  image.className = className;
  image.setAttribute("src", src);
  return image;
}

function appendChildren(parent, children) {
  children.forEach((child) => {
    parent.appendChild(child);
  });
}

function createDotMessage() {
  const div = document.createElement("div");
  const div2 = document.createElement("div");
  div.className = "d-flex flex-row justify-content-start";
  div2.className = "small p-2 me-3 mb-1 rounded-3 bg-black";
  for (var i = 1; i <= 3; i++) {
    const dot = document.createElement("span");
    dot.className = "dot";
    div2.appendChild(dot);
    div.appendChild(div2);
  }
  return div;
}

function createMusicContainer(songName, playerId) {
  const container = document.createElement("div");
  const cardHeader = document.createElement("h4");

  const source = document.createElement("source");
  source.setAttribute("src", songName);

  const downloadBtn = document.createElement("button");
  const downloadLink = document.createElement("a");
  const downloadIcon = document.createElement("button");
  downloadLink.setAttribute("href", songName);
  downloadLink.setAttribute("download", "");
  downloadBtn.className = "plyr__control mx-1";
  downloadIcon.classList.add("bx", "bxs-download", "bx-sm");
  setTimeout(() => {
    const playerControls = document.querySelector(`#player-${playerId}`).parentNode.querySelector(".plyr__controls");
    playerControls.appendChild(downloadBtn);
    downloadBtn.appendChild(downloadLink);
    downloadLink.appendChild(downloadIcon);
  }, 1000);

  container.className = "music-container mt-2 card py-2 px-2";
  let nameOfTheSong = songName.replace("static/songs/", "");
  cardHeader.innerHTML = nameOfTheSong;

  const audio = document.createElement("audio");
  audio.className = "w-100";
  audio.setAttribute("id", `player-${playerId}`);

  appendChildren(container, [cardHeader, audio]);
  appendChildren(audio, [source]);
  new Plyr(`#player-${playerId}`);

  return container;
}
function loadDataFromLocalstorage() {
  if (localStorage.getItem("chats")) {
    chatbox.innerHTML = localStorage.getItem("chats");
  }
}

delIcon.addEventListener("click", () => {
  localStorage.removeItem("chats"); // Remove
  window.location.reload();
});

window.addEventListener("beforeunload", function (event) {
  event.preventDefault();
  event.returnValue = "";
  alert();
});
document.addEventListener("DOMContentLoaded", function (e) {
  loadDataFromLocalstorage();
});
