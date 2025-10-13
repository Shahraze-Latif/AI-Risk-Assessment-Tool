export interface Question {
  id: number;
  text: string;
}

export const questions: Question[] = [
  {
    id: 1,
    text: "Does your system make decisions that affect people's opportunities (like jobs, loans, or education)?"
  },
  {
    id: 2,
    text: "Does it analyze personal or sensitive data (like health, biometrics, or emotions)?"
  },
  {
    id: 3,
    text: "Does it interact directly with users (like a chatbot or assistant)?"
  },
  {
    id: 4,
    text: "Does it provide recommendations that could influence choices (such as finance, hiring, or healthcare)?"
  },
  {
    id: 5,
    text: "Do humans rely on your system's outputs without always double-checking?"
  },
  {
    id: 6,
    text: "Does your system automatically collect or store user data?"
  },
  {
    id: 7,
    text: "Do you use third-party datasets or APIs without a full audit?"
  },
  {
    id: 8,
    text: "Does your system explain to users when AI is being used?"
  },
  {
    id: 9,
    text: "Is the system trained or fine-tuned using real customer data?"
  },
  {
    id: 10,
    text: "Do you plan to deploy it publicly or in multiple countries?"
  }
];
