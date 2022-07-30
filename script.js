const videoStream = document.getElementById('video-stream');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  faceapi.nets.ageGenderNet.loadFromUri('/models'),
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
      .withFaceExpressions()
      .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    resizedDetections.forEach((detection) => {
      const box = detection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: `${Math.round(detection.age)} years old, ${detection.gender}
        `,
      });
      drawBox.draw(canvas);
    });
  }, 100);
});
