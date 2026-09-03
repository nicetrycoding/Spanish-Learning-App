import type { CEFRLevel, ExerciseType, LessonType, SkillType } from "@prisma/client";

export interface ExerciseSeed {
  type: ExerciseType;
  skillTag: SkillType;
  difficulty: number;
  prompt: string;
  data: object;
  explanation: string;
  stage?: string;
}

export interface LessonSeed {
  slug: string;
  title: string;
  type: LessonType;
  order: number;
  explanation: string;
  examples: { es: string; en: string; note?: string }[];
  skillTags: SkillType[];
  estimatedMinutes: number;
  exercises: ExerciseSeed[];
}

export interface ModuleSeed {
  slug: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonSeed[];
}

export interface CourseLevelSeed {
  level: CEFRLevel;
  title: string;
  description: string;
  order: number;
  modules: ModuleSeed[];
}

function ex(e: ExerciseSeed): ExerciseSeed {
  return e;
}

export const CURRICULUM: CourseLevelSeed[] = [
  // =========================================================== A0 ===========================================================
  {
    level: "A0",
    title: "Getting Started",
    description: "Your very first steps into Spanish — sounds, greetings, and the words you'll use immediately.",
    order: 0,
    modules: [
      {
        slug: "a0-first-words",
        title: "First Words",
        description: "The absolute basics: hello, please, thank you, and how Spanish sounds.",
        order: 1,
        lessons: [
          {
            slug: "a0-greetings-basics",
            title: "Hello and Goodbye",
            type: "VOCABULARY",
            order: 1,
            estimatedMinutes: 6,
            skillTags: ["VOCABULARY", "LISTENING"],
            explanation:
              "Let's start with the words you'll use in every single conversation: greetings and courtesy words. Spanish greetings change a little depending on the time of day, but 'hola' works anytime.",
            examples: [
              { es: "Hola", en: "Hello" },
              { es: "Buenos días", en: "Good morning", note: "Used until around noon" },
              { es: "Buenas tardes", en: "Good afternoon" },
              { es: "Adiós", en: "Goodbye" },
              { es: "Por favor", en: "Please" },
              { es: "Gracias", en: "Thank you" },
            ],
            exercises: [
              ex({ type: "MULTIPLE_CHOICE", skillTag: "VOCABULARY", difficulty: 1, prompt: "¿Qué significa 'hola'?", data: { question: "¿Qué significa 'hola'?", options: ["Hello", "Goodbye", "Please", "Sorry"], correctIndex: 0 }, explanation: "'Hola' is the universal Spanish greeting." }),
              ex({ type: "MATCHING", skillTag: "VOCABULARY", difficulty: 1, prompt: "Empareja cada saludo con su significado.", data: { pairs: [{ left: "Hola", right: "Hello" }, { left: "Adiós", right: "Goodbye" }, { left: "Gracias", right: "Thank you" }, { left: "Por favor", right: "Please" }] }, explanation: "These are the four most essential courtesy words in Spanish." }),
              ex({ type: "FLASHCARD", skillTag: "VOCABULARY", difficulty: 1, prompt: "Repasa la palabra.", data: { front: "Buenos días", back: "Good morning" }, explanation: "'Buenos días' is used in the morning, roughly until noon." }),
            ],
          },
          {
            slug: "a0-numbers-0-10",
            title: "Numbers 0-10",
            type: "VOCABULARY",
            order: 2,
            estimatedMinutes: 6,
            skillTags: ["VOCABULARY"],
            explanation:
              "Numbers are everywhere — prices, ages, phone numbers. Let's learn zero through ten: cero, uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez.",
            examples: [
              { es: "uno, dos, tres", en: "one, two, three" },
              { es: "Tengo dos hermanos.", en: "I have two brothers." },
              { es: "Son las diez.", en: "It's ten o'clock." },
            ],
            exercises: [
              ex({ type: "MULTIPLE_CHOICE", skillTag: "VOCABULARY", difficulty: 1, prompt: "¿Cómo se dice 'seven' en español?", data: { question: "¿Cómo se dice 'seven' en español?", options: ["seis", "siete", "ocho", "nueve"], correctIndex: 1 }, explanation: "'Siete' means seven." }),
              ex({ type: "FILL_BLANK", skillTag: "VOCABULARY", difficulty: 1, prompt: "Completa: Tengo ___ (3) hermanos.", data: { sentence: "Tengo ___ hermanos.", acceptableAnswers: ["tres"] }, explanation: "'Tres' means three." }),
              ex({ type: "MISSING_WORD", skillTag: "VOCABULARY", difficulty: 1, prompt: "Elige el número correcto.", data: { sentence: "Son las ___ (10) de la mañana.", options: ["diez", "dos", "cinco", "ocho"], correctIndex: 0 }, explanation: "'Diez' means ten." }),
            ],
          },
        ],
      },
    ],
  },

  // =========================================================== A1 ===========================================================
  {
    level: "A1",
    title: "Beginner",
    description: "Introduce yourself, talk about your family, order food, and handle simple everyday situations.",
    order: 1,
    modules: [
      {
        slug: "a1-introductions",
        title: "Introductions",
        description: "Talk about yourself: who you are, where you're from, and the verbs ser, estar, and tener.",
        order: 1,
        lessons: [
          {
            slug: "a1-ser-estar-tener",
            title: "Ser, Estar, and Tener",
            type: "GRAMMAR",
            order: 1,
            estimatedMinutes: 10,
            skillTags: ["GRAMMAR"],
            explanation:
              "Three of the most important verbs in Spanish: 'ser' (identity/characteristics), 'estar' (location/temporary states), and 'tener' (to have — also used for age and feelings). Get comfortable with these and you can say an enormous amount already.",
            examples: [
              { es: "Soy de Canadá.", en: "I am from Canada.", note: "ser — origin" },
              { es: "Estoy en la oficina.", en: "I am at the office.", note: "estar — location" },
              { es: "Tengo 28 años.", en: "I am 28 years old.", note: "tener — age" },
            ],
            exercises: [
              ex({ type: "MULTIPLE_CHOICE", skillTag: "GRAMMAR", difficulty: 1, prompt: "Yo ___ de México.", data: { question: "Yo ___ de México.", options: ["soy", "estoy", "tengo", "es"], correctIndex: 0 }, explanation: "Origin uses 'ser': soy de México." }),
              ex({ type: "MULTIPLE_CHOICE", skillTag: "GRAMMAR", difficulty: 1, prompt: "Ella ___ 20 años.", data: { question: "Ella ___ 20 años.", options: ["es", "está", "tiene", "son"], correctIndex: 2 }, explanation: "Age uses 'tener': tiene 20 años." }),
              ex({ type: "ERROR_CORRECTION", skillTag: "GRAMMAR", difficulty: 2, prompt: "Corrige el error: 'Yo soy 25 años.'", data: { sentenceWithError: "Yo soy 25 años.", acceptableAnswers: ["Yo tengo 25 años.", "tengo 25 años"] }, explanation: "Spanish expresses age using 'tener', not 'ser'." }),
            ],
          },
          {
            slug: "a1-greetings-introductions",
            title: "Meeting Someone New",
            type: "CONVERSATION",
            order: 2,
            estimatedMinutes: 8,
            skillTags: ["VOCABULARY", "SPEAKING"],
            explanation:
              "Let's put greetings into a real exchange: introducing yourself, asking someone's name, and saying where you're from.",
            examples: [
              { es: "¿Cómo te llamas?", en: "What's your name?" },
              { es: "Me llamo Ana. ¿Y tú?", en: "My name is Ana. And you?" },
              { es: "Mucho gusto.", en: "Nice to meet you." },
            ],
            exercises: [
              ex({ type: "TRANSLATION", skillTag: "VOCABULARY", difficulty: 2, prompt: "Traduce: 'My name is Alex.'", data: { direction: "en-es", source: "My name is Alex.", acceptableAnswers: ["Me llamo Alex.", "me llamo alex"] }, explanation: "'Me llamo...' is the standard way to say your name." }),
              ex({ type: "CONTEXTUAL_SELECT", skillTag: "SPEAKING", difficulty: 2, prompt: "Alguien te dice '¿Cómo te llamas?'. ¿Qué respondes?", data: { context: "Acabas de conocer a alguien en una fiesta.", question: "¿Cómo respondes a '¿Cómo te llamas?'?", options: ["Me llamo Jordan.", "Tengo 30 años.", "Estoy bien.", "De nada."], correctIndex: 0 }, explanation: "This question asks for your name, so you respond with 'Me llamo...'." }),
              ex({ type: "SPEAKING_PROMPT", skillTag: "SPEAKING", difficulty: 2, prompt: "Practica presentarte en voz alta.", data: { promptEs: "Preséntate: tu nombre y de dónde eres.", promptEn: "Introduce yourself: your name and where you're from." }, explanation: "Production practice — saying it out loud builds real fluency faster than reading." }),
            ],
          },
        ],
      },
      {
        slug: "a1-everyday-life",
        title: "Everyday Life",
        description: "Family, food, and the present tense of regular verbs.",
        order: 2,
        lessons: [
          {
            slug: "a1-family-vocabulary",
            title: "Family and Numbers",
            type: "VOCABULARY",
            order: 1,
            estimatedMinutes: 8,
            skillTags: ["VOCABULARY"],
            explanation: "Family vocabulary comes up constantly in conversation. Let's also review numbers beyond ten, which you'll need for ages, prices, and phone numbers.",
            examples: [
              { es: "Mi familia es grande.", en: "My family is big." },
              { es: "Tengo un hermano y una hermana.", en: "I have a brother and a sister." },
            ],
            exercises: [
              ex({ type: "MULTIPLE_CHOICE", skillTag: "VOCABULARY", difficulty: 2, prompt: "¿Qué significa 'el hermano'?", data: { question: "¿Qué significa 'el hermano'?", options: ["brother", "sister", "mother", "father"], correctIndex: 0 }, explanation: "'El hermano' means brother." }),
              ex({ type: "MATCHING", skillTag: "VOCABULARY", difficulty: 2, prompt: "Empareja la familia.", data: { pairs: [{ left: "el padre", right: "father" }, { left: "la madre", right: "mother" }, { left: "el hermano", right: "brother" }, { left: "la hermana", right: "sister" }] }, explanation: "Core family vocabulary." }),
              ex({ type: "FILL_BLANK", skillTag: "VOCABULARY", difficulty: 2, prompt: "Completa: Mi ___ (mother) se llama Rosa.", data: { sentence: "Mi ___ se llama Rosa.", acceptableAnswers: ["madre"] }, explanation: "'Madre' means mother." }),
            ],
          },
          {
            slug: "a1-food-ordering",
            title: "Food and Ordering",
            type: "MIXED",
            order: 2,
            estimatedMinutes: 8,
            skillTags: ["VOCABULARY", "READING"],
            explanation: "Ordering food is one of the first real-world skills you'll need. Let's learn key food vocabulary and a simple ordering exchange.",
            examples: [
              { es: "Para mí, un café, por favor.", en: "For me, a coffee, please." },
              { es: "¿Qué me recomienda?", en: "What do you recommend?" },
            ],
            exercises: [
              ex({ type: "MULTIPLE_CHOICE", skillTag: "VOCABULARY", difficulty: 2, prompt: "Voy a comprar pan en la ___.", data: { question: "Voy a comprar pan en la ___.", options: ["panadería", "farmacia", "zapatería", "peluquería"], correctIndex: 0 }, explanation: "'Panadería' (bakery) is where you buy bread." }),
              ex({ type: "READING_COMPREHENSION", skillTag: "READING", difficulty: 2, prompt: "Lee y responde.", data: { passageEs: "Camarero: Buenas tardes, ¿qué desea? Cliente: Para mí, una ensalada y un agua, por favor.", questions: [{ id: "q1", question: "¿Qué pide el cliente?", options: ["Una ensalada y un agua", "Un café y un pan", "Una pizza", "Nada"], correctIndex: 0 }] }, explanation: "The customer orders a salad and a water." }),
              ex({ type: "TRANSLATION", skillTag: "VOCABULARY", difficulty: 2, prompt: "Traduce: 'For me, a coffee, please.'", data: { direction: "en-es", source: "For me, a coffee, please.", acceptableAnswers: ["Para mí, un café, por favor.", "para mi un cafe por favor"] }, explanation: "A standard, polite way to order." }),
            ],
          },
        ],
      },
    ],
  },

  // =========================================================== A2 ===========================================================
  {
    level: "A2",
    title: "Elementary",
    description: "Talk about the past, describe your routine, and handle travel and shopping situations.",
    order: 2,
    modules: [
      {
        slug: "a2-daily-routines",
        title: "Daily Routines",
        description: "Reflexive verbs and talking about what happened yesterday.",
        order: 1,
        lessons: [
          {
            slug: "a2-reflexive-verbs",
            title: "Reflexive Verbs",
            type: "GRAMMAR",
            order: 1,
            estimatedMinutes: 9,
            skillTags: ["GRAMMAR"],
            explanation: "Reflexive verbs describe actions you do to yourself: getting up, showering, getting dressed. They need a reflexive pronoun (me, te, se, nos, os, se) that matches the subject.",
            examples: [
              { es: "Me levanto a las siete.", en: "I get up at seven." },
              { es: "Se ducha por la mañana.", en: "He/she showers in the morning." },
            ],
            exercises: [
              ex({ type: "TENSE_SELECT", skillTag: "GRAMMAR", difficulty: 3, prompt: "Yo ___ a las siete todos los días.", data: { sentence: "Yo ___ a las siete todos los días.", infinitive: "levantarse", options: ["levanto", "me levanto", "levantas", "se levanta"], correctIndex: 1 }, explanation: "Reflexive verbs need the pronoun matching the subject — 'me levanto' for 'yo'." }),
              ex({ type: "ERROR_CORRECTION", skillTag: "GRAMMAR", difficulty: 3, prompt: "Corrige: 'Levanto a las siete.'", data: { sentenceWithError: "Levanto a las siete.", acceptableAnswers: ["Me levanto a las siete."] }, explanation: "Without 'me', the sentence is missing its reflexive pronoun." }),
              ex({ type: "FILL_BLANK", skillTag: "GRAMMAR", difficulty: 3, prompt: "Completa: Ellos ___ (acostarse) tarde los sábados.", data: { sentence: "Ellos ___ tarde los sábados.", acceptableAnswers: ["se acuestan"] }, explanation: "'Acostarse' conjugated for 'ellos' is 'se acuestan'." }),
            ],
          },
          {
            slug: "a2-past-events",
            title: "Talking About the Past",
            type: "GRAMMAR",
            order: 2,
            estimatedMinutes: 10,
            skillTags: ["GRAMMAR", "WRITING"],
            explanation: "The preterite tense describes completed actions in the past — what happened, at a specific time.",
            examples: [
              { es: "Ayer comí pizza con mis amigos.", en: "Yesterday I ate pizza with my friends." },
              { es: "El año pasado viajamos a Perú.", en: "Last year we traveled to Peru." },
            ],
            exercises: [
              ex({ type: "TENSE_SELECT", skillTag: "GRAMMAR", difficulty: 3, prompt: "Ayer yo ___ (comer) pizza.", data: { sentence: "Ayer yo ___ pizza.", infinitive: "comer", options: ["como", "comía", "comí", "comeré"], correctIndex: 2 }, explanation: "'Ayer' signals the preterite: comí." }),
              ex({ type: "SENTENCE_ORDER", skillTag: "GRAMMAR", difficulty: 3, prompt: "Ordena la oración.", data: { words: ["El", "año", "pasado,", "viajamos", "a", "Perú."], correctOrder: [0, 1, 2, 3, 4, 5] }, explanation: "'El año pasado, viajamos a Perú.'" }),
              ex({ type: "WRITING_PROMPT", skillTag: "WRITING", difficulty: 3, prompt: "Escribe sobre tu fin de semana.", data: { promptEs: "Escribe 2-3 frases sobre lo que hiciste el fin de semana pasado.", promptEn: "Write 2-3 sentences about what you did last weekend.", minWords: 20 }, explanation: "Production practice with the preterite tense." }),
            ],
          },
        ],
      },
      {
        slug: "a2-getting-around",
        title: "Getting Around",
        description: "Travel, the airport, shopping, and comparatives.",
        order: 2,
        lessons: [
          {
            slug: "a2-travel-airport",
            title: "Travel and the Airport",
            type: "LISTENING",
            order: 1,
            estimatedMinutes: 9,
            skillTags: ["VOCABULARY", "LISTENING"],
            explanation: "Airport and travel vocabulary you'll need whether you're catching a flight or just discussing a trip.",
            examples: [
              { es: "Perdí mi maleta en el aeropuerto.", en: "I lost my suitcase at the airport." },
              { es: "¿A qué hora sale el vuelo?", en: "What time does the flight leave?" },
            ],
            exercises: [
              ex({ type: "MULTIPLE_CHOICE", skillTag: "VOCABULARY", difficulty: 2, prompt: "¿Qué significa 'la maleta'?", data: { question: "¿Qué significa 'la maleta'?", options: ["suitcase", "ticket", "passport", "gate"], correctIndex: 0 }, explanation: "'La maleta' means suitcase." }),
              ex({ type: "LISTENING_COMPREHENSION", skillTag: "LISTENING", difficulty: 3, prompt: "Escucha y responde.", data: { transcriptEs: "Atención pasajeros: el vuelo 205 con destino a Lima saldrá con retraso. La nueva hora de salida es a las cuatro de la tarde.", questions: [{ id: "q1", question: "¿Qué pasó con el vuelo?", options: ["Saldrá con retraso", "Fue cancelado", "Salió a tiempo", "Cambió de destino"], correctIndex: 0 }] }, explanation: "The announcement says the flight will depart with a delay ('con retraso')." }),
              ex({ type: "DICTATION", skillTag: "LISTENING", difficulty: 3, prompt: "Escucha y escribe lo que oyes.", data: { audioText: "El vuelo sale a las diez de la mañana.", acceptableAnswers: ["El vuelo sale a las diez de la mañana."] }, explanation: "Dictation trains precise listening." }),
            ],
          },
          {
            slug: "a2-shopping-comparatives",
            title: "Shopping and Comparatives",
            type: "GRAMMAR",
            order: 2,
            estimatedMinutes: 8,
            skillTags: ["GRAMMAR", "VOCABULARY"],
            explanation: "Comparatives (más...que, menos...que, tan...como) let you compare prices, sizes, and quality while shopping.",
            examples: [
              { es: "Este es más barato que aquel.", en: "This one is cheaper than that one." },
              { es: "Es tan bueno como el otro.", en: "It's as good as the other one." },
            ],
            exercises: [
              ex({ type: "FILL_BLANK", skillTag: "GRAMMAR", difficulty: 3, prompt: "Completa: Este restaurante es ___ caro ___ el otro. (more...than)", data: { sentence: "Este restaurante es ___ caro ___ el otro.", acceptableAnswers: ["más...que", "mas que", "más que"] }, explanation: "'Más...que' is the standard comparative structure." }),
              ex({ type: "MULTIPLE_CHOICE", skillTag: "VOCABULARY", difficulty: 2, prompt: "Antónimo de 'barato':", data: { question: "Antónimo de 'barato':", options: ["caro", "grande", "bueno", "rápido"], correctIndex: 0 }, explanation: "'Caro' (expensive) is the opposite of 'barato' (cheap)." }),
              ex({ type: "CONTEXTUAL_SELECT", skillTag: "GRAMMAR", difficulty: 3, prompt: "Elige la comparación correcta.", data: { context: "Estás comparando dos hoteles del mismo precio y calidad.", question: "¿Cómo lo expresas?", options: ["Es tan bueno como el otro.", "Es más bueno que el otro.", "Es menos que el otro.", "Es el más bueno."], correctIndex: 0 }, explanation: "Equal comparison uses 'tan...como'." }),
            ],
          },
        ],
      },
    ],
  },

  // =========================================================== B1 ===========================================================
  {
    level: "B1",
    title: "Intermediate",
    description: "Narrate the past fluently, express opinions, and handle work and housing situations.",
    order: 3,
    modules: [
      {
        slug: "b1-narrating-past",
        title: "Narrating the Past",
        description: "Pretérito vs. imperfecto, and expressing opinions with confidence.",
        order: 1,
        lessons: [
          {
            slug: "b1-preterite-imperfect",
            title: "Pretérito vs. Imperfecto",
            type: "GRAMMAR",
            order: 1,
            estimatedMinutes: 12,
            skillTags: ["GRAMMAR"],
            explanation: "The single most important B1 grammar point: choosing between the preterite (completed events) and the imperfect (background, habits, ongoing states) when narrating the past.",
            examples: [
              { es: "Cuando era niño, jugaba en el parque todos los días.", en: "When I was a kid, I used to play in the park every day.", note: "Habitual — imperfect" },
              { es: "Ayer fui al parque y me encontré con un amigo.", en: "Yesterday I went to the park and ran into a friend.", note: "Completed event — preterite" },
            ],
            exercises: [
              ex({ type: "TENSE_SELECT", skillTag: "GRAMMAR", difficulty: 4, prompt: "Cuando era niño, siempre ___ (jugar) en el parque.", data: { sentence: "Cuando era niño, siempre ___ en el parque.", infinitive: "jugar", options: ["jugaba", "jugué", "juego", "jugaré"], correctIndex: 0 }, explanation: "Habitual past actions use the imperfect." }),
              ex({ type: "TENSE_SELECT", skillTag: "GRAMMAR", difficulty: 4, prompt: "Anoche ___ (yo/ver) una película muy buena.", data: { sentence: "Anoche ___ una película muy buena.", infinitive: "ver", options: ["veía", "vi", "veo", "veré"], correctIndex: 1 }, explanation: "'Anoche' signals a single completed event — preterite." }),
              ex({ type: "ERROR_CORRECTION", skillTag: "GRAMMAR", difficulty: 4, prompt: "Corrige: 'Cuando era niño, jugué en el parque todos los días.'", data: { sentenceWithError: "Cuando era niño, jugué en el parque todos los días.", acceptableAnswers: ["Cuando era niño, jugaba en el parque todos los días."] }, explanation: "'Todos los días' signals a habitual action, which needs the imperfect." }),
            ],
          },
          {
            slug: "b1-expressing-opinions",
            title: "Expressing Opinions",
            type: "WRITING",
            order: 2,
            estimatedMinutes: 10,
            skillTags: ["WRITING", "VOCABULARY"],
            explanation: "Connectors like 'sin embargo', 'a pesar de', and 'por lo tanto' let you build more sophisticated opinions and arguments.",
            examples: [
              { es: "Creo que el teletrabajo tiene ventajas, sin embargo, también tiene desventajas.", en: "I think remote work has advantages; however, it also has disadvantages." },
              { es: "A pesar de la lluvia, decidimos salir.", en: "Despite the rain, we decided to go out." },
            ],
            exercises: [
              ex({ type: "MULTIPLE_CHOICE", skillTag: "VOCABULARY", difficulty: 4, prompt: "Tuvimos que cancelar el viaje ___ del mal tiempo.", data: { question: "Tuvimos que cancelar el viaje ___ del mal tiempo.", options: ["a causa", "a pesar", "en cambio", "sin embargo"], correctIndex: 0 }, explanation: "'A causa de' expresses cause." }),
              ex({ type: "SENTENCE_TRANSFORM", skillTag: "WRITING", difficulty: 4, prompt: "Une las ideas con 'sin embargo': 'Me gusta el plan. Tiene riesgos.'", data: { instruction: "Combina las dos frases usando 'sin embargo'.", source: "Me gusta el plan. Tiene riesgos.", acceptableAnswers: ["Me gusta el plan, sin embargo, tiene riesgos.", "me gusta el plan sin embargo tiene riesgos"] }, explanation: "'Sin embargo' contrasts two related ideas." }),
              ex({ type: "WRITING_PROMPT", skillTag: "WRITING", difficulty: 4, prompt: "¿Prefieres vivir en la ciudad o en el campo?", data: { promptEs: "¿Prefieres vivir en la ciudad o en el campo? Explica por qué.", promptEn: "Do you prefer living in the city or the countryside? Explain why.", minWords: 50 }, explanation: "Opinion writing practice." }),
            ],
          },
        ],
      },
      {
        slug: "b1-work-housing",
        title: "Work and Housing",
        description: "Job interviews, applications, and renting an apartment.",
        order: 2,
        lessons: [
          {
            slug: "b1-job-interviews",
            title: "Job Interviews",
            type: "CONVERSATION",
            order: 1,
            estimatedMinutes: 10,
            skillTags: ["SPEAKING", "VOCABULARY"],
            explanation: "Vocabulary and phrases for talking about work experience and handling a job interview.",
            examples: [
              { es: "Tengo tres años de experiencia en marketing.", en: "I have three years of experience in marketing." },
              { es: "¿Por qué le interesa este puesto?", en: "Why are you interested in this position?" },
            ],
            exercises: [
              ex({ type: "MULTIPLE_CHOICE", skillTag: "VOCABULARY", difficulty: 4, prompt: "¿Qué significa 'solicitar un puesto'?", data: { question: "¿Qué significa 'solicitar un puesto'?", options: ["to apply for a job", "to quit a job", "to hire someone", "to fire someone"], correctIndex: 0 }, explanation: "'Solicitar un puesto' means to apply for a job." }),
              ex({ type: "SPEAKING_PROMPT", skillTag: "SPEAKING", difficulty: 4, prompt: "Responde a una pregunta de entrevista.", data: { promptEs: "¿Por qué le interesa este puesto?", promptEn: "Why are you interested in this position?" }, explanation: "Practice answering a common interview question out loud." }),
              ex({ type: "TRANSLATION", skillTag: "VOCABULARY", difficulty: 4, prompt: "Traduce: 'I have three years of experience.'", data: { direction: "en-es", source: "I have three years of experience.", acceptableAnswers: ["Tengo tres años de experiencia.", "tengo tres anos de experiencia"] }, explanation: "Standard phrasing for describing experience." }),
            ],
          },
          {
            slug: "b1-renting-apartment",
            title: "Renting an Apartment",
            type: "READING",
            order: 2,
            estimatedMinutes: 9,
            skillTags: ["READING", "VOCABULARY"],
            explanation: "Vocabulary for apartment listings and negotiating with a landlord.",
            examples: [
              { es: "El alquiler incluye agua y luz.", en: "The rent includes water and electricity." },
              { es: "¿El apartamento está amueblado?", en: "Is the apartment furnished?" },
            ],
            exercises: [
              ex({ type: "READING_COMPREHENSION", skillTag: "READING", difficulty: 4, prompt: "Lee el anuncio y responde.", data: { passageEs: "Se alquila apartamento de dos habitaciones en el centro. Incluye agua y luz. No incluye internet. Amueblado. Disponible desde el primero de marzo.", questions: [{ id: "q1", question: "¿Qué no incluye el alquiler?", options: ["Internet", "Agua", "Luz", "Los muebles"], correctIndex: 0 }] }, explanation: "The listing explicitly says internet is not included." }),
              ex({ type: "MULTIPLE_CHOICE", skillTag: "VOCABULARY", difficulty: 3, prompt: "¿Qué significa 'amueblado'?", data: { question: "¿Qué significa 'amueblado'?", options: ["furnished", "empty", "expensive", "small"], correctIndex: 0 }, explanation: "'Amueblado' means furnished." }),
              ex({ type: "FILL_BLANK", skillTag: "VOCABULARY", difficulty: 4, prompt: "Completa: Tengo que pagar el ___ antes del día 5.", data: { sentence: "Tengo que pagar el ___ antes del día 5.", acceptableAnswers: ["alquiler"] }, explanation: "'El alquiler' means the rent." }),
            ],
          },
        ],
      },
    ],
  },

  // =========================================================== B2 ===========================================================
  {
    level: "B2",
    title: "Upper-Intermediate",
    description: "Debate abstract topics, write formal communications, and use advanced subjunctive and connectors.",
    order: 4,
    modules: [
      {
        slug: "b2-abstract-topics",
        title: "Abstract Topics",
        description: "Debate, reported speech, and defending a position.",
        order: 1,
        lessons: [
          {
            slug: "b2-remote-work-debate",
            title: "Debating Remote Work",
            type: "WRITING",
            order: 1,
            estimatedMinutes: 12,
            skillTags: ["WRITING", "GRAMMAR"],
            explanation: "Building an argument with formal connectors: no obstante, por consiguiente, en cambio.",
            examples: [
              { es: "No cabe duda de que el teletrabajo ha cambiado nuestra forma de trabajar.", en: "There's no doubt remote work has changed how we work." },
              { es: "No obstante, conviene no idealizarlo.", en: "Nevertheless, it's worth not idealizing it." },
            ],
            exercises: [
              ex({ type: "MULTIPLE_CHOICE", skillTag: "VOCABULARY", difficulty: 5, prompt: "Llovió toda la semana; ___, cancelamos el viaje.", data: { question: "Llovió toda la semana; ___, cancelamos el viaje.", options: ["por consiguiente", "en cambio", "aunque", "porque"], correctIndex: 0 }, explanation: "'Por consiguiente' expresses consequence." }),
              ex({ type: "SENTENCE_TRANSFORM", skillTag: "WRITING", difficulty: 5, prompt: "Reescribe con un conector formal: 'El plan es bueno. Tiene riesgos.'", data: { instruction: "Une las ideas con un conector formal de contraste.", source: "El plan es bueno. Tiene riesgos.", acceptableAnswers: ["El plan es bueno; no obstante, tiene riesgos.", "el plan es bueno no obstante tiene riesgos"] }, explanation: "'No obstante' is a formal equivalent of 'sin embargo'." }),
              ex({ type: "WRITING_PROMPT", skillTag: "WRITING", difficulty: 5, prompt: "¿El teletrabajo mejora la productividad?", data: { promptEs: "¿El teletrabajo mejora la productividad? Argumenta tu postura.", promptEn: "Does remote work improve productivity? Argue your position.", minWords: 100 }, explanation: "Argumentative writing at B2 level." }),
            ],
          },
          {
            slug: "b2-reported-speech",
            title: "Reported Speech",
            type: "GRAMMAR",
            order: 2,
            estimatedMinutes: 10,
            skillTags: ["GRAMMAR"],
            explanation: "Reporting what someone said requires shifting tenses: present → imperfect, future → conditional.",
            examples: [
              { es: "Dijo: 'Estoy cansado.' → Dijo que estaba cansado.", en: "He said 'I'm tired' → He said he was tired." },
            ],
            exercises: [
              ex({ type: "SENTENCE_TRANSFORM", skillTag: "GRAMMAR", difficulty: 5, prompt: "Convierte a estilo indirecto: Dijo: 'Vendré mañana.'", data: { instruction: "Reescribe en estilo indirecto.", source: "Dijo: 'Vendré mañana.'", acceptableAnswers: ["Dijo que vendría al día siguiente.", "dijo que vendria al dia siguiente"] }, explanation: "Future shifts to conditional; 'mañana' shifts to 'al día siguiente'." }),
              ex({ type: "MULTIPLE_CHOICE", skillTag: "GRAMMAR", difficulty: 5, prompt: "Dijo: 'Estoy cansado.' → Dijo que ___ cansado.", data: { question: "Dijo: 'Estoy cansado.' → Dijo que ___ cansado.", options: ["estaba", "está", "estará", "esté"], correctIndex: 0 }, explanation: "Present shifts to imperfect in reported speech." }),
              ex({ type: "ERROR_CORRECTION", skillTag: "GRAMMAR", difficulty: 5, prompt: "Corrige: 'Dijo que está cansado.'", data: { sentenceWithError: "Dijo que está cansado.", acceptableAnswers: ["Dijo que estaba cansado."] }, explanation: "Past reporting shifts present to imperfect." }),
            ],
          },
        ],
      },
      {
        slug: "b2-formal-communication",
        title: "Formal Communication",
        description: "Complaint letters and professional writing.",
        order: 2,
        lessons: [
          {
            slug: "b2-complaint-letter",
            title: "Writing a Complaint Letter",
            type: "WRITING",
            order: 1,
            estimatedMinutes: 12,
            skillTags: ["WRITING"],
            explanation: "Formal letters follow specific conventions in Spanish: a formal greeting, a clear statement of the issue, and a polite but firm closing.",
            examples: [
              { es: "Le escribo para expresar mi insatisfacción con...", en: "I am writing to express my dissatisfaction with..." },
              { es: "Espero una pronta respuesta.", en: "I look forward to a prompt response." },
            ],
            exercises: [
              ex({ type: "MULTIPLE_CHOICE", skillTag: "VOCABULARY", difficulty: 5, prompt: "¿Cuál es más formal?", data: { question: "¿Cuál es más formal?", options: ["Le escribo para expresar mi insatisfacción.", "Oye, esto está mal.", "No me gusta nada esto.", "Esto es un desastre."], correctIndex: 0 }, explanation: "Formal writing uses hedged, indirect phrasing." }),
              ex({ type: "WRITING_PROMPT", skillTag: "WRITING", difficulty: 5, prompt: "Escribe una carta de reclamación.", data: { promptEs: "Escribe una carta formal de reclamación sobre un producto defectuoso.", promptEn: "Write a formal complaint letter about a defective product.", minWords: 100 }, explanation: "Formal register writing practice." }),
              ex({ type: "FILL_BLANK", skillTag: "WRITING", difficulty: 5, prompt: "Completa el cierre formal: Espero una pronta ___.", data: { sentence: "Espero una pronta ___.", acceptableAnswers: ["respuesta"] }, explanation: "'Espero una pronta respuesta' is a standard formal closing." }),
            ],
          },
        ],
      },
    ],
  },

  // =========================================================== C1 ===========================================================
  {
    level: "C1",
    title: "Advanced",
    description: "Register, argumentation, professional Spanish, and subtle vocabulary distinctions.",
    order: 5,
    modules: [
      {
        slug: "c1-professional-spanish",
        title: "Professional Spanish",
        description: "Register, formality, and building a persuasive argument.",
        order: 1,
        lessons: [
          {
            slug: "c1-register-formality",
            title: "Register and Formality",
            type: "READING",
            order: 1,
            estimatedMinutes: 12,
            skillTags: ["READING", "WRITING"],
            explanation: "At this level, choosing the right register matters as much as grammatical accuracy. Formal writing favors hedged, indirect phrasing; informal speech favors contractions and colloquialisms.",
            examples: [
              { es: "Lamentablemente, no nos será posible acceder a su solicitud.", en: "Unfortunately, we won't be able to grant your request.", note: "Formal" },
              { es: "Uy, no, eso no va a poder ser.", en: "Ugh, no, that's not gonna happen.", note: "Informal, same meaning" },
            ],
            exercises: [
              ex({ type: "CONTEXTUAL_SELECT", skillTag: "WRITING", difficulty: 6, prompt: "Elige la opción más formal para rechazar una propuesta.", data: { context: "Estás en una reunión de trabajo formal.", question: "¿Cómo rechazas la propuesta formalmente?", options: ["Lamentablemente, no nos será posible seguir adelante con esta propuesta.", "No, esa idea no me gusta.", "Ni hablar.", "Paso de esa propuesta."], correctIndex: 0 }, explanation: "Formal register uses hedged, indirect constructions." }),
              ex({ type: "READING_COMPREHENSION", skillTag: "READING", difficulty: 6, prompt: "Lee y responde.", data: { passageEs: "No cabe duda de que el teletrabajo ha cambiado nuestra forma de entender el empleo. Sin embargo, conviene no idealizarlo: para muchos, ha difuminado la frontera entre vida laboral y personal.", questions: [{ id: "q1", question: "¿Cuál es la opinión del autor?", options: ["Es una tendencia positiva pero con inconvenientes reales", "Es completamente negativo", "No ha cambiado nada", "Es ideal para todos"], correctIndex: 0 }] }, explanation: "The author gives a balanced, qualified opinion." }),
              ex({ type: "SENTENCE_TRANSFORM", skillTag: "WRITING", difficulty: 6, prompt: "Reescribe en registro formal: 'No, esa idea no me gusta.'", data: { instruction: "Reescribe en un registro más formal.", source: "No, esa idea no me gusta.", acceptableAnswers: ["Lamentablemente, no consideramos viable esa propuesta.", "lamentablemente no consideramos viable esa propuesta"] }, explanation: "Formal register avoids blunt, direct refusals." }),
            ],
          },
          {
            slug: "c1-argumentation",
            title: "Building an Argument",
            type: "WRITING",
            order: 2,
            estimatedMinutes: 12,
            skillTags: ["WRITING", "READING"],
            explanation: "Advanced argumentation uses concession ('si bien', 'aunque'), precise vocabulary, and structured reasoning to build a persuasive case.",
            examples: [
              { es: "Si bien es cierto que existen riesgos, los beneficios superan con creces las desventajas.", en: "While it's true there are risks, the benefits far outweigh the drawbacks." },
            ],
            exercises: [
              ex({ type: "MULTIPLE_CHOICE", skillTag: "VOCABULARY", difficulty: 6, prompt: "¿Qué significa 'matizar'?", data: { question: "¿Qué significa 'matizar'?", options: ["to add nuance to", "to ignore", "to shout", "to summarize briefly"], correctIndex: 0 }, explanation: "'Matizar' means to add nuance or qualify a statement." }),
              ex({ type: "WRITING_PROMPT", skillTag: "WRITING", difficulty: 6, prompt: "Analiza el impacto de la inteligencia artificial en el empleo.", data: { promptEs: "Analiza el impacto de la inteligencia artificial en el mercado laboral.", promptEn: "Analyze the impact of artificial intelligence on the job market.", minWords: 150 }, explanation: "Extended argumentative writing at C1 level." }),
              ex({ type: "ERROR_CORRECTION", skillTag: "WRITING", difficulty: 6, prompt: "Corrige el registro: 'Esto está mal y punto.'", data: { sentenceWithError: "Esto está mal y punto.", acceptableAnswers: ["Esto no me parece del todo acertado.", "esto no me parece del todo acertado"] }, explanation: "A more measured, hedged phrasing suits formal argumentation better." }),
            ],
          },
        ],
      },
      {
        slug: "c1-cultural-nuance",
        title: "Cultural Nuance",
        description: "Idioms, expressions, and subtle vocabulary distinctions.",
        order: 2,
        lessons: [
          {
            slug: "c1-idioms-expressions",
            title: "Idioms and Expressions",
            type: "VOCABULARY",
            order: 1,
            estimatedMinutes: 10,
            skillTags: ["VOCABULARY", "LISTENING"],
            explanation: "Idioms rarely translate literally. Understanding them is often what separates advanced learners from native-like comprehension.",
            examples: [
              { es: "Me quedé de piedra cuando escuché la noticia.", en: "I was astonished when I heard the news." },
              { es: "Se le cayó el mundo encima.", en: "He was devastated." },
            ],
            exercises: [
              ex({ type: "MULTIPLE_CHOICE", skillTag: "VOCABULARY", difficulty: 6, prompt: "¿Qué significa 'quedarse de piedra'?", data: { question: "¿Qué significa 'quedarse de piedra'?", options: ["to be astonished", "to sit down", "to stay home", "to get tired"], correctIndex: 0 }, explanation: "'Quedarse de piedra' means to be utterly astonished." }),
              ex({ type: "LISTENING_COMPREHENSION", skillTag: "LISTENING", difficulty: 6, prompt: "Escucha y responde.", data: { transcriptEs: "Cuando me dijeron que habían cancelado el proyecto sin avisar, me quedé de piedra.", questions: [{ id: "q1", question: "¿Cómo se sintió la persona?", options: ["Muy sorprendida", "Feliz", "Indiferente", "Aliviada"], correctIndex: 0 }] }, explanation: "The idiom signals shock/astonishment." }),
              ex({ type: "MISSING_WORD", skillTag: "VOCABULARY", difficulty: 6, prompt: "Completa la expresión idiomática.", data: { sentence: "Cuando escuchó la noticia, se le cayó el ___ encima.", options: ["mundo", "cielo", "techo", "café"], correctIndex: 0 }, explanation: "'Se le cayó el mundo encima' is a fixed idiom." }),
            ],
          },
        ],
      },
    ],
  },

  // =========================================================== C2 ===========================================================
  {
    level: "C2",
    title: "Proficiency",
    description: "Near-native comprehension: irony, rhetoric, regional variation, and sophisticated argumentation.",
    order: 6,
    modules: [
      {
        slug: "c2-near-native-mastery",
        title: "Near-Native Mastery",
        description: "Irony, humor, and rhetorical persuasion.",
        order: 1,
        lessons: [
          {
            slug: "c2-irony-humor",
            title: "Irony and Humor",
            type: "READING",
            order: 1,
            estimatedMinutes: 12,
            skillTags: ["READING", "LISTENING"],
            explanation: "At the C2 level, understanding irony, sarcasm, and humor — which rarely have a literal translation — is central to true fluency.",
            examples: [
              { es: "Ya, claro, porque tú siempre tienes toda la razón, como siempre.", en: "Yeah, sure, because you're always right, as always.", note: "Sarcasm signaling disagreement, not agreement" },
            ],
            exercises: [
              ex({ type: "READING_COMPREHENSION", skillTag: "READING", difficulty: 7, prompt: "Lee y responde.", data: { passageEs: "Faltaría más que, tras años de promesas incumplidas, alguien se sorprendiera de que la ciudadanía reciba el nuevo anuncio con un escepticismo, digamos, comprensible.", questions: [{ id: "q1", question: "¿Cuál es el tono del fragmento?", options: ["Irónico y crítico", "Entusiasta", "Neutral", "Nostálgico"], correctIndex: 0 }] }, explanation: "The understated phrasing and 'faltaría más' signal irony and criticism." }),
              ex({ type: "LISTENING_COMPREHENSION", skillTag: "LISTENING", difficulty: 7, prompt: "Escucha y responde.", data: { transcriptEs: "Ya, claro, porque tú siempre tienes toda la razón, como siempre... qué curioso que otra vez el error sea mío.", questions: [{ id: "q1", question: "¿Qué implica realmente el hablante?", options: ["Está siendo sarcástico y en desacuerdo", "Está de acuerdo sinceramente", "Está felicitando a la otra persona", "Se está disculpando"], correctIndex: 0 }] }, explanation: "The exaggerated agreement is sarcasm signaling real disagreement." }),
              ex({ type: "MULTIPLE_CHOICE", skillTag: "READING", difficulty: 7, prompt: "'Faltaría más que...' se usa para expresar:", data: { question: "'Faltaría más que...' se usa para expresar:", options: ["Indignación irónica", "Alegría sincera", "Una pregunta neutral", "Una despedida"], correctIndex: 0 }, explanation: "This is a fixed ironic construction expressing indignation." }),
            ],
          },
        ],
      },
      {
        slug: "c2-regional-mastery",
        title: "Regional Mastery",
        description: "Dialect variation and literary/formal register across the Spanish-speaking world.",
        order: 2,
        lessons: [
          {
            slug: "c2-dialect-variation",
            title: "Dialect Variation",
            type: "READING",
            order: 1,
            estimatedMinutes: 10,
            skillTags: ["READING", "VOCABULARY"],
            explanation: "Truly proficient Spanish means recognizing and correctly interpreting regional variation — vocabulary, verb forms, and idioms that shift across Spain, Mexico, Argentina, and beyond, without treating any of them as 'wrong'.",
            examples: [
              { es: "Vosotros habláis muy bien. (España)", en: "You all speak very well. (Spain)" },
              { es: "Vos hablás muy bien. (Argentina)", en: "You speak very well. (Argentina)" },
              { es: "Ustedes hablan muy bien. (Latinoamérica general)", en: "You all speak very well. (General Latin America)" },
            ],
            exercises: [
              ex({ type: "MULTIPLE_CHOICE", skillTag: "READING", difficulty: 7, prompt: "¿Qué forma verbal se usa en Argentina para 'tú hablas'?", data: { question: "¿Qué forma verbal se usa en Argentina para 'tú hablas'?", options: ["vos hablás", "vosotros habláis", "usted habla", "ustedes hablan"], correctIndex: 0 }, explanation: "Argentina uses 'voseo': vos hablás." }),
              ex({ type: "MULTIPLE_CHOICE", skillTag: "VOCABULARY", difficulty: 6, prompt: "En España, 'el ordenador' equivale a:", data: { question: "En España, 'el ordenador' equivale a:", options: ["la computadora", "el teléfono", "la pantalla", "el teclado"], correctIndex: 0 }, explanation: "'El ordenador' (Spain) and 'la computadora' (Latin America) both mean computer." }),
              ex({ type: "CONTEXTUAL_SELECT", skillTag: "READING", difficulty: 7, prompt: "Un colega mexicano dice 'vamos a platicar'. ¿Qué quiere decir?", data: { context: "Estás en una reunión informal con colegas mexicanos.", question: "¿Qué significa 'platicar' en este contexto?", options: ["chatear/conversar", "trabajar", "pelear", "terminar"], correctIndex: 0 }, explanation: "'Platicar' is common Mexican Spanish for 'to chat'." }),
            ],
          },
        ],
      },
    ],
  },
];
