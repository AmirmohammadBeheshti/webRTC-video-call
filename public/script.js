const socket = io("/");
const videoGrid = document.getElementById("video-grid");
// first params is Id , but dont pass the id because i want  to generate my id
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});
const peers = {};
myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});
const myVideo = document.createElement("video");
// muted my video because we dont want hear my sound
myVideo.muted = true;

// pass video and audio true for send to another people
// the navigator object represents the browser's navigator. It provides information about the user's browser and device
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);
    socket.on("user-connected", (userId) => {
      console.log("User Connected : ", userId);
      connectToNewUser(userId, stream);
    });
    // connect the users
    myPeer.on("call", (call) => {
      call.answer(stream);
      // stream the call for connect both user
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    // pass the userId from server.js
    socket.on("user-disconnected", (userId) => {
      console.log("user-disconnected => ", userId);
      if (peers[userId]) peers[userId].close();
    });
  });

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}
