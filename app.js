const localVideo = document.querySelector("#local");
const remoteVideo = document.querySelector("#remote");
const idInput = document.querySelector("input");
const peerOneId = document.querySelector("#peerOne");
const peerTwoId = document.querySelector("#peerTwo");
const callBtn = document.querySelector("button");

const socket = io("https://video-call-server-i8op.onrender.com", {});

socket.on("connected", (message) => {
  console.log(message);
});

let peersList = [];

const peer = new Peer();
peer.on("open", (id) => {
  socket.emit("userId", id);
  socket.on("userConnected", (data) => {
    peersList = data;
    console.log("Coming from server: ", data);
    if (peersList.length === 1) peerOneId.textContent = peersList[0];
    if (peersList.length === 2) peerTwoId.textContent = peersList.at(-1);
  });
  // peerOneId.textContent = typeof peersList[0];
});

// Calling another peer

// get the id entered by the user
// const peerId = idInput.value;

async function callUser() {
  // grab the camera and mic
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  // switch to the video call and play the camera preview
  localVideo.srcObject = stream;
  localVideo.play();
  // make the call
  const call = peer.call(peersList.at(-1), stream);
  call.on("stream", (stream) => {
    remoteVideo.srcObject = stream;
    remoteVideo.play();
  });
  // call.on("data", (stream) => {
  //   document.querySelector("#remote-video").srcObject = stream;
  // });
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
