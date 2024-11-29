function transcribeAndDistribute(imageSource) {
    const image = new Image();
    image.src = imageSource;

    Tesseract.recognize(
        image,
        'eng',
        { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
        console.log('Texto reconhecido:', text);

        const values = extractAndDistributeValues(text);

        if (values) {
            document.getElementById('x-dimension').value = values.x || '';
            document.getElementById('y-dimension').value = values.y || '';
            document.getElementById('z-dimension').value = values.z || '';
            alert('Dimensões extraídas e distribuídas com sucesso.');
        } else {
            alert('Não foi possível encontrar valores válidos para X, Y e Z.');
        }
    }).catch(error => {
        console.error('Erro no OCR:', error);
        alert('Ocorreu um erro ao processar a imagem. Tente novamente.');
    });
}

function extractAndDistributeValues(text) {
    const regex = /X\s*=\s*(\d+)\s*.*?Y\s*=\s*(\d+)\s*.*?Z\s*=\s*(\d+)/i;
    const match = text.match(regex);

    if (match) {
        return {
            x: parseInt(match[1], 10),
            y: parseInt(match[2], 10),
            z: parseInt(match[3], 10),
        };
    }

    return null;
}

function capturePhoto() {
    const photoCanvas = document.getElementById('photo-canvas');
    const cameraStream = document.getElementById('camera-stream');
    const context = photoCanvas.getContext('2d');

    photoCanvas.width = cameraStream.videoWidth;
    photoCanvas.height = cameraStream.videoHeight;
    context.drawImage(cameraStream, 0, 0, photoCanvas.width, photoCanvas.height);

    const imageDataUrl = photoCanvas.toDataURL('image/png');
    document.getElementById('captured-photo').src = imageDataUrl;
    return imageDataUrl;
}

function handleImageFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageSource = e.target.result;
            document.getElementById('image-preview').src = imageSource;
            document.getElementById('image-preview').style.display = 'block';
            document.getElementById('image-preview').dataset.imageSource = imageSource;
        };
        reader.readAsDataURL(file);
    }
}

// Botão "Capturar Foto" e controle da câmera
const cameraButton = document.getElementById('camera-button');
const cameraStream = document.getElementById('camera-stream');
let stream = null;

cameraButton.addEventListener('click', async () => {
    if (!stream) {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraStream.srcObject = stream;
            cameraStream.style.display = 'block';
            cameraButton.textContent = 'Capturar Foto';
        } catch (err) {
            alert('Erro ao acessar a câmera: ' + err.message);
        }
    } else {
        const capturedImage = capturePhoto();
        document.getElementById('captured-photo').dataset.imageSource = capturedImage;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            stream = null;
        }
        cameraStream.style.display = 'none';
        cameraButton.textContent = 'Tirar Foto';
    }
});

// Controle do arquivo carregado
const cameraInput = document.getElementById('camera-input');
cameraInput.addEventListener('change', handleImageFile);

// Botão "Ler dimensões"
const readDimensionsButton = document.getElementById('read-dimensions-button');
readDimensionsButton.addEventListener('click', () => {
    const capturedPhoto = document.getElementById('captured-photo').dataset.imageSource;
    const imagePreview = document.getElementById('image-preview').dataset.imageSource;

    if (capturedPhoto) {
        transcribeAndDistribute(capturedPhoto);
    } else if (imagePreview) {
        transcribeAndDistribute(imagePreview);
    } else {
        alert('Nenhuma imagem disponível para leitura. Capture uma foto ou carregue uma imagem.');
    }
});