const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "8080",
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({ audio: true, video: { facingMode: "user" } })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connecToNewUser(userId, stream);
    });

    let text = $("input");

    const showMessageOnChatWindow = () => {
      if (text.val().length !== 0) {
        socket.emit("message", text.val());
        text.val("");
      }
    };

    $("html").keydown((e) => {
      if (e.which == 13) {
        showMessageOnChatWindow();
      }
    });

    $(".send-message").click(showMessageOnChatWindow);

    socket.on("createMessage", (message) => {
      $(".messages").append(
        `<li class="message"><b>User</b> &nbsp <span>${
          new Date().getHours() < 10
            ? "0" + new Date().getHours()
            : new Date().getHours()
        } : ${
          new Date().getMinutes() < 10
            ? "0" + new Date().getMinutes()
            : new Date().getMinutes()
        }</span><br>${message}</li>`
      );
      scrollToBottom();
    });
  });

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connecToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const scrollToBottom = () => {
  let d = $(".main__chat__window");
  d.scrollTop(d.prop("scrollHeight"));
};

// mute our video
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `<i class="fas fa-microphone"></i><span>Mute</span>`;

  document.querySelector(".main__mute__button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `<i class="unmute fas fa-microphone-slash"></i><span>Unmute</span`;

  document.querySelector(".main__mute__button").innerHTML = html;
};

// hide/show video
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setPlayVideo = () => {
  const html = `<i class="stop fas fa-video-slash"></i><span>Play Video</span>`;

  document.querySelector(".main__video__button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `<i class="fas fa-video"></i><span>Stop Video</span>`;

  document.querySelector(".main__video__button").innerHTML = html;
};

let count = 0;
$(".chatButton").click(function () {
  count++;
  $(".main__right").toggle();
  if (count % 2 === 2) document.querySelector(".main__left").style.flex = 0.8;
  else document.querySelector(".main__left").style.flex = 1;
});
