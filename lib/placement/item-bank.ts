/**
 * Placement test item bank. Items are hand-authored, span the full CEFR
 * range on a continuous 0 (A0) – 6.9 (high C2) difficulty scale, and cover
 * four objectively-scoreable skills (grammar, vocabulary, reading,
 * listening) in a mix of formats — never just multiple choice — plus one
 * free-production writing prompt scored qualitatively at the end.
 *
 * Difficulty roughly maps to CEFR as: 0=A0, 1=A1, 2=A2, 3=B1, 4=B2, 5=C1, 6=C2
 * (continuous within a level, e.g. 3.5 is "solidly mid-B1").
 */

export type PlacementSkill = "GRAMMAR" | "VOCABULARY" | "READING" | "LISTENING";

export type PlacementFormat =
  | "multiple_choice"
  | "fill_blank"
  | "translation"
  | "sentence_order"
  | "error_correction"
  | "reading"
  | "listening";

export interface PlacementItem {
  id: string;
  skill: PlacementSkill;
  difficulty: number;
  format: PlacementFormat;
  instruction: string;
  contextEn?: string;
  passage?: string; // reading
  transcript?: string; // listening (spoken via speech synthesis)
  options?: string[];
  correctIndex?: number;
  acceptableAnswers?: string[]; // free-text formats
  words?: string[]; // sentence_order
  correctOrder?: number[]; // sentence_order
  explanation: string;
}

export const VOCABULARY_ITEMS: PlacementItem[] = [
  {
    id: "v1",
    skill: "VOCABULARY",
    difficulty: 0.2,
    format: "multiple_choice",
    instruction: "¿Qué significa 'gracias'?",
    options: ["Thank you", "Please", "Sorry", "Goodbye"],
    correctIndex: 0,
    explanation: "'Gracias' is the standard word for 'thank you' in Spanish.",
  },
  {
    id: "v2",
    skill: "VOCABULARY",
    difficulty: 1.0,
    format: "multiple_choice",
    instruction: "Voy a comprar pan en la ___.",
    contextEn: "I'm going to buy bread at the ___.",
    options: ["panadería", "farmacia", "zapatería", "peluquería"],
    correctIndex: 0,
    explanation: "'Panadería' (bakery) is where you buy 'pan' (bread).",
  },
  {
    id: "v3",
    skill: "VOCABULARY",
    difficulty: 1.8,
    format: "multiple_choice",
    instruction: "Ana tiene mucha hambre. Ella quiere ___.",
    contextEn: "Ana is very hungry. She wants to ___.",
    options: ["dormir", "comer", "nadar", "estudiar"],
    correctIndex: 1,
    explanation: "'Hambre' (hunger) connects to 'comer' (to eat).",
  },
  {
    id: "v4",
    skill: "VOCABULARY",
    difficulty: 2.6,
    format: "multiple_choice",
    instruction: "¿Cuál es el significado de 'darse cuenta de algo'?",
    options: ["To realize something", "To give something away", "To take care of something", "To fall down"],
    correctIndex: 0,
    explanation: "'Darse cuenta de' is a very common B1 chunk meaning 'to realize'.",
  },
  {
    id: "v5",
    skill: "VOCABULARY",
    difficulty: 3.4,
    format: "multiple_choice",
    instruction: "Tuvimos que cancelar el viaje ___ del mal tiempo.",
    contextEn: "We had to cancel the trip ___ the bad weather.",
    options: ["a causa", "a pesar", "en cambio", "sin embargo"],
    correctIndex: 0,
    explanation: "'A causa de' means 'because of' — cause and effect.",
  },
  {
    id: "v6",
    skill: "VOCABULARY",
    difficulty: 4.2,
    format: "multiple_choice",
    instruction: "¿Qué significa la expresión 'quedarse de piedra'?",
    options: ["To be astonished", "To sit on a rock", "To stay home", "To get tired"],
    correctIndex: 0,
    explanation: "'Quedarse de piedra' (lit. 'to turn to stone') means to be utterly astonished.",
  },
  {
    id: "v7",
    skill: "VOCABULARY",
    difficulty: 5.0,
    format: "multiple_choice",
    instruction: "Elige el sinónimo más preciso de 'ímprobo' en: 'Hizo un esfuerzo ímprobo por terminar a tiempo.'",
    options: ["Enorme y agotador", "Pequeño e insignificante", "Rápido y fácil", "Inútil"],
    correctIndex: 0,
    explanation: "'Ímprobo' is a formal, low-frequency C1 adjective meaning extremely arduous.",
  },
  {
    id: "v8",
    skill: "VOCABULARY",
    difficulty: 5.8,
    format: "multiple_choice",
    instruction: "En una conversación, cuando alguien termina de explicar algo y pregunta '¿me explico?', está:",
    options: [
      "Comprobando que se le ha entendido",
      "Pidiendo indicaciones para llegar a un lugar",
      "Disculpándose por un error",
      "Saludando a la otra persona",
    ],
    correctIndex: 0,
    explanation: "This is a pragmatics item: '¿me explico?' is a discourse marker checking comprehension, not a literal request.",
  },
];

export const GRAMMAR_ITEMS: PlacementItem[] = [
  {
    id: "g1",
    skill: "GRAMMAR",
    difficulty: 0.2,
    format: "fill_blank",
    instruction: "Yo ___ Ana.",
    options: ["soy", "eres", "es", "somos"],
    correctIndex: 0,
    explanation: "'Ser' conjugates as 'soy' for 'yo'.",
  },
  {
    id: "g2",
    skill: "GRAMMAR",
    difficulty: 1.0,
    format: "fill_blank",
    instruction: "Ella ___ veinte años.",
    contextEn: "She is twenty years old.",
    options: ["tiene", "es", "está", "hay"],
    correctIndex: 0,
    explanation: "Spanish expresses age with 'tener', not 'ser' — 'tener X años'.",
  },
  {
    id: "g3",
    skill: "GRAMMAR",
    difficulty: 1.8,
    format: "fill_blank",
    instruction: "Ayer yo ___ (comer) pizza con mis amigos.",
    options: ["comí", "como", "comía", "comeré"],
    correctIndex: 0,
    explanation: "'Ayer' (yesterday) signals the preterite: 'comí'.",
  },
  {
    id: "g4",
    skill: "GRAMMAR",
    difficulty: 2.6,
    format: "fill_blank",
    instruction: "Cuando era niño, siempre ___ (jugar) en el parque.",
    contextEn: "When I was a kid, I always used to play in the park.",
    options: ["jugaba", "jugué", "juego", "jugaré"],
    correctIndex: 0,
    explanation: "Habitual past actions use the imperfect ('jugaba'), not the preterite.",
  },
  {
    id: "g5",
    skill: "GRAMMAR",
    difficulty: 3.4,
    format: "sentence_order",
    instruction: "Ordena las palabras para formar una oración condicional correcta.",
    words: ["Si", "tuviera", "más", "dinero,", "viajaría", "más."],
    correctOrder: [0, 1, 2, 3, 4, 5],
    explanation: "Second conditional: 'Si + imperfect subjunctive, conditional' — 'Si tuviera más dinero, viajaría más.'",
  },
  {
    id: "g6",
    skill: "GRAMMAR",
    difficulty: 4.2,
    format: "fill_blank",
    instruction: "Es importante que tú ___ (llegar) a tiempo mañana.",
    options: ["llegues", "llegas", "llegarás", "llegaste"],
    correctIndex: 0,
    explanation: "'Es importante que' triggers the present subjunctive: 'llegues'.",
  },
  {
    id: "g7",
    skill: "GRAMMAR",
    difficulty: 5.0,
    format: "error_correction",
    instruction: "Corrige el error en esta oración: 'Si había sabido que venías, habría preparado la cena.'",
    acceptableAnswers: [
      "Si hubiera sabido que venías, habría preparado la cena.",
      "si hubiera sabido que venias, habria preparado la cena",
    ],
    explanation: "The third conditional requires the pluperfect subjunctive ('hubiera sabido'), not the indicative pluperfect ('había sabido').",
  },
  {
    id: "g8",
    skill: "GRAMMAR",
    difficulty: 5.8,
    format: "multiple_choice",
    instruction: "Elige la opción con el registro más adecuado para rechazar formalmente una propuesta en una reunión de trabajo.",
    options: [
      "Lamentablemente, no nos será posible seguir adelante con esta propuesta en este momento.",
      "No, esa idea no me gusta nada.",
      "Ni hablar, eso no va a pasar.",
      "Paso de esa propuesta, la verdad.",
    ],
    correctIndex: 0,
    explanation: "Formal register uses hedged, indirect constructions ('lamentablemente', 'no nos será posible') rather than blunt refusals.",
  },
];

export const READING_ITEMS: PlacementItem[] = [
  {
    id: "r1",
    skill: "READING",
    difficulty: 0.4,
    format: "reading",
    instruction: "¿De dónde es Sofía?",
    passage: "Hola, me llamo Sofía. Soy de España. Tengo 30 años.",
    options: ["España", "México", "Argentina", "Colombia"],
    correctIndex: 0,
    explanation: "The passage directly states 'Soy de España.'",
  },
  {
    id: "r2",
    skill: "READING",
    difficulty: 1.2,
    format: "reading",
    instruction: "¿A qué hora se levanta Marta?",
    passage: "Marta se levanta a las siete. Desayuna café con tostadas y luego va al trabajo en autobús.",
    options: ["A las siete", "A las ocho", "A las nueve", "A las seis"],
    correctIndex: 0,
    explanation: "'Marta se levanta a las siete' states her wake-up time directly.",
  },
  {
    id: "r3",
    skill: "READING",
    difficulty: 2.0,
    format: "reading",
    instruction: "¿Qué pasó al final del viaje?",
    passage:
      "El verano pasado fuimos a la playa. Hizo mucho calor y nadamos todos los días. El último día perdimos el autobús y tuvimos que volver en taxi.",
    options: [
      "Perdieron el autobús y volvieron en taxi",
      "Se quedaron una semana más",
      "No pudieron nadar",
      "Cancelaron el viaje",
    ],
    correctIndex: 0,
    explanation: "The last sentence describes missing the bus and taking a taxi back.",
  },
  {
    id: "r4",
    skill: "READING",
    difficulty: 2.8,
    format: "reading",
    instruction: "Según el texto, ¿por qué prefiere Diego trabajar desde casa?",
    passage:
      "A Diego le gusta trabajar desde casa porque, aunque a veces se siente solo, ahorra mucho tiempo sin tener que ir a la oficina y puede organizar mejor su día.",
    options: [
      "Porque ahorra tiempo y organiza mejor su día",
      "Porque no le gusta ver a sus compañeros",
      "Porque su casa tiene mejor oficina",
      "Porque gana más dinero",
    ],
    correctIndex: 0,
    explanation: "The reason given, despite the concession ('aunque a veces se siente solo'), is saved time and better organization.",
  },
  {
    id: "r5",
    skill: "READING",
    difficulty: 3.6,
    format: "reading",
    instruction: "¿Cuál es la opinión del autor sobre el teletrabajo?",
    passage:
      "No cabe duda de que el teletrabajo ha cambiado nuestra forma de entender el empleo. Sin embargo, conviene no idealizarlo: para muchos, ha difuminado la frontera entre vida laboral y personal.",
    options: [
      "Es una tendencia positiva pero con inconvenientes reales",
      "Es completamente negativo y debería desaparecer",
      "No ha cambiado nada en el mundo laboral",
      "Es ideal para todos sin excepción",
    ],
    correctIndex: 0,
    explanation: "The author acknowledges the change ('no cabe duda') but warns against idealizing it — a balanced, qualified opinion.",
  },
  {
    id: "r6",
    skill: "READING",
    difficulty: 4.4,
    format: "reading",
    instruction: "¿Qué sugiere la expresión 'se le cayó el mundo encima' sobre el estado de ánimo del protagonista?",
    passage:
      "Cuando Marcos escuchó la noticia, sintió que se le caía el mundo encima. No supo qué decir; simplemente se quedó callado, mirando al suelo.",
    options: [
      "Se sintió abrumado y devastado",
      "Se puso muy contento",
      "No le importó la noticia",
      "Se enojó y empezó a gritar",
    ],
    correctIndex: 0,
    explanation: "'Se le cayó el mundo encima' is an idiom for feeling utterly overwhelmed/devastated, reinforced by his silence.",
  },
  {
    id: "r7",
    skill: "READING",
    difficulty: 5.6,
    format: "reading",
    instruction: "¿Cuál es el tono predominante del fragmento?",
    passage:
      "Faltaría más que, tras años de promesas incumplidas, alguien se sorprendiera de que la ciudadanía reciba el nuevo anuncio con un escepticismo, digamos, comprensible.",
    options: [
      "Irónico y crítico",
      "Entusiasta y optimista",
      "Neutral y puramente informativo",
      "Nostálgico",
    ],
    correctIndex: 0,
    explanation: "'Faltaría más que...' and the understated 'digamos, comprensible' signal irony and pointed criticism — a C1/C2 register cue.",
  },
];

export const LISTENING_ITEMS: PlacementItem[] = [
  {
    id: "l1",
    skill: "LISTENING",
    difficulty: 0.4,
    format: "listening",
    instruction: "¿Cómo se llama la persona?",
    transcript: "Hola, me llamo Carlos. Mucho gusto.",
    options: ["Carlos", "Carmen", "César", "Camila"],
    correctIndex: 0,
    explanation: "The speaker says 'me llamo Carlos.'",
  },
  {
    id: "l2",
    skill: "LISTENING",
    difficulty: 1.2,
    format: "listening",
    instruction: "¿Qué quiere pedir la persona?",
    transcript: "Buenas tardes. Para mí, un café con leche y un croissant, por favor.",
    options: ["Un café con leche y un croissant", "Un té y una tostada", "Un jugo de naranja", "Una ensalada"],
    correctIndex: 0,
    explanation: "The order is clearly stated: 'un café con leche y un croissant.'",
  },
  {
    id: "l3",
    skill: "LISTENING",
    difficulty: 2.0,
    format: "listening",
    instruction: "¿Qué tiempo hizo el fin de semana?",
    transcript: "El fin de semana pasado llovió mucho el sábado, pero el domingo salió el sol y fuimos al parque.",
    options: [
      "Llovió el sábado y salió el sol el domingo",
      "Hizo sol todo el fin de semana",
      "Nevó el domingo",
      "Hizo mucho calor el sábado",
    ],
    correctIndex: 0,
    explanation: "The speaker contrasts rain on Saturday with sun on Sunday.",
  },
  {
    id: "l4",
    skill: "LISTENING",
    difficulty: 2.8,
    format: "listening",
    instruction: "¿Por qué llega tarde la persona?",
    transcript: "Perdona la tardanza, es que había un tráfico horrible y encima se me olvidaron las llaves en casa.",
    options: [
      "Por el tráfico y porque olvidó las llaves",
      "Porque se quedó dormida",
      "Porque perdió el autobús",
      "Porque estaba enferma",
    ],
    correctIndex: 0,
    explanation: "Two reasons are given: traffic ('tráfico horrible') and forgotten keys ('se me olvidaron las llaves').",
  },
  {
    id: "l5",
    skill: "LISTENING",
    difficulty: 3.6,
    format: "listening",
    instruction: "¿Cuál es la actitud del hablante ante la propuesta?",
    transcript: "Bueno, la verdad es que no sé... por un lado suena interesante, pero por otro me da un poco de miedo dejar mi trabajo actual.",
    options: [
      "Está indeciso, con dudas a favor y en contra",
      "Está totalmente en contra",
      "Está completamente seguro y entusiasmado",
      "No tiene ninguna opinión",
    ],
    correctIndex: 0,
    explanation: "'Por un lado... pero por otro' explicitly signals ambivalence.",
  },
  {
    id: "l6",
    skill: "LISTENING",
    difficulty: 4.4,
    format: "listening",
    instruction: "¿Qué quiere decir la persona con 'me quedé de piedra'?",
    transcript: "Cuando me dijeron que habían cancelado el proyecto sin avisar, me quedé de piedra.",
    options: ["Se quedó muy sorprendida", "Se puso feliz", "No le importó", "Se durmió"],
    correctIndex: 0,
    explanation: "The idiom 'quedarse de piedra' means to be shocked/stunned.",
  },
  {
    id: "l7",
    skill: "LISTENING",
    difficulty: 5.6,
    format: "listening",
    instruction: "¿Qué está sugiriendo realmente el hablante, más allá de lo literal?",
    transcript: "Ya, claro, porque tú siempre tienes toda la razón, como siempre... qué curioso que otra vez el error sea mío.",
    options: [
      "Está siendo sarcástico e implica desacuerdo",
      "Está de acuerdo sinceramente",
      "Está felicitando a la otra persona",
      "Está pidiendo disculpas",
    ],
    correctIndex: 0,
    explanation: "The exaggerated agreement ('siempre tienes toda la razón... qué curioso') is sarcasm signaling real disagreement — a pragmatics/tone item typical of C1-C2 listening.",
  },
];

export const WRITING_PROMPT = {
  promptEs: "Preséntate: ¿cómo te llamas, de dónde eres y qué te gusta hacer?",
  promptEn: "Introduce yourself: your name, where you're from, and what you like to do.",
};

export const PLACEMENT_ITEMS_BY_SKILL: Record<PlacementSkill, PlacementItem[]> = {
  GRAMMAR: GRAMMAR_ITEMS,
  VOCABULARY: VOCABULARY_ITEMS,
  READING: READING_ITEMS,
  LISTENING: LISTENING_ITEMS,
};

export const PLACEMENT_SKILLS: PlacementSkill[] = ["VOCABULARY", "GRAMMAR", "READING", "LISTENING"];
