const { jsPDF } = require('jspdf');

console.log('Generating Clean Client Manual PDF...');

const doc = new jsPDF({
  orientation: 'p',
  unit: 'mm',
  format: 'a4'
});

const pageWidth = doc.internal.pageSize.width;
const pageHeight = doc.internal.pageSize.height;
const margin = 20;
const contentWidth = pageWidth - (margin * 2);
let y = 20;

// Color Palette
const COLOR_PRIMARY = [13, 148, 136]; // Teal
const COLOR_DARK = [15, 23, 42];      // Slate Dark
const COLOR_MUTED = [100, 116, 139];   // Muted Text
const COLOR_ALERT = [225, 29, 72];     // Rose Alert
const COLOR_TEXT = [51, 65, 85];      // Body Text

function checkPageBreak(neededHeight) {
  if (y + neededHeight > pageHeight - margin - 15) {
    doc.addPage();
    y = margin + 10;
    drawHeader();
  }
}

function drawHeader() {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
  doc.text("Plataforma Educativa MobilArt - Manual de Instrucciones", margin, 12);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, 14, pageWidth - margin, 14);
}

function printTitle(text) {
  checkPageBreak(15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text(text, margin, y);
  y += 10;
}

function printSubtitle(text) {
  checkPageBreak(10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(COLOR_DARK[0], COLOR_DARK[1], COLOR_DARK[2]);
  doc.text(text, margin, y);
  y += 7;
}

function printParagraph(text) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
  
  const lines = doc.splitTextToSize(text, contentWidth);
  const lineHeight = 5.5;
  
  checkPageBreak(lines.length * lineHeight);
  
  lines.forEach(line => {
    doc.text(line, margin, y);
    y += lineHeight;
  });
  y += 2;
}

function printBullet(title, desc) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLOR_DARK[0], COLOR_DARK[1], COLOR_DARK[2]);
  
  const bulletSymbol = "• ";
  const fullText = bulletSymbol + title + ": " + desc;
  const lines = doc.splitTextToSize(fullText, contentWidth - 5);
  const lineHeight = 5.5;
  
  checkPageBreak(lines.length * lineHeight);
  
  let isFirst = true;
  lines.forEach(line => {
    if (isFirst) {
      doc.setFont('helvetica', 'bold');
      doc.text(bulletSymbol + title + ":", margin, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
      
      const titleLen = doc.getTextWidth(bulletSymbol + title + ": ");
      const rest = line.substring((bulletSymbol + title + ":").length);
      doc.text(rest, margin + titleLen, y);
      isFirst = false;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.text(line, margin + 5, y);
    }
    y += lineHeight;
  });
  y += 1.5;
}

function printWarningBox(title, text) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  
  const lines = doc.splitTextToSize(text, contentWidth - 10);
  const boxHeight = (lines.length * 5.5) + 12;
  
  checkPageBreak(boxHeight);
  
  doc.setFillColor(254, 242, 242); 
  doc.rect(margin, y, contentWidth, boxHeight, 'F');
  
  doc.setFillColor(COLOR_ALERT[0], COLOR_ALERT[1], COLOR_ALERT[2]);
  doc.rect(margin, y, 1.5, boxHeight, 'F');
  
  y += 5;
  doc.setTextColor(COLOR_ALERT[0], COLOR_ALERT[1], COLOR_ALERT[2]);
  doc.text(title, margin + 5, y);
  y += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
  
  lines.forEach(line => {
    doc.text(line, margin + 5, y);
    y += 5.5;
  });
  
  y += 4;
}

function printInfoBox(title, text) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  
  const lines = doc.splitTextToSize(text, contentWidth - 10);
  const boxHeight = (lines.length * 5.5) + 12;
  
  checkPageBreak(boxHeight);
  
  doc.setFillColor(240, 253, 250); 
  doc.rect(margin, y, contentWidth, boxHeight, 'F');
  
  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(margin, y, 1.5, boxHeight, 'F');
  
  y += 5;
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text(title, margin + 5, y);
  y += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
  
  lines.forEach(line => {
    doc.text(line, margin + 5, y);
    y += 5.5;
  });
  
  y += 4;
}

// ----------------------------------------------------
// 1. PORTADA
// ----------------------------------------------------
doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
doc.rect(0, 0, pageWidth, 60, 'F');

doc.setFillColor(COLOR_DARK[0], COLOR_DARK[1], COLOR_DARK[2]);
doc.rect(0, 60, pageWidth, 5, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(32);
doc.setTextColor(255, 255, 255);
doc.text("MOBILART STUDIO", margin, 38);

doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.setTextColor(COLOR_DARK[0], COLOR_DARK[1], COLOR_DARK[2]);
doc.text("MANUAL DE USUARIO E INSTRUCCIONES DE USO", margin, 85);

doc.setFont('helvetica', 'normal');
doc.setFontSize(11);
doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
doc.text("Guía práctica de funcionamiento, administración de contenidos pedagógicos e instrucciones de control en vivo para el docente y la institución.", margin, 94, { maxWidth: contentWidth });

doc.setDrawColor(226, 232, 240);
doc.setLineWidth(1);
doc.line(margin, 115, pageWidth - margin, 115);

y = 130;
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(COLOR_DARK[0], COLOR_DARK[1], COLOR_DARK[2]);
doc.text("DATOS DE LA PLATAFORMA", margin, y);
y += 8;

const metadata = [
  ["Plataforma:", "MobilArt Studio"],
  ["Enfoque Pedagógico:", "Resolución de conflictos y paz a través del arte"],
  ["Autor Pedagógico:", "Joan Didier Betancur"],
  ["Manual Dirigido a:", "Docentes, Directivos y Administradores Escolares"],
  ["Versión del Manual:", "1.0 (Manual Funcional sin datos técnicos)"],
  ["Fecha de Publicación:", "Junio 2026"]
];

metadata.forEach(row => {
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
  doc.text(row[0], margin, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
  doc.text(row[1], margin + 55, y);
  y += 7;
});

doc.setFillColor(COLOR_DARK[0], COLOR_DARK[1], COLOR_DARK[2]);
doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.setTextColor(255, 255, 255);
doc.text("Documento explicativo de funcionamiento para el salón de clases y administración del colegio.", margin, pageHeight - 11);

// ----------------------------------------------------
// 2. SECCIÓN 1: INTRODUCCIÓN
// ----------------------------------------------------
doc.addPage();
y = margin + 10;
drawHeader();

printTitle("1. ¿Qué es MobilArt Studio?");

printParagraph("MobilArt es una herramienta educativa digital diseñada para ayudar a los estudiantes a procesar sus emociones, aprender sobre convivencia pacífica y explorar el arte de forma divertida. La aplicación funciona en computadores, tabletas y teléfonos celulares.");

printParagraph("La plataforma tiene dos accesos totalmente diferenciados:");

printBullet("El Portal del Estudiante (Público)", "Es la pantalla que ven los niños. No requiere de registros ni contraseñas complejas. Contiene juegos interactivos, salones de clase organizados por grados, galerías culturales y un termómetro emocional.");

printBullet("El Panel del Docente (Privado)", "Es el área de control exclusiva para el profesor. Requiere un usuario y una contraseña de seguridad. Desde aquí, el docente puede subir contenidos (fotos, videos, archivos), cambiar las preguntas de las pruebas, ver las notas de los alumnos, leer las sugerencias que los niños envían y realizar actividades interactivas en vivo.");

// ----------------------------------------------------
// 3. SECCIÓN 2: MANUAL DEL ESTUDIANTE
// ----------------------------------------------------
doc.addPage();
y = margin + 10;
drawHeader();

printTitle("2. Manual de Uso para Estudiantes");

printParagraph("Cuando los alumnos ingresan a MobilArt, pueden interactuar de forma autónoma con las siguientes secciones:");

printSubtitle("1. Salón por Grados (Primero a Quinto):");
printParagraph("Al pulsar sobre su respectivo grado, los alumnos ingresan a un aula virtual donde encuentran:");
printBullet("Fichas pedagógicas", "Botones para descargar documentos en PDF de tareas y lecturas preparadas por el docente.");
printBullet("Videos explicativos", "Un reproductor para ver los videos educativos asignados a su curso.");
printBullet("Mural del Curso", "Una galería de fotos con imágenes de los trabajos, salidas y convivencias de su grupo.");

printSubtitle("2. Colombia Viva (Galería de Paisajes):");
printParagraph("Una galería que muestra imágenes representativas del patrimonio natural y cultural (como Caño Cristales, la Paloma de la Paz o el Valle del Cocora). Al pulsar sobre un paisaje, se abre un video didáctico para que el estudiante aprenda sobre ese elemento nacional.");

printSubtitle("3. Emocionómetro (Convivencia):");
printParagraph("Un espacio donde el estudiante selecciona con un emoji cómo se siente en el día. También incluye una casilla de texto donde el alumno puede escribir reportes o sugerencias al docente de manera 100% anónima para reportar conflictos o dar ideas.");

printSubtitle("4. Juegos de Paz:");
printBullet("Unir Puntos", "Dibuja figuras emblemáticas del arte y la paz conectando números.");
printBullet("El Laberinto", "Mueve un personaje por el laberinto respondiendo dilemas sobre paz.");
printBullet("Sopa de Letras", "Busca palabras sobre valores (respeto, empatía, diálogo, perdón).");
printBullet("Juego de Memoria", "Encuentra las parejas de cartas artísticas.");
printBullet("Tablero de Retos", "Juego grupal interactivo.");

printSubtitle("5. Obtención de Diploma de Honor:");
printParagraph("A medida que juegan, los alumnos ganan 'Artipuntos'. Al final, pueden registrar su nombre en la sección de logros y descargar automáticamente un diploma digital personalizado que los certifica como guardianes de la paz.");

// ----------------------------------------------------
// 4. SECCIÓN 3: MANUAL DE CONTROL DOCENTE
// ----------------------------------------------------
doc.addPage();
y = margin + 10;
drawHeader();

printTitle("3. Manual del Panel de Control Docente");

printParagraph("Este panel permite al profesor administrar todo lo que los alumnos ven en tiempo real y hacer seguimiento a sus aprendizajes.");

printSubtitle("Cómo ingresar:");
printBullet("Acceso", "Ingresa en el navegador web a la dirección del proyecto seguida de '/admin/dashboard'.");
printBullet("Credenciales", "Digita tu nombre de usuario y tu contraseña y pulsa 'Entrar'.");

printSubtitle("Funciones de las Pestañas:");

printBullet("📂 Gestión de Grupos (Pestaña 1)", "Permite elegir el grupo escolar (de 1° a 5°) y modificar sus contenidos:");
printParagraph("  - 'Guardar Información': Cambia el texto descriptivo del salón del grupo.\n  - 'Subir Video Local' / '+ Agregar URL': Añade videos al reproductor de ese salón.\n  - 'Subir PDF Local': Añade archivos PDF de fichas y guías para que los alumnos las descarguen.\n  - 'Subir Imagen Local': Sube fotos de la clase al mural del grupo. (El sistema las optimiza y comprime al instante para que no ralenticen la app).\n  - 'Banco de Preguntas': Permite crear preguntas de opción múltiple para el examen del grupo, definir la respuesta correcta y borrar preguntas anteriores.");

printBullet("📨 Buzón de Sugerencias (Pestaña 2)", "Bandeja donde llegan los mensajes anónimos del Emocionómetro de los estudiantes:");
printParagraph("  - 'Archivar': Oculta las sugerencias leídas para mantener la bandeja despejada.\n  - 'Eliminar': Borra definitivamente el mensaje de sugerencia.");

printBullet("🎓 Calificaciones (Pestaña 3)", "Muestra la tabla de notas del examen de los estudiantes. Verás el nombre del alumno, la fecha/hora en que lo hizo, los puntos ganados y cuántas vidas (corazones) le quedaron. Puedes archivar o borrar los registros viejos.");

printBullet("🎥 Videos de Paisajes (Pestaña 4)", "Te permite modificar los enlaces de los videos didácticos que ven los alumnos al entrar a la sección de paisajes 'Colombia Viva'.");

printBullet("📊 Encuestas en Vivo (Pestaña 5)", "Permite redactar una pregunta, elegir opciones (Opción múltiple o Caritas emoji), poner un temporizador y pulsar 'Lanzar'. Automáticamente, a todos los estudiantes que tengan la app abierta les saltará una ventana emergente para que voten y verás las barras de resultados crecer en tiempo real en tu pantalla.");

// ----------------------------------------------------
// 5. SECCIÓN 4: CONTROL DE EXÁMENES Y ATRAJO MÓVIL
// ----------------------------------------------------
doc.addPage();
y = margin + 10;
drawHeader();

printTitle("4. Control de Exámenes (Triviarte)");

printParagraph("Para evitar que los alumnos respondan el examen fuera del horario de clases, la evaluación cuenta con un candado remoto que el profesor controla:");

printBullet("Indicador de Estado", "En tu panel verás si la evaluación de cada grupo está ABIERTA (verde) o CERRADA (rojo).");
printBullet("Control", "Puedes presionar '🔓 ABRIR' para permitir que los alumnos entren a resolver la prueba, o '🔒 CERRAR' para bloquear el acceso instantáneamente.");

printInfoBox("Atajo Rápido para Celular (/admin/triviarte)", "Existe una dirección simplificada diseñada para el teléfono celular del docente: '/admin/triviarte'. Es una pantalla ligera de carga rápida que contiene únicamente los botones de abrir/cerrar la evaluación de los 5 grupos de grado. Es ideal para abrir el examen en el salón de clases en un segundo desde tu teléfono.");

// ----------------------------------------------------
// 6. SECCIÓN 5: RECOMENDACIONES Y ADVERTENCIAS
// ----------------------------------------------------
doc.addPage();
y = margin + 10;
drawHeader();

printTitle("5. Recomendaciones y Advertencias de Uso");

printParagraph("Sigue estas sencillas sugerencias para garantizar que la plataforma MobilArt funcione siempre de manera rápida, óptima y segura:");

printSubtitle("Consejos Prácticos:");

printBullet("Subida de Videos", "Para evitar que la plataforma se vuelva lenta, se recomienda subir tus videos educativos a YouTube y pegar únicamente el enlace web (la URL) en el panel de administración. Subir archivos de video directamente al panel consume mucho espacio y puede hacer lento el sistema.");

printBullet("Subida de Fotografías", "Sube siempre las fotos del curso utilizando el botón 'Subir Imagen Local' de tu panel de administración. Este botón tiene un compresor inteligente que reduce el tamaño de las imágenes tomadas con celulares (incluso fotos pesadas de iPhone y Samsung) antes de guardarlas, manteniendo la aplicación ligera.");

printBullet("Archivo de la Tesis (Proyecto Joan)", "En la pestaña principal del administrador puedes subir el PDF de tu tesis académica. Esto activará el botón de descarga en la página de inicio para los visitantes.");

printWarningBox("ADVERTENCIA DE SEGURIDAD DOCENTE", "Las credenciales del administrador (Usuario y Contraseña) son confidenciales. \n\n1. No compartas los datos de acceso con los estudiantes, ya que podrían borrar notas, leer los reportes anónimos de sus compañeros o cambiar las preguntas de las pruebas.\n\n2. Cierra siempre tu sesión docente al terminar tus clases para evitar accesos indebidos desde los computadores del aula.");

// ----------------------------------------------------
// 7. PIE DE PÁGINAS Y GENERACIÓN
// ----------------------------------------------------
const totalPages = doc.internal.getNumberOfPages();
for (let i = 1; i <= totalPages; i++) {
  doc.setPage(i);
  if (i > 1) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
    doc.text("© 2026 MobilArt Studio. Todos los derechos reservados.", margin, pageHeight - 10);
  }
}

const pdfPath = 'manual_usuario_mobilart.pdf';
doc.save(pdfPath);
console.log(`Clean Manual PDF created successfully at: ${pdfPath}`);
