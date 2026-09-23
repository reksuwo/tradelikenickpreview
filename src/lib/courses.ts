export type Course = {
  id: string;
  title: string;
  category: string;
  level: string;
  hours: string;
  lessons: string;
  price: string;
  blurb: string;
  poster: number;
  badge?: string;
  rating: string;
};

export const COURSES: Course[] = [
  {
    id: "complete-system",
    title: "The Complete Trading System",
    category: "Foundations",
    level: "All levels",
    hours: "62 hrs",
    lessons: "148 lessons",
    price: "$697",
    blurb:
      "The flagship series. Three setups, one risk model and a review habit, assembled into a written plan you can trade tomorrow.",
    poster: 0,
    badge: "Flagship",
    rating: "4.9",
  },
  {
    id: "first-90",
    title: "The First 90 Minutes",
    category: "Foundations",
    level: "Beginner",
    hours: "7 hrs",
    lessons: "22 lessons",
    price: "$119",
    blurb:
      "Everything that happens between the bell and 11am, and why most of a day's opportunity lives there.",
    poster: 1,
    rating: "4.8",
  },
  {
    id: "price-no-indicators",
    title: "Reading Price Without Indicators",
    category: "Technique",
    level: "Intermediate",
    hours: "14 hrs",
    lessons: "41 lessons",
    price: "$249",
    blurb:
      "Levels, structure and participation. Learn to describe what a chart is doing before you look for a signal.",
    poster: 2,
    rating: "4.9",
  },
  {
    id: "position-sizing",
    title: "Position Sizing Masterclass",
    category: "Risk",
    level: "Essential",
    hours: "9 hrs",
    lessons: "26 lessons",
    price: "$149",
    blurb:
      "The course that keeps accounts alive. Fixed fractional sizing, daily stops and knowing when to cut size in half.",
    poster: 3,
    badge: "Most watched",
    rating: "5.0",
  },
  {
    id: "journal-bootcamp",
    title: "The Trading Journal Bootcamp",
    category: "Habits",
    level: "Beginner",
    hours: "5 hrs",
    lessons: "18 lessons",
    price: "$99",
    blurb:
      "Two weeks to a journal you will actually keep, and a Friday review that finds the leaks for you.",
    poster: 4,
    rating: "4.7",
  },
  {
    id: "rules-over-feelings",
    title: "Rules Over Feelings",
    category: "Psychology",
    level: "All levels",
    hours: "8 hrs",
    lessons: "24 lessons",
    price: "$129",
    blurb:
      "Revenge trades, size creep and the frozen trigger finger, treated as process problems rather than character flaws.",
    poster: 5,
    rating: "4.8",
  },
  {
    id: "backtesting",
    title: "Backtesting Without Fooling Yourself",
    category: "Technique",
    level: "Advanced",
    hours: "6 hrs",
    lessons: "19 lessons",
    price: "$139",
    blurb:
      "How to test an idea over 200 sessions so the result means something when real money is on it.",
    poster: 6,
    rating: "4.6",
  },
  {
    id: "prop-firm",
    title: "Prop Firm Evaluation Playbook",
    category: "Advanced",
    level: "Advanced",
    hours: "11 hrs",
    lessons: "31 lessons",
    price: "$199",
    blurb:
      "Daily loss limits, consistency rules and the pacing that gets you from evaluation to a first payout.",
    poster: 7,
    rating: "4.8",
  },
  {
    id: "live-archive",
    title: "Trading Live With Nick",
    category: "Live",
    level: "All levels",
    hours: "40+ hrs",
    lessons: "New episodes weekly",
    price: "Included",
    blurb:
      "Unedited sessions with the microphone on. Every decision narrated in real time, losers included.",
    poster: 8,
    badge: "New episodes",
    rating: "4.9",
  },
];

export const CATEGORIES = [
  "All",
  "Foundations",
  "Technique",
  "Risk",
  "Psychology",
  "Habits",
  "Advanced",
  "Live",
];

export const ROWS: { title: string; subtitle: string; ids: string[] }[] = [
  {
    title: "Start here",
    subtitle: "If you are new, watch these in order",
    ids: ["complete-system", "first-90", "journal-bootcamp", "position-sizing", "live-archive"],
  },
  {
    title: "Sharpen one skill",
    subtitle: "Short, self-contained, no fluff",
    ids: ["position-sizing", "price-no-indicators", "rules-over-feelings", "backtesting", "first-90"],
  },
  {
    title: "For traders already in the seat",
    subtitle: "Advanced material and live sessions",
    ids: ["live-archive", "prop-firm", "backtesting", "price-no-indicators", "complete-system"],
  },
];

export function byId(id: string): Course {
  const found = COURSES.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown course: ${id}`);
  return found;
}
