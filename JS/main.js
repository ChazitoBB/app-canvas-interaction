// Selecciona el elemento canvas del documento HTML
const canvas = document.getElementById("canvas");

// Obtiene el contexto de representación 2D del canvas
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la ventana del navegador
const window_height = window.innerHeight; // Alto de la ventana
const window_width = window.innerWidth; // Ancho de la ventana

// Asigna el alto y ancho del canvas igual al alto y ancho de la ventana
canvas.height = window_height;
canvas.width = window_width;

// Establece el color de fondo del canvas
canvas.style.background = "Black";

// Define una clase para representar círculos
class Circle {
    constructor(x, y, radius, color, textColor, text, speed) {
        this.posX = x; // Posición x del centro del círculo
        this.posY = y; // Posición y del centro del círculo
        this.radius = radius; // Radio del círculo
        this.color = color; // Color del círculo
        this.textColor = textColor; // Color del texto
        this.text = text; // Texto a mostrar en el centro del círculo
        this.speed = speed; // Velocidad de movimiento del círculo en píxeles por fotograma
        this.colorIndex = 0; // Índice para controlar la transición de color
        this.colors = [
            [255, 0, 0], // Rojo
            [255, 255, 0], // Amarillo
            [0, 255, 0], // Verde
            [0, 255, 255], // Cyan
            [0, 0, 255], // Azul
            [255, 0, 255] // Magenta
        ]; // Colores RGB para la transición

        // Velocidad de desplazamiento en los ejes x e y
        this.dx = 0 * this.speed;
        this.dy = -1 * this.speed; // Movimiento hacia arriba
    }

    // Método para dibujar el círculo en el canvas
    draw(context) {
        context.beginPath();

        context.fillStyle = `rgb(${this.colors[this.colorIndex][0]}, ${this.colors[this.colorIndex][1]}, ${this.colors[this.colorIndex][2]})`; // Establece el color de relleno del círculo
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.fill(); // Aplica el relleno al círculo en lugar del trazo

        // Dibuja el texto con el color especificado
        context.fillStyle = this.textColor;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);

        context.closePath();
    }

    // Método para actualizar la posición del círculo
    update(context) {
        this.draw(context); // Dibuja el círculo en su nueva posición

        // Incrementa el índice de color para la transición
        this.colorIndex = (this.colorIndex + 1) % this.colors.length;

        // Si el círculo alcanza los límites del canvas en la parte superior, lo elimina
        if (this.posY - this.radius < 0) {
            let index = ArregloCirculos.indexOf(this);
            if (index > -1) {
                ArregloCirculos.splice(index, 1);
            }
        }

        // Si el círculo alcanza los límites del canvas en los ejes x, invierte su dirección
        if ((this.posX + this.radius) > window_width || (this.posX - this.radius) < 0) {
            this.dx = -this.dx;
        }

        // Actualiza las coordenadas del centro del círculo
        this.posX += this.dx;
        this.posY += this.dy;
    }
}

// Función para calcular la distancia entre dos puntos en el plano cartesiano
function getDistance(posx1, posy1, posx2, posy2) {
    let result = Math.sqrt(Math.pow(posx2 - posx1, 2) + Math.pow(posy2 - posy1, 2));
    return result;
}

// Arreglo para almacenar instancias de círculos
let ArregloCirculos = [];
// Número de círculos que se crearán
let NumeroCirculos = 10;

// Contador de círculos reventados
let contadorCirculos = 0;

// Bucle para crear múltiples círculos y agregarlos al arreglo
for (let i = 0; i < NumeroCirculos; i++) {
    let CirculoCreado = false;
    while (!CirculoCreado) {
        // Genera valores aleatorios para la posición, radio y velocidad de cada círculo
        let randomRadius = Math.floor(Math.random() * 60 + 35);
        let randomX = Math.random() * (window_width - 2 * randomRadius) + randomRadius;
        let randomY = window_height + randomRadius; // Aparecen desde abajo
        let randomSpeed = Math.floor(Math.random() * 2) + 1;

        let VerificacionCreacion = true;
        // Verifica si el nuevo círculo está demasiado cerca de los círculos existentes
        for (let j = 0; j < ArregloCirculos.length; j++) {
            if (getDistance(randomX, randomY, ArregloCirculos[j].posX, ArregloCirculos[j].posY) < (randomRadius + ArregloCirculos[j].radius)) {
                VerificacionCreacion = false;
                break;
            }
        }
        // Si el nuevo círculo no está demasiado cerca de los círculos existentes, lo crea y lo agrega al arreglo
        if (VerificacionCreacion) {
            let miCirculo = new Circle(randomX, randomY, randomRadius, "blue", "black", (i + 1).toString(), randomSpeed);

            ArregloCirculos.push(miCirculo);
            CirculoCreado = true;
        }
    }
}

// Función para actualizar la posición de los círculos y detectar colisiones
function updateCircle() {
    ctx.clearRect(0, 0, window_width, window_height); // Borra el canvas para cada fotograma

    // Itera sobre cada círculo en el arreglo y actualiza su posición
    ArregloCirculos.forEach(circle => {
        circle.update(ctx);
    });

    // Mostrar el contador de círculos reventados en el canvas
    ctx.font = "20px Arial";
    ctx.fillStyle = "White";
    ctx.fillText("Círculos reventados: " + contadorCirculos, 110, 40);

    requestAnimationFrame(updateCircle); // Llama a la función de actualización nuevamente para el siguiente fotograma
}

// Agregar el evento de clic para eliminar círculos
canvas.addEventListener('click', function (event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Verifica si el clic está dentro de algún círculo
    for (let i = 0; i < ArregloCirculos.length; i++) {
        const circle = ArregloCirculos[i];
        const distanceFromCenter = getDistance(mouseX, mouseY, circle.posX, circle.posY);

        // Si el clic está dentro del círculo, elimina el círculo del arreglo y aumenta el contador
        if (distanceFromCenter <= circle.radius) {
            ArregloCirculos.splice(i, 1); // Elimina el círculo del arreglo
            contadorCirculos++; // Incrementa el contador de círculos reventados
            break; // Sale del bucle una vez que se elimina el círculo
        }
    }
});

// Función para mostrar las coordenadas X e Y del mouse en el canvas
function xyMouse(event) {
    ctx.clearRect(0, 0, 100, 30);
    ctx.font = "Bold 10px cursive";
    ctx.fillStyle = "White";
    ctx.fillText("X: " + event.clientX, 350, 10);
    ctx.fillText("Y: " + event.clientY, 350, 20);
}

// Agrega un listener para el evento 'mousemove' que llame a la función xyMouse
canvas.addEventListener('mousemove', xyMouse);

updateCircle(); // Llama a la función de actualización inicialmente para iniciar la animación
