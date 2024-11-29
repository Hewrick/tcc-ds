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

const cameraInput = document.getElementById('camera-input');
const imagePreview = document.getElementById('image-preview');

cameraInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block'; // Exibe a pré-visualização
        };
        reader.readAsDataURL(file);
    }
});