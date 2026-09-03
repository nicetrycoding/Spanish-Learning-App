export interface RealWorldScenario {
  slug: string;
  title: string;
  emoji: string;
  tag: string; // matches Vocabulary.tags / ListeningExercise.topic loosely
  description: string;
}

export const REAL_WORLD_SCENARIOS: RealWorldScenario[] = [
  { slug: "restaurant", title: "Ordering food", emoji: "🍽️", tag: "food", description: "Order, ask about ingredients, split the bill." },
  { slug: "airport", title: "Airport", emoji: "✈️", tag: "travel", description: "Check in, go through security, find your gate." },
  { slug: "hotel", title: "Hotel", emoji: "🏨", tag: "travel", description: "Check in, ask for late checkout, request a room change." },
  { slug: "supermarket", title: "Supermarket", emoji: "🛒", tag: "shopping", description: "Ask where things are, understand offers, pay." },
  { slug: "doctor", title: "Doctor", emoji: "🩺", tag: "health", description: "Describe symptoms, understand instructions." },
  { slug: "job-interview", title: "Job interview", emoji: "💼", tag: "work", description: "Talk about experience, answer common questions." },
  { slug: "workplace", title: "Workplace", emoji: "🏢", tag: "work", description: "Meetings, small talk, asking for help." },
  { slug: "renting", title: "Renting an apartment", emoji: "🔑", tag: "housing", description: "Ask about a listing, negotiate terms." },
  { slug: "university", title: "University", emoji: "🎓", tag: "school", description: "Register for classes, talk to a professor." },
  { slug: "social", title: "Social situations", emoji: "👋", tag: "social", description: "Meeting new people, small talk, making plans." },
];
