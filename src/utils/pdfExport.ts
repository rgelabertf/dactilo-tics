import { jsPDF } from 'jspdf';
import { Attempt } from '../types';

// Helper to determine Benchmark information modeled from student guidelines
function getLevelDescription(maxWpm: number) {
  if (maxWpm >= 45) {
    return { level: 5, name: 'Maestro de Leyenda', desc: 'Súper velocidad dactilográfica con gran control y memoria espacial.' };
  } else if (maxWpm >= 33) {
    return { level: 4, name: 'Técnico de Oro', desc: 'Fluidez dactilar excelente, altamente idónea para nivel bilingüe.' };
  } else if (maxWpm >= 22) {
    return { level: 3, name: 'Digitador de Plata', desc: 'Nivel óptimo del sistema que denota un mapeo táctil exitoso.' };
  } else if (maxWpm >= 11) {
    return { level: 2, name: 'Dactilógrafo de Bronce', desc: 'Velocidad de arranque ideal. Empieza a usar múltiples dedos.' };
  } else {
    return { level: 1, name: 'Iniciador del Teclado', desc: 'Etapa inicial de posicionamiento corporal e indexación táctil.' };
  }
}

// Draw page background accents and master title headers
function drawPdfHeader(doc: jsPDF, title: string, subtitle: string, pageNumber: number) {
  // Deep indigo theme banner (Royal Core Theme)
  const primaryColor = { r: 15, g: 23, b: 42 }; // slate-900
  const accentColor = { r: 79, g: 70, b: 229 }; // indigo-600
  
  // Custom header backdrop card style
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(15, 12, 180, 24, 'F');
  
  // Indigo side accent bar
  doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
  doc.rect(15, 12, 4, 24, 'F');

  // Title text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(title.toUpperCase(), 24, 21);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 201, 230);
  doc.text(subtitle, 24, 28);

  // Top right badge context
  doc.setFontSize(8);
  doc.setTextColor(165, 180, 252);
  doc.text('SISTEMA EVALUATIVO TICs - PLATAFORMA DE DACTILOGRAFÍA', 195, 20, { align: 'right' });
  
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Páguina ${pageNumber}`, 195, 27, { align: 'right' });

  // Thin line below header card
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 42, 195, 42);
}

// Draw signature zone for pedagogical verification
function drawSignatureZone(doc: jsPDF, y: number) {
  if (y > 255) {
    doc.addPage();
    y = 35;
  }
  
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  
  // Dotted lines
  doc.line(25, y + 25, 80, y + 25);
  doc.line(130, y + 25, 185, y + 25);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Docente de Grado o Instructor TICs', 52.5, y + 30, { align: 'center' });
  doc.text('Coordinador Académico / Dirección', 157.5, y + 30, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Firma y Sello Oficial', 52.5, y + 34, { align: 'center' });
  doc.text('Validación Administrativa', 157.5, y + 34, { align: 'center' });
}

// ==========================================
// 1. CLASS-WIDE PERFORMANCE SUMMARY PDF
// ==========================================
export function exportClassSummaryPDF(
  studentsList: { name: string; attempts: number; avgSpeed: number; avgAccuracy: number }[],
  attempts: Attempt[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let pageNum = 1;
  const districtName = 'Plataforma DactiloTICs';
  const schoolName = 'DactiloTICs';
  const className = 'Grupo Activo';

  // Draw first page header
  drawPdfHeader(doc, 'Resumen de Rendimiento de Clase', `Reporte Curricular Consolidador - Escuela Ada Lovelace`, pageNum);

  let y = 50;

  // Metadata block (Statistics highlights card)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(15, y, 180, 28, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('METADATOS DEL CURSO', 20, y + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Distrito Escolar: ${districtName}`, 20, y + 12);
  doc.text(`Institución: ${schoolName}`, 20, y + 17);
  doc.text(`Clase: ${className}`, 20, y + 22);

  const totalClassAttempts = attempts.length;

  const avgClassSpeed = studentsList.length > 0 
    ? Math.round(studentsList.reduce((sum, s) => sum + s.avgSpeed, 0) / studentsList.length)
    : 0;

  const avgClassAccuracy = studentsList.length > 0
    ? Math.round(studentsList.reduce((sum, s) => sum + s.avgAccuracy, 0) / studentsList.length)
    : 0;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('MÉTRICAS CORE DE CLASE:', 110, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Matrícula Registrada: ${studentsList.length} estudiantes`, 110, y + 12);
  doc.text(`Sesiones Realizadas: ${totalClassAttempts} prácticas`, 110, y + 17);
  doc.text(`Velocidad Promedio:  ${avgClassSpeed} pal/min`, 110, y + 22);
  doc.text(`Precisión Promedio:  ${avgClassAccuracy}% de acierto`, 110, y + 25);

  y += 36;

  // Introduction / Parental - Admin Context
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('ALINEACIÓN CURRICULAR CON ESTÁNDARES EDUCATIVOS TICs', 15, y);
  
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const policyText = 'El presente informe recopila los avances dactilográficos del curso evaluado basándose en el estándar de metas curriculares de TICs. El análisis evalúa el desempeño neuromuscular, el desarrollo motor de coordinación bimanual de dedos y la consistencia en el control y precisión táctil del teclado físico sin mirar.';
  const linesPolicy = doc.splitTextToSize(policyText, 180);
  doc.text(linesPolicy, 15, y);
  
  y += (linesPolicy.length * 4) + 6;

  // Class Table Header
  doc.setFillColor(30, 41, 59); // dark grey
  doc.rect(15, y, 180, 7.5, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('ESTUDIANTE', 18, y + 5);
  doc.text('EJERCICIOS', 82, y + 5);
  doc.text('RENDIMIENTO', 108, y + 5);
  doc.text('PRECISIÓN', 138, y + 5);
  doc.text('ESTADO', 165, y + 5);

  y += 8;

  // Print Table Rows
  studentsList.forEach((student, index) => {
    // Page break test
    if (y > 235) {
      // Draw signature or footer elements, then create page
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generado en ${new Date().toLocaleDateString('es-ES')} - Reportes Escolares Consolidados`, 15, 285);
      
      doc.addPage();
      pageNum += 1;
      drawPdfHeader(doc, 'Resumen de Rendimiento de Clase', `Reporte Curricular Consolidador - Escuela Ada Lovelace`, pageNum);
      
      // Reprint Table Header
      y = 52;
      doc.setFillColor(30, 41, 59);
      doc.rect(15, y, 180, 7.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('ESTUDIANTE', 18, y + 5);
      doc.text('EJERCICIOS', 82, y + 5);
      doc.text('RENDIMIENTO', 108, y + 5);
      doc.text('PRECISIÓN', 138, y + 5);
      doc.text('ESTADO', 165, y + 5);
      y += 8;
    }

    // Row alternating background
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(15, y, 180, 7, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(student.name, 18, y + 5);

    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`${student.attempts} prácticas`, 82, y + 5);
    
    // speed
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${student.avgSpeed} pal/min`, 108, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${student.avgAccuracy}%`, 138, y + 5);

    // Benchmarking status
    const target = 33;
    const isMet = student.avgSpeed >= target;

    if (isMet) {
      doc.setTextColor(16, 124, 65); // green text
      doc.text('SUPERADO', 158, y + 5);
    } else {
      doc.setTextColor(168, 44, 52); // red text
      doc.text('BAJO META', 158, y + 5);
    }

    // Separate line
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.3);
    doc.line(15, y + 7, 195, y + 7);

    y += 7;
  });

  // End of table marker
  y += 10;

  // Recommendations or Summary footer text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('OBSERVACIONES GENERALES RECOMENDADAS PARA PARENTAL / REVISORES', 15, y);
  
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const adviceLines = [
    '1. Reforzamiento Familiar: Aquellos alumnos con la etiqueta "BAJO META" deben reforzar ejercicios de home-row y lecciones rápidas.',
    '2. Ergonomía Digital: Promover de manera obligatoria mantener la espalda recta, la mirada en la pantalla táctil y el tacto en guías F y J.',
    '3. Integridad en Replays: El portal incluye un detector de anomalías (anti-bot) para asegurar que la destreza es auténtica y sin emuladores.'
  ];
  adviceLines.forEach(l => {
    doc.text(l, 15, y);
    y += 4;
  });

  y += 6;

  // Add signature section at bottom
  drawSignatureZone(doc, y);

  // Download trigger
  const fileDate = new Date().toISOString().split('T')[0];
  doc.save(`reporte-clase-tics-${className.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${fileDate}.pdf`);
}


// ==========================================
// 2. INDIVIDUAL STUDENT PERFORMANCE PORTFOLIO PDF
// ==========================================
export function exportStudentReportPDF(
  studentName: string,
  studentAttempts: Attempt[],
  schoolName: string = 'Ada Lovelace CS',
  districtName: string = 'Distrito Académico TICs'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let pageNum = 1;

  // Header Title
  drawPdfHeader(doc, 'Boletín de Desempeño Dactilográfico', `Evaluación Individual de Competencias Teclado TICs`, pageNum);

  let y = 50;

  // Student Profile Card block
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(15, y, 185, 30, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('PERFIL DE EVALUACIÓN Y DATOS ESCOLARES', 20, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Estudiante: ${studentName}`, 20, y + 13);
  doc.text(`Institución: ${schoolName} • Distrito ${districtName}`, 20, y + 19);

  // Compute metrics
  const totalAttempts = studentAttempts.length;
  const maxWpm = totalAttempts > 0 ? Math.max(...studentAttempts.map(a => a.netWpm)) : 0;
  const avgWpm = totalAttempts > 0 ? Math.round(studentAttempts.reduce((sum, a) => sum + a.netWpm, 0) / totalAttempts) : 0;
  const avgAccuracy = totalAttempts > 0 ? Math.round(studentAttempts.reduce((sum, a) => sum + a.accuracy, 0) / totalAttempts) : 0;
  const levelInfo = getLevelDescription(maxWpm);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('LOGROS ACADÉMICOS ALCANZADOS:', 110, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Prácticas registradas: ${totalAttempts} sesiones`, 110, y + 12);
  doc.text(`Pico de velocidad máxima: ${maxWpm} pal/min`, 110, y + 18);
  doc.text(`Precisión de Digitado: ${avgAccuracy}% de aciertos`, 110, y + 24);

  y += 38;

  // Badge Status & Nivel
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, 185, 22, 'F');
  
  // Color left indicator strip
  doc.setFillColor(79, 70, 229);
  doc.rect(15, y, 3, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(79, 70, 229);
  doc.text(`NIVEL DACTILOGRÁFICO DE MARCO CURRICULAR: Nivel ${levelInfo.level} - ${levelInfo.name}`, 22, y + 7);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Sugerencia Pedagógica Académica: ${levelInfo.desc}`, 22, y + 14);

  y += 30;

  // Parental Guidance Letter Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('MENSAJE IMPORTANTE PARA PADRES Y APODERADOS', 15, y);
  
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const letterText = 'Estimado acudiente tutor: La dactilografía computarizada es una habilidad neuromuscular primaria en esta era del conocimiento. Este reporte oficial detalla la precisión y ritmo de escritura física de su hijo(a). Al practicar cotidianamente 10 minutos al día, el alumno consolida la automatización táctil, liberando carga mental para priorizar la redacción creativa u optimización de código lógico. Instamos su apoyo para continuar estimulando los ejercicios desde casa en el portal educativo.';
  const letterBlocks = doc.splitTextToSize(letterText, 180);
  doc.text(letterBlocks, 15, y);

  y += (letterBlocks.length * 4) + 8;

  // History Attempts table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('REVISTA GENERAL DE INTENTOS Y EVALUACIONES DISPUESTAS', 15, y);

  y += 5;
  doc.setFillColor(30, 41, 59);
  doc.rect(15, y, 185, 7.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('FECHA / HORARIO', 18, y + 5);
  doc.text('EJERCICIO / LECCIÓN', 62, y + 5);
  doc.text('VELOCIDAD', 115, y + 5);
  doc.text('Aciertos %', 138, y + 5);
  doc.text('DURACIÓN', 160, y + 5);
  doc.text('FRAUDE', 180, y + 5);

  y += 8;

  // Print entries
  studentAttempts.forEach((attempt, index) => {
    // Page break test
    if (y > 235) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Boletín Individual de Rendimiento de ${studentName}`, 15, 285);
      
      doc.addPage();
      pageNum += 1;
      drawPdfHeader(doc, 'Boletín de Desempeño Dactilográfico', `Evaluación Individual de Competencias Teclado TICs`, pageNum);
      
      // reprint header
      y = 52;
      doc.setFillColor(30, 41, 59);
      doc.rect(15, y, 185, 7.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('FECHA / HORARIO', 18, y + 5);
      doc.text('EJERCICIO / LECCIÓN', 62, y + 5);
      doc.text('VELOCIDAD', 115, y + 5);
      doc.text('Aciertos %', 138, y + 5);
      doc.text('DURACIÓN', 160, y + 5);
      doc.text('FRAUDE', 180, y + 5);
      y += 8;
    }

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(15, y, 185, 7, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    
    // date
    const dateFormatted = attempt.date ? new Date(attempt.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : '20/06/2026';
    doc.text(dateFormatted, 18, y + 5);

    // lesson
    let lessonTruncated = attempt.lessonTitle;
    if (lessonTruncated.length > 25) {
      lessonTruncated = lessonTruncated.substring(0, 23) + '...';
    }
    doc.text(lessonTruncated, 62, y + 5);

    // speed
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${attempt.netWpm} pal/min`, 115, y + 5);
    
    // accuracy
    doc.setFont('helvetica', 'normal');
    doc.text(`${attempt.accuracy}%`, 138, y + 5);

    // duration
    doc.text(`${attempt.timeSpent} segundos`, 160, y + 5);

    // Fraud
    if (attempt.suspicious) {
      doc.setTextColor(168, 44, 52);
      doc.text('SOSPECHA', 180, y + 5);
    } else {
      doc.setTextColor(16, 124, 65);
      doc.text('SEGURO', 180, y + 5);
    }

    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.3);
    doc.line(15, y + 7, 200, y + 7);

    y += 7;
  });

  if (studentAttempts.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No se encontraron registros evaluativos vigentes para este alumno en este grupo.', 25, y + 5);
    y += 8;
  }

  y += 10;

  // Verification area
  drawSignatureZone(doc, y);

  // Trigger browser download
  const cleanName = studentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`boletin_dactilografia_${cleanName}.pdf`);
}
