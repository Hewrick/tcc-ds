function readImageAndExtractDimensions() {
    const imageInput = document.getElementById('image-input');
    const file = imageInput.files[0];

    if (!file) {
        alert('Por favor, selecione uma imagem primeiro.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        const image = new Image();
        image.src = event.target.result;

        Tesseract.recognize(
            image,
            'eng',
            { logger: m => console.log(m) }
        ).then(({ data: { text } }) => {
            const dimensions = extractDimensionsFromText(text);

            if (dimensions) {
                document.getElementById('x-dimension').value = dimensions.x;
                document.getElementById('y-dimension').value = dimensions.y;
                document.getElementById('z-dimension').value = dimensions.z;
            } else {
                alert('Dimensões não encontradas na imagem.');
            }
        });
    };

    reader.readAsDataURL(file);
}

function extractDimensionsFromText(text) {
    const regex = /X:\s*(\d+)\s*Y:\s*(\d+)\s*Z:\s*(\d+)/i;
    const match = text.match(regex);

    if (match) {
        return {
            x: match[1],
            y: match[2],
            z: match[3]
        };
    }

    return null;
}
