import type { CEFRLevel, SpanishRegion } from "@prisma/client";

export interface StoryStepSeed {
  stepKey: string;
  speaker?: string;
  textEs: string;
  textEn: string;
  choices: { label: string; nextStepKey: string }[];
  isEnding?: boolean;
  vocabHighlights?: { es: string; en: string }[];
}

export interface StorySeed {
  slug: string;
  title: string;
  description: string;
  cefrLevel: CEFRLevel;
  region: SpanishRegion;
  startStepKey: string;
  steps: StoryStepSeed[];
}

export const STORIES: StorySeed[] = [
  {
    slug: "equipaje-perdido-madrid",
    title: "Equipaje perdido en Madrid",
    description: "You arrive in Madrid and your luggage is missing. What do you say?",
    cefrLevel: "A2",
    region: "SPAIN",
    startStepKey: "start",
    steps: [
      {
        stepKey: "start",
        textEs: "Llegas al aeropuerto de Madrid. Vas a recoger tu equipaje, pero no lo encuentras por ningún lado.",
        textEn: "You arrive at Madrid airport. You go to collect your luggage, but you can't find it anywhere.",
        choices: [
          { label: "Preguntar a un empleado del aeropuerto", nextStepKey: "ask_employee" },
          { label: "Buscar un poco más por tu cuenta", nextStepKey: "search_more" },
        ],
      },
      {
        stepKey: "search_more",
        textEs: "Buscas durante diez minutos, pero no hay ninguna señal de tu maleta.",
        textEn: "You search for ten minutes, but there's no sign of your suitcase.",
        choices: [{ label: "Ir al mostrador de reclamaciones", nextStepKey: "claims_desk" }],
      },
      {
        stepKey: "ask_employee",
        speaker: "Empleado del aeropuerto",
        textEs: "¿Puedo ayudarle en algo?",
        textEn: "Can I help you with something?",
        choices: [
          { label: "Sí, perdí mi maleta.", nextStepKey: "claims_desk" },
          { label: "No, gracias, sigo buscando.", nextStepKey: "search_more" },
        ],
      },
      {
        stepKey: "claims_desk",
        speaker: "Empleada de reclamaciones",
        textEs: "Necesito el número de su vuelo y una descripción de la maleta, por favor.",
        textEn: "I need your flight number and a description of the suitcase, please.",
        choices: [{ label: "Dar la información solicitada", nextStepKey: "info_given" }],
      },
      {
        stepKey: "info_given",
        textEs: "Le das toda la información. La empleada busca en el sistema y te dice: 'Encontramos su maleta. Llegará a su hotel mañana por la mañana.'",
        textEn: "You give her all the information. She checks the system and says: 'We found your suitcase. It will arrive at your hotel tomorrow morning.'",
        choices: [
          { label: "Aceptar y dar las gracias", nextStepKey: "end_grateful" },
          { label: "Preguntar sobre una compensación", nextStepKey: "ask_compensation" },
        ],
      },
      {
        stepKey: "ask_compensation",
        speaker: "Empleada de reclamaciones",
        textEs: "Por la demora, le podemos ofrecer un vale de cincuenta euros para usar en el aeropuerto.",
        textEn: "For the delay, we can offer you a fifty-euro voucher to use at the airport.",
        choices: [{ label: "Aceptar el vale y dar las gracias", nextStepKey: "end_compensation" }],
      },
      {
        stepKey: "end_grateful",
        textEs: "Al día siguiente, tu maleta llega al hotel sin ningún problema. Todo salió bien.",
        textEn: "The next day, your suitcase arrives at the hotel without any problem. Everything worked out.",
        choices: [],
        isEnding: true,
        vocabHighlights: [
          { es: "el equipaje", en: "luggage" },
          { es: "el mostrador de reclamaciones", en: "claims desk" },
          { es: "recoger", en: "to pick up / collect" },
        ],
      },
      {
        stepKey: "end_compensation",
        textEs: "Aceptas el vale, y al día siguiente tu maleta llega al hotel sin problema. Además, tienes cincuenta euros para gastar.",
        textEn: "You accept the voucher, and the next day your suitcase arrives at the hotel without a problem. Plus, you have fifty euros to spend.",
        choices: [],
        isEnding: true,
        vocabHighlights: [
          { es: "la demora", en: "the delay" },
          { es: "un vale", en: "a voucher" },
        ],
      },
    ],
  },
  {
    slug: "entrevista-de-trabajo",
    title: "La entrevista de trabajo",
    description: "Navigate a job interview in Spanish — your answers shape how it goes.",
    cefrLevel: "B1",
    region: "LATAM_GENERAL",
    startStepKey: "start",
    steps: [
      {
        stepKey: "start",
        speaker: "Entrevistadora",
        textEs: "Buenos días. Cuénteme, ¿por qué le interesa este puesto?",
        textEn: "Good morning. Tell me, why are you interested in this position?",
        choices: [
          { label: "Hablar de tu experiencia profesional", nextStepKey: "experience" },
          { label: "Hablar de tus habilidades blandas", nextStepKey: "soft_skills" },
        ],
      },
      {
        stepKey: "experience",
        textEs: "Explicas tu experiencia relevante con seguridad.",
        textEn: "You explain your relevant experience confidently.",
        choices: [{ label: "Continuar", nextStepKey: "challenge_question" }],
      },
      {
        stepKey: "soft_skills",
        textEs: "Hablas de tu capacidad de trabajo en equipo y adaptabilidad.",
        textEn: "You talk about your teamwork ability and adaptability.",
        choices: [{ label: "Continuar", nextStepKey: "challenge_question" }],
      },
      {
        stepKey: "challenge_question",
        speaker: "Entrevistadora",
        textEs: "Interesante. Ahora, cuénteme sobre un desafío que enfrentó en su trabajo anterior.",
        textEn: "Interesting. Now, tell me about a challenge you faced in your previous job.",
        choices: [
          { label: "Describir el desafío y cómo lo resolviste", nextStepKey: "resolution" },
          { label: "Pedir un momento para pensar", nextStepKey: "think_moment" },
        ],
      },
      {
        stepKey: "think_moment",
        speaker: "Entrevistadora",
        textEs: "Claro, tómese su tiempo.",
        textEn: "Of course, take your time.",
        choices: [{ label: "Describir el desafío y cómo lo resolviste", nextStepKey: "resolution" }],
      },
      {
        stepKey: "resolution",
        textEs: "Describes el problema con claridad y explicas cómo lo solucionaste.",
        textEn: "You describe the problem clearly and explain how you solved it.",
        choices: [{ label: "Continuar", nextStepKey: "end" }],
      },
      {
        stepKey: "end",
        speaker: "Entrevistadora",
        textEs: "Muchas gracias por su tiempo. Nos pondremos en contacto la próxima semana con la decisión.",
        textEn: "Thank you very much for your time. We'll be in touch next week with our decision.",
        choices: [],
        isEnding: true,
        vocabHighlights: [
          { es: "el puesto", en: "the position/job" },
          { es: "un desafío", en: "a challenge" },
          { es: "ponerse en contacto", en: "to get in touch" },
        ],
      },
    ],
  },
];
