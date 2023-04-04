const localVideo = document.querySelector("#local");
const remoteVideo = document.querySelector("#remote");
const idInput = document.querySelector("input");
const peerOneId = document.querySelector("#peerOne");
const peerTwoId = document.querySelector("#peerTwo");
const callBtn = document.querySelector("button");

const socket = io("http://localhost:8000", {});

socket.on("connected", (message) => {
  console.log(message);
});

let userId;

const peersList = [];

const peer = new Peer();
peer.on("open", (id) => {
  peerOneId.textContent = id;

  if (!peersList.find((peer) => peer === id)) {
    peersList.push(id);
  }

  console.log(peersList);

  socket.emit("userId", id);
  socket.on("userConnected", (data) => {
    console.log("Coming from server: ", data);
    if (data !== id) peerTwoId.textContent = data;
  });
});

async function callUser() {
  // get the id entered by the user
  const peerId = idInput.value;
  // grab the camera and mic
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });
  // switch to the video call and play the camera preview
  localVideo.srcObject = stream;
  localVideo.play();

  // make the call
  const call = peer.call(peerId, stream);
  call.on("stream", (stream) => {
    remoteVideo.srcObject = stream;
    remoteVideo.play();
  });
  //   call.on("data", (stream) => {
  //     console.log("data: ", stream);
  //     remoteVideo.srcObject = stream;
  //   });
  call.on("error", (err) => {
    console.log(err);
  });
}

// Answering A Call

peer.on("call", (call) => {
  // grab the camera and mic
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      // play the local preview
      localVideo.srcObject = stream;
      localVideo.play();

      // answer the call
      call.answer(stream);

      call.on("stream", (remoteStream) => {
        // when we receive the remote stream, play it
        remoteVideo.srcObject = remoteStream;
        remoteVideo.play();
      });
    })
    .catch((err) => {
      console.log("Failed to get local stream:", err);
    });
});

callBtn.addEventListener("click", callUser);
