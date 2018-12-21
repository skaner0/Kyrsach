navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mediaDevices.getUserMedia ||
    navigator.mozGetUserMedia;

if (navigator.getUserMedia) {

    let video = document.querySelector('video');
    let links = document.querySelector('.links');
    let takePhotoBtn = document.querySelector('#take-photo')
    let canvas = document.querySelector('canvas');
    let effectBtns = document.querySelectorAll('.effects button');

    let ctx = canvas.getContext('2d');

    let currentEffect; // Переменная с текущим эффектом

    // Эффекты
    let effects = {
        redEffect: function (pixels) {
            for (let i = 0; i < pixels.data.length; i += 4) {
                pixels.data[i + 0] = pixels.data[i + 0] + 50; // RED
                pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
                pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // BLUE
            }
            return pixels;
        },
        rgbSplit: function (pixels) {
            for (let i = 0; i < pixels.data.length; i += 4) {
                pixels.data[i - 150] = pixels.data[i + 0]; // RED
                pixels.data[i + 500] = pixels.data[i + 1]; // GREEN
                pixels.data[i - 550] = pixels.data[i + 2]; // BLUE
            }
            return pixels;
        },
        mono: function (pixels) {
            for (let y = 0; y < pixels.height; y++) {
                for (let x = 0; x < pixels.width; x++) {
                    let i = (y * 4) * pixels.width + x * 4;
                    let avg = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3;
                    pixels.data[i] = avg;
                    pixels.data[i + 1] = avg;
                    pixels.data[i + 2] = avg;
                }
            }
        },
        sepia: function (pixels) {
            for (var i = 0; i < pixels.data.length; i += 4) { //   циклически преобразуем массив, изменяя значения красного, зеленого и синего каналов
                pixels.data[i] = (pixels.data[i] * 0.393) + (pixels.data[i + 1] * 0.769) + (pixels.data[i + 2] * 0.189); // RED    
                pixels.data[i + 1] = (pixels.data[i] * 0.349) + (pixels.data[i + 1] * 0.686) + (pixels.data[i + 2] * 0.168); // GREEN
                pixels.data[i + 2] = (pixels.data[i] * 0.272) + (pixels.data[i + 1] * 0.534) + (pixels.data[i + 2] * 0.131); // BLUE
            }
            return pixels;
        },

        greenEffect: function (pixels) {
            for (let i = 0; i < pixels.data.length; i += 4) {
                pixels.data[i + 0] = pixels.data[i + 0] - 0; // RED
                pixels.data[i + 1] = pixels.data[i + 1] + 60; // GREEN
                pixels.data[i + 2] = pixels.data[i + 2] * 0; // BLUE
            }
            return pixels;
        },

        indigoEffect: function (pixels) {
            for (let i = 0; i < pixels.data.length; i += 4) {
                pixels.data[i + 0] = pixels.data[i + 0] - 0; // RED
                pixels.data[i + 1] = pixels.data[i + 1] + 40; // GREEN
                pixels.data[i + 2] = pixels.data[i + 2] + 70; // BLUE
            }
            return pixels;
        },
        
        no: function () {}
    }

    function paintToCanvas() {
        ctx.drawImage(video, 0, 0, 600, 400); // Отрисовываем кадр без эффекта
        let pixels = ctx.getImageData(0, 0, 600, 400); // Берём массив пикселей из отрисованного кадра
        if (currentEffect) effects[currentEffect](pixels); // Обрабатываем эти пиксели при помощи выбранного кнопкой метода (эффекта)
        ctx.putImageData(pixels, 0, 0) // Заново отрисовываем в канвас обработанные (уже с эффектом) пиксели
    }

    function takePhoto() {
        let photoName = `New_photo${links.children.length+1}.jpg`; // Составляем навание будущей фотки
        let dataURL = canvas.toDataURL('image/jpeg'); // Составляем data-ссылку из кадра в канвасе 
        let link = document.createElement('a'); // Создаём ссылку
        link.href = dataURL; // Добавляем ей адрес (нашу data-ссфылку)
        link.download = photoName; // Добавляем атрибут для скачивания с указанием имени скачиваемого файла
        link.innerText = photoName; // Текст для ссылки
        links.appendChild(link) // Вставляем ссылку в блок сос ссылками
    }

    // Перехватывем поток из веб-камеры
    navigator.getUserMedia({
            video: true
        },
        function (stream) {
            video.srcObject = stream; // Направляем поток в видео элемент (он скрыт через css)
            video.onloadedmetadata = function () {
                video.play(); // Включаем видео, когда данные для этого загружены
            };
        },
        function (err) {
            console.error(err);
        }
    );

    takePhotoBtn.addEventListener('click', takePhoto); // При нажатии на кнопку tp выполняется функця-обработчик +

    // Перебор кнопок с эффектами и навешивание на них обработчика события нажатия
    effectBtns.forEach(function (btn) { // Перебираем кнопки эффектов и так же навешиваем обработчик +
        btn.addEventListener('click', function (e) {
            currentEffect = btn.dataset.effect // Берём значение (имя метода-эффекта) из data-атрибута нашей кнопки
        })
    })

    // Обновляет кадр в канвасе каждые 24мс
    setInterval(function () {
        paintToCanvas()
    }, 24)

} else {
    console.log("Не поддерживается HTMl5 API доступа к камере");
}
