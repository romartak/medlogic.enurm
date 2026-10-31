/** Preguntas tomadas tal cual del banco de la app (public/data/questions.json). */
export type Quiz = { id: string; specialty: string; stem: string; options: string[]; answer: number; why: string }

export const QUIZZES: Record<string, Quiz> = {
  murphy: {
    id: 'bq-16_92',
    specialty: 'Cirugía',
    stem: 'El signo de Murphy se encuentra en la:',
    options: ['Úlcera péptica perforada', 'Pancreatitis aguda', 'Colecistitis aguda', 'Oclusión intestinal'],
    answer: 2,
    why: 'Dolor y pausa inspiratoria al palpar el hipocondrio derecho: vesícula inflamada.',
  },
  calcitonina: {
    id: 'bq-16_94',
    specialty: 'Endocrinología',
    stem: 'El cáncer tiroideo que produce calcitonina es del tipo:',
    options: ['Papilar', 'Folicular', 'Medular', 'Anaplásico'],
    answer: 2,
    why: 'Nace de las células C parafoliculares, que secretan calcitonina.',
  },
  parkinson: {
    id: 'bq-20_77',
    specialty: 'Neurología',
    stem: 'El temblor del paciente parkinsoniano es principalmente:',
    options: ['De acción', 'Postural', 'De reposo', 'Ninguna'],
    answer: 2,
    why: 'Temblor de reposo, tipo "contar monedas", que mejora con el movimiento.',
  },
  ectopico: {
    id: 'bq-107_47',
    specialty: 'Ginecología',
    stem: '¿Cuál es la localización más frecuente del embarazo ectópico?',
    options: ['Abdominal', 'Trompa, porción ampular', 'Trompa, porción ístmica', 'Ovario'],
    answer: 1,
    why: 'La ampolla tubárica concentra la gran mayoría de los ectópicos.',
  },
  hipocalcemia: {
    id: 'bq-214_100',
    specialty: 'Endocrinología',
    stem: 'Son signos que pueden aparecer en pacientes con hipocalcemia:',
    options: ['Trousseau y Chvostek', 'Signo de Kehr', 'Signo de Murphy', 'Signo de Blumberg'],
    answer: 0,
    why: 'Ambos reflejan la hiperexcitabilidad neuromuscular por calcio bajo.',
  },
}
