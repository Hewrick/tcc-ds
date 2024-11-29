function transcribeAndDistribute() {
    const imageInput = document.getElementById('image-input');
    const file = imageInput.files[0];

    if (!file) {
        alert('Por favor, selecione uma imagem.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        const image = new Image();
        image.src = event.target.result;

        Tesseract.recognize(
            image,
            'eng',
            { logger: m => console.log(m) } 
        ).then(({ data: { text } }) => {
            console.log('Texto reconhecido:', text);

            // extrair e distribuir corretamente
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
    };

    reader.readAsDataURL(file);
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

const cameraButton = document.getElementById('camera-button');
const cameraStream = document.getElementById('camera-stream');
const photoCanvas = document.getElementById('photo-canvas');
const capturedPhoto = document.getElementById('captured-photo');
const imageInput = document.getElementById('image-input');

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
        capturePhoto();
        stopCamera();
        cameraButton.textContent = 'Tirar Foto';
    }
});

function capturePhoto() {
    const context = photoCanvas.getContext('2d');
    photoCanvas.width = cameraStream.videoWidth;
    photoCanvas.height = cameraStream.videoHeight;
    context.drawImage(cameraStream, 0, 0, photoCanvas.width, photoCanvas.height);

    const imageData = photoCanvas.toDataURL('image/png');
    capturedPhoto.src = imageData;
    capturedPhoto.style.display = 'block';

    // Simula o upload da imagem para ser usada no app
    const imageBlob = dataURLToBlob(imageData);
    const imageFile = new File([imageBlob], 'captured_photo.png', { type: 'image/png' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(imageFile);
    imageInput.files = dataTransfer.files;
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        cameraStream.srcObject = null;
        stream = null;
        cameraStream.style.display = 'none';
    }
}

function dataURLToBlob(dataURL) {
    const [header, base64] = dataURL.split(',');
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: header.split(':')[1].split(';')[0] });
}