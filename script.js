const videoStream = document.getElementById('video-stream');
console.log(faceapi.nets);

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
]).then(startVideoStream);

function startVideoStream() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (videoStream.srcObject = stream),
    (error) => console.log(error)
  );
}

videoStream.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(videoStream);
  document.body.append(canvas);

  const displaySize = {
    width: videoStream.width,
    height: videoStream.height,
  };

  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(videoStream, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const resizedDetection = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetection);
  }, 100);
});
