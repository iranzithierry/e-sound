// DOM Elements
const chatboxElement = document.querySelector(".chat-box");
const sendButtonElement = document.querySelector(".send-btn");
const userInputElement = document.querySelector("input[name='user_input']");
const deleteIconElement = document.querySelector(".del-icon");
const navbarElement = document.getElementById("layout-navbar");
const contentElement = document.querySelector(".content");

// Screen dimensions
const screenHeight = screen.height;
const screenWidth = screen.width;
if (screenWidth < 880) {
  const chatboxHeight = screenHeight - screenHeight * 0.37;
  chatboxElement.style.height = `${chatboxHeight}px`;
  navbarElement.classList.remove("navbar-detached", "align-items-center", "bg-navbar-theme");
  contentElement.classList.remove("py-2", "px-3");
  navbarElement.classList.add("py-2", "px-2");
  contentElement.classList.add("py-1", "px-1");
}

// User input handling
userInputElement.addEventListener("input", handleUserInput);

function handleUserInput(e) {
  sendButtonElement.disabled = e.target.value === "";
}

sendButtonElement.disabled = true;
sendButtonElement.addEventListener("click", handleSendMessage);

function handleSendMessage(e) {
  e.preventDefault();
  const userMessage = userInputElement.value.trim();

  const userMessageDiv = createDivWithClass("d-flex flex-row justify-content-end user-msg sender-msg mt-1 mb-1");
  const userMessageParagraph = createParagraphWithClass("h5 p-2 me-3 mb-1 text-white rounded-3 bg-primary");
  const userAvatar = createImageWithSrc("rounded-circle chat-img", "static/avatars/user-1.jpg");
  userMessageParagraph.textContent = userMessage;
  appendChildren(userMessageDiv, [userMessageParagraph, userAvatar]);
  chatboxElement.appendChild(userMessageDiv);
  chatboxElement.scrollTop = chatboxElement.scrollHeight;
  sendButtonElement.disabled = true;

  const dotMessage = createDotMessage();
  chatboxElement.appendChild(dotMessage);
  userInputElement.value = "";

  const formData = new FormData();
  formData.append("user_input", userMessage);

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/request", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);

        if (data && data.songs) {
          const songListBox = createSongListContainer(data.songs);
          dotMessage.remove();

          const parentSongList = document.createElement("div");
          parentSongList.className = "col-lg-6";
          const title = document.createElement("small");
          title.innerHTML = `Search results for: ${userMessage}`;
          title.className = "text-light fw-semibold";
          appendChildren(parentSongList, [title, songListBox]);
          chatboxElement.appendChild(parentSongList);
        }
      } else if (xhr.status === 500) {
        const errorMsg = document.createElement("div");
        const errorMsgParagraph = document.createElement("p");
        errorMsg.className = "d-flex flex-row justify-content-start";
        errorMsgParagraph.className = "small p-2 me-3 mb-1 text-white rounded-3 bg-danger";
        errorMsgParagraph.innerHTML = "An Error Occurred while trying to connect to the server";
        errorMsg.appendChild(errorMsgParagraph);
        chatboxElement.appendChild(errorMsg);
        xhr.abort();
        dotMessage.remove();
        userInputElement.disabled = false;
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

// Helper functions
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
  const dotContainer = document.createElement("div");
  div.className = "d-flex flex-row justify-content-start";
  dotContainer.className = "small p-2 me-3 mb-1 rounded-3 bg-black";
  for (var i = 1; i <= 3; i++) {
    const dot = document.createElement("span");
    dot.className = "dot";
    dotContainer.appendChild(dot);
    div.appendChild(dotContainer);
  }
  return div;
}

function createMusicContainer(songName, playerId) {
  const container = document.createElement("div");
  const cardHeader = document.createElement("h6");

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

  container.className = "music-container mt-2 card py-1 px-1";
  let nameOfTheSong = songName.replace("static/songs/", "").replace(".mp3", "");
  cardHeader.innerHTML = nameOfTheSong;

  const audio = document.createElement("audio");
  audio.setAttribute("id", `player-${playerId}`);

  appendChildren(container, [cardHeader, audio]);
  appendChildren(audio, [source]);

  return container;
}

function createSongListContainer(songs) {
  const container = document.createElement("div");
  container.className = "demo-inline-spacing mt-3 mb-3";
  const songUlElement = document.createElement("ul");
  songUlElement.className = "list-group";
  for (let song of songs) {
    const customId = Math.floor(Math.random() * 100000);
    const songLiElement = document.createElement("li");
    songLiElement.className = "list-group-item cursor-pointer";
    const icon = document.createElement("i");
    icon.className = "bx bx-music me-2";
    const spinner = document.createElement("span");
    spinner.className = "spinner-border spinner-border-sm text-primary float-end d-none";
    spinner.setAttribute("id", `song-${customId}`);
    spinner.setAttribute("role", "status");
    songLiElement.setAttribute("id", `song-${customId}`);
    songLiElement.onclick = (event) => songRequest(event);
    appendChildren(songLiElement, [icon]);
    songLiElement.innerHTML += song;
    appendChildren(songLiElement, [spinner]);
    songUlElement.appendChild(songLiElement);
    container.appendChild(songUlElement);
  }
  return container;
}

// Event Listeners
deleteIconElement.addEventListener("click", () => {
  localStorage.removeItem("chats"); // Remove
  window.location.reload();
});

window.addEventListener("beforeunload", function (event) {
  event.preventDefault();
  event.returnValue = "";
  alert();
});
// document.addEventListener("DOMContentLoaded", function (e) {
//   loadDataFromLocalstorage();
// });

function songRequest(e) {
  console.log(e.target.id);
  const spinner = document.querySelector(`span[id='${e.target.id}']`);
  if ((spinner.classList.contains = "d-none")) {
    spinner.classList.remove("d-none");
  }
  $(document).ready(function () {
    $.post(
      "song_request",
      {
        song_request: e.target.textContent,
      },
      (data) => {
        if (data.song) {
          const playerId = Math.floor(Math.random() * 100000);
          const musicContainer = createMusicContainer(data.song, playerId);
          chatboxElement.appendChild(musicContainer);
          spinner.classList.add("d-none");
          chatboxElement.scrollTop = chatboxElement.scrollHeight;
          new Plyr(`#player-${playerId}`);
        }
      }
    );
  });
}
