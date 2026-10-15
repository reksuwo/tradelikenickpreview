// Placeholder testimonials — replace with real, approved student quotes before launch.

export type CaseStudy = {
  metric: string;
  metricLabel: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
};

export type ShortQuote = {
  quote: string;
  name: string;
  role?: string;
  topic?: string;
};

export const CASES: CaseStudy[] = [
  {
    metric: "70%+",
    metricLabel: "Probability of profit, by design",
    quote:
      "I used to buy cheap out-of-the-money calls and hope. Nick taught me to read delta as a probability and pick trades where the odds are on my side. My account finally stopped swinging wildly.",
    name: "Jason L.",
    role: "Options trader, San Jose",
    initials: "JL",
  },
  {
    metric: "2%",
    metricLabel: "Max risk per trade",
    quote:
      "The risk management lessons changed how I size every position. Defined-risk spreads and a hard cap per trade mean one bad week no longer wipes out a good month.",
    name: "Michelle T.",
    role: "Part-time trader, Houston",
    initials: "MT",
  },
  {
    metric: "6 months",
    metricLabel: "Of consistent, rules-based trading",
    quote:
      "After years of jumping between strategies, I now have a written plan for entries, exits, and adjustments. Trading feels calm and repeatable instead of stressful.",
    name: "David R.",
    role: "Retired engineer, Phoenix",
    initials: "DR",
  },
];

export const SHORTS: ShortQuote[] = [
  {
    quote: "The clearest explanation of the Greeks I have found anywhere. The math finally clicked.",
    name: "Angela P.",
  },
  {
    quote: "Nick teaches like a coach, not a salesman. No hype, just process and probability.",
    name: "Kevin N.",
  },
  {
    quote: "I came in as a complete beginner. The lessons build in the right order and never rush.",
    name: "Rachel S.",
  },
  {
    quote: "Learning to sell premium with defined risk was the turning point for my trading.",
    name: "Tom H.",
  },
];

/** The longer wall shown on /testimonials. */
export const WALL: ShortQuote[] = [
  {
    quote:
      "I had been trading options for three years without really understanding implied volatility. One module changed how I choose every expiration.",
    name: "Brian C.",
    role: "Options trader, Denver",
    topic: "Volatility",
  },
  {
    quote:
      "Nick explains probability the way a good math teacher would. Patient, clear, and always tied back to a real trade.",
    name: "Linda V.",
    role: "Teacher, Sacramento",
    topic: "Probability",
  },
  {
    quote:
      "What I value most is the honesty. He shows the losing trades and explains what the plan said to do. That is how I learned to manage mine.",
    name: "Marcus J.",
    role: "Swing trader, Atlanta",
    topic: "Risk management",
  },
  {
    quote:
      "As a complete beginner I was intimidated by options. The foundations course started from zero and never made me feel lost.",
    name: "Emily W.",
    role: "Nurse, Seattle",
    topic: "Beginner",
  },
  {
    quote:
      "Iron condors finally make sense to me — when to open, when to adjust, and when to simply close and move on.",
    name: "Steve K.",
    role: "Retired, Tampa",
    topic: "Strategies",
  },
  {
    quote:
      "The position sizing rules alone were worth it. I stopped risking money I could not afford to lose on a single idea.",
    name: "Priya S.",
    role: "Software developer, Austin",
    topic: "Risk management",
  },
  {
    quote:
      "I appreciate that there are no promises of getting rich. It is a real education, built by someone who has coached thousands of traders.",
    name: "Robert G.",
    role: "Small business owner, Chicago",
    topic: "Teaching",
  },
  {
    quote:
      "The live sessions are where it all comes together. Watching Nick walk through his checklist in real time taught me discipline.",
    name: "Nancy L.",
    role: "Part-time trader, San Diego",
    topic: "Live sessions",
  },
  {
    quote:
      "I finally understand why I was losing on short-dated options. Theta and probability were working against me, and now they work for me.",
    name: "Chris T.",
    role: "Engineer, Portland",
    topic: "Probability",
  },
];
