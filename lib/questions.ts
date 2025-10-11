export interface Question {
  id: number;
  text: string;
}

export const questions: Question[] = [
  {
    id: 1,
    text: "Does your organization use AI systems to make decisions that significantly impact individuals?"
  },
  {
    id: 2,
    text: "Do you collect or process sensitive personal data using AI?"
  },
  {
    id: 3,
    text: "Are your AI systems operating without regular human oversight?"
  },
  {
    id: 4,
    text: "Have you experienced any AI-related incidents or errors in the past year?"
  },
  {
    id: 5,
    text: "Do you lack documented policies for AI governance and ethics?"
  },
  {
    id: 6,
    text: "Are your AI models trained on data that may contain biases?"
  },
  {
    id: 7,
    text: "Do you use AI in high-risk domains (healthcare, finance, legal, safety)?"
  },
  {
    id: 8,
    text: "Is your AI decision-making process unclear or difficult to explain?"
  },
  {
    id: 9,
    text: "Do you lack regular audits or testing of your AI systems?"
  },
  {
    id: 10,
    text: "Are you unsure about compliance with AI regulations in your jurisdiction?"
  }
];
