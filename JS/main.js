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

// Carga la imagen del alien
const alienImage = new Image();
alienImage.src = "/img/Alien.png";

// Carga la imagen de explosión
const explosionImage = new Image();
explosionImage.src = "/img/Explosion.png"; // Ruta de la imagen de explosión

// Define una clase para representar alienígenas (en lugar de círculos)
class Alien {
    constructor(x, y, radius, text, speed) {
        this.posX = x; // Posición x del centro del alien
        this.posY = y; // Posición y del centro del alien
        this.radius = radius; // Radio del alien (se usa para detección de clics)
        this.text = text; // Texto a mostrar en el centro del alien
        this.speed = speed; // Velocidad de movimiento del alien en píxeles por fotograma

        // Velocidad de desplazamiento en los ejes x e y
        this.dx = 0;
        this.dy = -1 * this.speed; // Movimiento hacia arriba
    }

    // Método para dibujar el alien en el canvas
    draw(context) {
        context.drawImage(alienImage, this.posX - this.radius, this.posY - this.radius, this.radius * 2, this.radius * 2);

        // Dibuja el texto en el centro de la imagen
        context.fillStyle = "black";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
    }

    // Método para actualizar la posición del alien
    update(context) {
        this.draw(context); // Dibuja el alien en su nueva posición

        // Si el alien alcanza los límites del canvas en la parte superior, lo elimina
        if (this.posY - this.radius < 0) {
            let index = ArregloAliens.indexOf(this);
            if (index > -1) {
                ArregloAliens.splice(index, 1);
                gameOver(); // Termina el juego si un alien alcanza la parte superior
            }
        }

        // Si el alien alcanza los límites del canvas en los ejes x, invierte su dirección
        if ((this.posX + this.radius) > window_width || (this.posX - this.radius) < 0) {
            this.dx = -this.dx;
        }

        // Actualiza las coordenadas del centro del alien
        this.posX += this.dx;
        this.posY += this.dy;
    }
}

// Clase para la animación de explosión
class Explosion {
    constructor(x, y, radius) {
        this.posX = x; // Posición x del centro de la explosión
        this.posY = y; // Posición y del centro de la explosión
        this.radius = radius; // Radio de la explosión
        this.frame = 0; // Fotograma actual de la animación
        this.maxFrame = 28; // Número máximo de fotogramas de la animación (ajustar según tu imagen)
    }

    // Método para dibujar la explosión en el canvas
    draw(context) {
        const size = this.radius * 2;
        const frameWidth = explosionImage.width / this.maxFrame; // Ancho de un fotograma
        context.drawImage(explosionImage, this.frame * frameWidth, 0, frameWidth, explosionImage.height, this.posX - this.radius, this.posY - this.radius, size, size);
    }

    // Método para actualizar la animación de la explosión
    update(context) {
        this.draw(context);
        this.frame++;
        if (this.frame >= this.maxFrame) {
            let index = ArregloExplosiones.indexOf(this);
            if (index > -1) {
                ArregloExplosiones.splice(index, 1);
            }
        }
    }
}

// Función para calcular la distancia entre dos puntos en el plano cartesiano
function getDistance(posx1, posy1, posx2, posy2) {
    let result = Math.sqrt(Math.pow(posx2 - posx1, 2) + Math.pow(posy2 - posy1, 2));
    return result;
}

// Arreglo para almacenar instancias de aliens
let ArregloAliens = [];
// Número inicial de aliens que se crearán
let NumeroAliens = 5;

// Contador de aliens reventados
let contadorAliens = 0;

// Arreglo para almacenar explosiones
let ArregloExplosiones = [];

// Nivel actual
let nivel = 1;

// Récord de puntuación más alta
let record = localStorage.getItem("record") || 0;


// Bucle para crear múltiples aliens y agregarlos al arreglo
function crearAliens() {
    for (let i = 0; i < NumeroAliens; i++) {
        let AlienCreado = false;
        while (!AlienCreado) {
            // Genera valores aleatorios para la posición, radio y velocidad de cada alien
            let randomRadius = Math.floor(Math.random() * 60 + 40);
            let randomX = Math.random() * (window_width - 2 * randomRadius) + randomRadius;
            let randomY = window_height + randomRadius; // Aparecen desde abajo
            let randomSpeed = 1 + (nivel * 0.2); // Velocidad inicial 1, aumenta 0.1 por nivel

            let VerificacionCreacion = true;
            // Verifica si el nuevo alien está demasiado cerca de los aliens existentes
            for (let j = 0; j < ArregloAliens.length; j++) {
                if (getDistance(randomX, randomY, ArregloAliens[j].posX, ArregloAliens[j].posY) < (randomRadius + ArregloAliens[j].radius)) {
                    VerificacionCreacion = false;
                    break;
                }
            }
            // Si el nuevo alien no está demasiado cerca de los aliens existentes, lo crea y lo agrega al arreglo
            if (VerificacionCreacion) {
                let miAlien = new Alien(randomX, randomY, randomRadius, (i + 1).toString(), randomSpeed);

                ArregloAliens.push(miAlien);
                AlienCreado = true;
            }
        }
    }
}


// Función para actualizar la posición de los aliens y detectar colisiones
function updateAlien() {
    ctx.clearRect(0, 0, window_width, window_height); // Borra el canvas para cada fotograma

    // Itera sobre cada alien en el arreglo y actualiza su posición
    ArregloAliens.forEach(alien => {
        alien.update(ctx);
    });

    // Itera sobre cada explosión en el arreglo y actualiza su animación
    ArregloExplosiones.forEach(explosion => {
        explosion.update(ctx);
    });

    // Mostrar el contador de aliens reventados en el canvas
    ctx.font = "20px Arial";
    ctx.fillStyle = "White";
    ctx.fillText("Score: " + contadorAliens, 60, 40);
    ctx.fillText("Record: " + record, 60, 60);
    ctx.fillText("Nivel: " + nivel, 60, 80);

    requestAnimationFrame(updateAlien); // Llama a la función de actualización nuevamente para el siguiente fotograma
}

// Función para finalizar el juego
function gameOver() {
    if (contadorAliens > record) {
        localStorage.setItem("record", contadorAliens);
        record = contadorAliens;
    }
    alert("Game Over! Puntuación: " + contadorAliens);
    document.location.reload();
}

// Agregar el evento de clic para eliminar aliens
canvas.addEventListener('click', function (event) {
    // Obtén las coordenadas del clic ajustadas según la posición del canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Verifica si el clic está dentro de algún alien
    for (let i = 0; i < ArregloAliens.length; i++) {
        const alien = ArregloAliens[i];
        const distanceFromCenter = getDistance(mouseX, mouseY, alien.posX, alien.posY);

        // Si el clic está dentro del alien, elimina el alien del arreglo y aumenta el contador
        if (distanceFromCenter <= alien.radius) {
            ArregloAliens.splice(i, 1); // Elimina el alien del arreglo
            contadorAliens++; // Incrementa el contador de aliens reventados

            // Crea una nueva explosión en la posición del alien eliminado
            let explosion = new Explosion(alien.posX, alien.posY, alien.radius);
            ArregloExplosiones.push(explosion);

            break; // Sale del bucle una vez que se elimina el alien
        }
    }

    // Si todos los aliens han sido eliminados, pasa al siguiente nivel
    if (ArregloAliens.length === 0) {
        nivel++;
        NumeroAliens++;
        crearAliens();
    }
});

// Cambiar el icono del mouse al pasar sobre el canvas
canvas.style.cursor = "url(/img/Gunshot.png), auto";

crearAliens(); // Llama a la función para crear los aliens inicialmente
updateAlien(); // Llama a la función de actualización inicialmente para iniciar la animación
