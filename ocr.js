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

// 1-11-2024
document.querySelectorAll('#x-dimension, #y-dimension, #z-dimension').forEach(input => {
    input.addEventListener('input', validateDimensions);
});


function validateDimensions() {
    let valid = true;
    const xValue = document.getElementById('x-dimension').value;
    const yValue = document.getElementById('y-dimension').value;
    const zValue = document.getElementById('z-dimension').value;
 
    // Validate X dimension
    if (!isPositiveNumber(xValue)) {
        document.getElementById('x-error').textContent = 'Valor inválido para X';
        valid = false;
    } else {
        document.getElementById('x-error').textContent = '';
        valid = true;
    }
 
    // Validate Y dimension
    if (!isPositiveNumber(yValue)) {
        document.getElementById('y-error').textContent = 'Valor inválido para Y';
        valid = false;
    } else {
        document.getElementById('y-error').textContent = '';
        valid = true;
    }
 
    // Validate Z dimension
    if (!isPositiveNumber(zValue)) {
        document.getElementById('z-error').textContent = 'Valor inválido para Z';
        valid = false;
    } else {
        document.getElementById('z-error').textContent = '';
        valid = true;
    }
 
    // Enable or disable buttons based on validation
    toggleButtons(valid);
}
 
// Função para validar se o número é positivo e sem texto ou símbolos
function isPositiveNumber(value) {
    return /^\d+(\.\d+)?$/.test(value); // Verifica se é um número positivo (inteiro ou decimal)
}
 
// Habilita ou desabilita botões com base na validação
function toggleButtons(valid) {
    const buttonsToDisable = [
        document.getElementById('image-input'),
        document.querySelector('button[onclick="readImageAndExtractDimensions()"]'),
        document.querySelector('button[onclick="updateShape()"]')
    ];
    buttonsToDisable.forEach(button => {
        button.disabled = !valid;
    });
}
