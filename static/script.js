const chatboxElement = document.querySelector(".chat-box");
const sendButtonElement = document.querySelector(".send-btn");
const userInputElement = document.querySelector("input[name='user_input']");
const deleteIconElement = document.querySelector(".del-icon");
const navbarElement = document.getElementById("layout-navbar");
const contentElement = document.querySelector(".content");

const screenHeight = screen.height;
const screenWidth = screen.width;
if (screenWidth < 880) {
  const chatboxHeight = screenHeight - screenHeight * 0.37;
  chatboxElement.style.height = `${chatboxHeight}px`;
  navbarElement.classList.remove("navbar-detached", "align-items-center");
  contentElement.classList.remove("py-2", "px-3");
  navbarElement.classList.add("py-2", "px-2");
  contentElement.classList.add("py-1", "px-1");
}

userInputElement.addEventListener("input", handleUserInput);

function handleUserInput(e) {
  sendButtonElement.disabled = e.target.value === "";
}

sendButtonElement.disabled = true;
sendButtonElement.addEventListener("click", handleSendMessage);

function handleSendMessage(e) {
  e.preventDefault();
  const userMessage = userInputElement.value.trim();

  if (!userMessage) {
    return;
  }

  appendUserMessage(userMessage);

  sendButtonElement.disabled = true;

  const dotMessage = createDotMessage();
  chatboxElement.appendChild(dotMessage);
  userInputElement.value = "";

  const formData = new FormData();
  formData.append("user_input", userMessage);

  fetch("/request", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.songs) {
        handleSongsResponse(data.songs, userMessage);
        dotMessage.remove();
        saveSongsToLocalStorage(data.songs);
      }
    })
    .catch((error) => {
      showErrorMsgFirstResponse("An Error Occurred while trying to connect to the server", chatboxElement);
      console.error("Error:", error);
    })
    .finally(() => {
      sendButtonElement.disabled = false;
    });
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
  const parentContainer = document.createElement("div");
  const childContainer = document.createElement("div");
  parentContainer.className = "d-flex flex-row justify-content-start";
  childContainer.className = "small p-2 me-3 mb-1 rounded-3 bg-black";
  for (var i = 1; i <= 3; i++) {
    const dot = document.createElement("span");
    dot.className = "dot";
    childContainer.appendChild(dot);
    parentContainer.appendChild(childContainer);
  }
  return parentContainer;
}
function appendUserMessage(message) {
  const userMessageDiv = createDivWithClass("d-flex flex-row justify-content-end user-msg sender-msg mt-1 mb-1");
  const userMessageParagraph = createParagraphWithClass("h5 p-2 me-3 mb-1 text-white rounded-3 bg-primary");
  const userAvatar = createImageWithSrc("rounded-circle chat-img", "static/avatars/user-1.jpg");
  userMessageParagraph.textContent = message;
  appendChildren(userMessageDiv, [userMessageParagraph, userAvatar]);
  chatboxElement.appendChild(userMessageDiv);
  chatboxElement.scrollTop = chatboxElement.scrollHeight;
}
function handleSongsResponse(songs, userMessage) {
  const songListBox = createSongListContainer(songs);
  const parentSongList = document.createElement("div");
  parentSongList.className = "col-lg-6 mt-3 card my-2";
  const title = document.createElement("small");
  title.innerHTML = `Search results for: ${userMessage}`;
  title.className = "text-light fw-semibold";
  appendChildren(parentSongList, [title, songListBox]);
  chatboxElement.appendChild(parentSongList);
  chatboxElement.scrollTop = chatboxElement.scrollHeight;
}
function showErrorMsgFirstResponse(msg, parentElement) {
  const errorMsgParagraph = createParagraphWithClass("h5 p-2 me-3 mb-1 text-white rounded-3 bg-danger");
  errorMsgParagraph.textContent = msg;
  parentElement.appendChild(errorMsgParagraph);
  setTimeout(() => {
    errorMsgParagraph.remove();
  }, 4000);
}
function createSongListContainer(songs) {
  const container = document.createElement("div");
  container.className = "demo-inline-spacing my-1 mx-1";
  const songUlElement = document.createElement("ul");
  songUlElement.className = "list-group";
  for (let song of songs) {
    const customId = Math.floor(Math.random() * 100000);
    const songLiElement = document.createElement("li");
    songLiElement.className = "list-group-item cursor-pointer";
    const icon = document.createElement("i");
    icon.className = "bx bx-music me-2";
    const spinner = document.createElement("span");
    spinner.className = "spinner-border spinner-border-sm text-dark float-end d-none";
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

  downloadIcon.classList.add("bx", "bxs-download", "bx-sm", "btn-plyr-theme");
  setTimeout(() => {
    const playerControls = document.querySelector(`#player-${playerId}`).parentNode.querySelector(".plyr__controls");
    playerControls.appendChild(downloadBtn);
    downloadBtn.appendChild(downloadLink);
    downloadBtn.onclick = (event) => downloadHooks(event, songName, container);
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

// Event Listeners
deleteIconElement.addEventListener("click", () => {
  localStorage.removeItem("songList"); // Remove
  window.location.reload();
});

window.addEventListener("beforeunload", function (event) {
  event.preventDefault();
  event.returnValue = "";
  alert();
});

function songRequest(e) {
  const spinner = document.querySelector(`span[id='${e.target.id}']`);
  const isAudioDownloaded = Boolean(spinner.dataset.audioDownloaded);

  if (!spinner.classList.contains("d-none")) {
    return;
  }

  if (isAudioDownloaded) {
    return;
  }

  spinner.classList.remove("d-none");

  $.post(
    "song_request",
    {
      song_request: e.target.textContent,
    },
    (response) => {
      if (response.song) {
        const playerId = Math.floor(Math.random() * 100000);
        const musicContainer = createMusicContainer(response.song, playerId);
        chatboxElement.appendChild(musicContainer);
        spinner.classList.add("d-none");
        spinner.dataset.audioDownloaded = true;
        chatboxElement.scrollTop = chatboxElement.scrollHeight;
        new Plyr(`#player-${playerId}`);
      }
    }
  ).fail(function (xhr, status, error) {
    showErrorMsg("An error occurred: there was an issue processing your request", chatboxElement, spinner);
  });
}


function showErrorMsg(msg, parentElement, spinnerElement) {
  const errorMsgParagraph = createParagraphWithClass("h5 p-2 me-3 mb-1 text-white rounded-3 bg-danger");
  errorMsgParagraph.textContent = msg;
  parentElement.appendChild(errorMsgParagraph);
  spinnerElement.classList.add("d-none");
  setTimeout(() => {
    errorMsgParagraph.remove();
  }, 4000);
}

function saveSongsToLocalStorage(songs) {
  localStorage.setItem("songList", JSON.stringify(songs));
}

document.addEventListener("DOMContentLoaded", function (e) {
  const savedSongs = localStorage.getItem("songList");
  if (savedSongs) {
    const songs = JSON.parse(savedSongs);
    const songListBox = createSongListContainer(songs);

    const parentSongList = document.createElement("div");
    parentSongList.className = "col-lg-6 mt-3 card my-2";
    const title = document.createElement("small");
    title.innerHTML = "You recently searched";
    title.className = "text-light fw-semibold";
    appendChildren(parentSongList, [title, songListBox]);
    chatboxElement.appendChild(parentSongList);
  }
});
function downloadHooks(e, url, parentElement) {
  fetch(url)
    .then((response) => {
      const total = parseInt(response.headers.get("content-length"));
      let downloaded = 0;

      const reader = response.body.getReader();
      
      const parentDiv = createDivWithClass("progress");
      const childDiv = createDivWithClass("progress-bar progress-bar-striped progress-bar-animated bg-primary");
      childDiv.setAttribute("role", "progressbar");
      parentDiv.appendChild(childDiv);
      parentElement.appendChild(parentDiv);

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log("Download completed!");
            setTimeout(() => {
              childDiv.remove();
              const textAlert = document.createElement("h5");
              textAlert.innerHTML = "Download completeted";
              textAlert.className = "text-light fw-semibold";
              parentDiv.appendChild(textAlert);
              setTimeout(() => {
                parentDiv.remove();
              }, 2000);
            }, 2000);
            return;
          }

          downloaded += value.length;
          const progress = (downloaded / total) * 100;
          updateProgressBar(progress, childDiv);

          read();
        });
      }

      read();
    })
    .catch((error) => {
      console.error("Error while downloading the song:", error);
    });
}

function updateProgressBar(progress, childDiv) {
  childDiv.style.width = progress + "%";
  childDiv.innerHTML = progress;
}

function toggleTheme() {
  const themeStyle = document.getElementById("theme-style");
  const currentTheme = themeStyle.getAttribute("href");
  const lightTheme = "/static/core-light.css";
  const darkTheme = "/static/core-dark.css";

  // Switch between themes
  if (currentTheme === lightTheme) {
    themeStyle.setAttribute("href", darkTheme);
    localStorage.setItem("theme", "dark");
  } else {
    themeStyle.setAttribute("href", lightTheme);
    localStorage.setItem("theme", "light");
  }
}
const savedTheme = localStorage.getItem("theme");
const themeStyle = document.getElementById("theme-style");
if (savedTheme === "dark") {
  themeStyle.setAttribute("href", "/static/core-dark.css");
} else {
  themeStyle.setAttribute("href", "/static/core-light.css");
}