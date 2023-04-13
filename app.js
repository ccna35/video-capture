const localVideo = document.querySelector("#local");
const remoteVideo = document.querySelector("#remote");
const peerOneId = document.querySelector("#peerOne");
const peerTwoId = document.querySelector("#peerTwo");
const callBtn = document.querySelector("button");
const peerOneLabel = document.querySelector("[for=peerOne]");
const peerTwoLabel = document.querySelector("[for=peerTwo]");

const socket = io("https://video-call-server-i8op.onrender.com", {});

socket.on("connected", (message) => {
  console.log(message);
});

let peersList = []; // contains a list of avaiable peers

const peer = new Peer();
peer.on("open", (id) => {
  socket.emit("userId", id);
  socket.on("userConnected", (data) => {
    peersList = data;
    console.log("Coming from server: ", data);
    if (peersList.length === 0) {
      callBtn.classList.add("d-none");
    }
    if (peersList.length === 1) {
      callBtn.classList.add("d-none");
      // const newPelement = createPeerElement("peerOne");
      // newPelement.textContent = peersList[0];
      // peerOneLabel.insertAdjacentElement("afterend", newPelement);
      peerOneId.textContent = peersList[0];
      peerTwoId.textContent = "";
      // peerOneId.setAttribute("class", "alert alert-success");
      // peerTwoId.removeAttribute("class", "alert alert-success");
    }
    if (peersList.length === 2) {
      callBtn.classList.remove("d-none");
      // const newPelement = createPeerElement("peerTwo");
      // newPelement.textContent = peersList.at(-1);
      // peerTwoLabel.insertAdjacentElement("afterend", newPelement);
      peerTwoId.textContent = peersList.at(-1);
      // peerTwoId.setAttribute("class", "alert alert-success");
    }
  });
});

// Calling another peer

// get the id entered by the user
// const peerId = idInput.value;

async function callUser() {
  // grab the camera and mic
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
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

// A function to create P element that contains the user ID

function createPeerElement(peerNum) {
  const pElement = document.createElement("p");
  pElement.setAttribute("id", peerNum);
  pElement.setAttribute("class", "alert alert-success");
  return pElement;
}
