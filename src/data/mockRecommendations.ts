import type { RecommendationResponse } from "../types/recommendation";

export const mockRecommendations: RecommendationResponse = {
  movies: [
    {
      id: "movie-1",
      title: "Interstellar",
      description:
        "A visually stunning sci-fi adventure about time, love, and survival across space.",
      link: "https://www.imdb.com/title/tt0816692/",
      type: "movie",
    },
    {
      id: "movie-2",
      title: "Whiplash",
      description:
        "An intense drama about ambition, discipline, and the cost of greatness.",
      link: "https://www.imdb.com/title/tt2582802/",
      type: "movie",
    },
  ],
  books: [
    {
      id: "book-1",
      title: "Atomic Habits",
      description:
        "A practical book on building better habits and improving daily systems.",
      link: "https://jamesclear.com/atomic-habits",
      type: "book",
    },
    {
      id: "book-2",
      title: "The Alchemist",
      description:
        "A reflective novel about purpose, dreams, and following your path.",
      link: "https://www.goodreads.com/book/show/865.The_Alchemist",
      type: "book",
    },
  ],
};