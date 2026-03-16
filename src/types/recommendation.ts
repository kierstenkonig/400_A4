export type RecommendationType = "movie" | "book";

export type RecommendationItem = {
  id: string;
  title: string;
  description: string;
  link: string;
  type: RecommendationType;
};

export type RecommendationResponse = {
  movies: RecommendationItem[];
  books: RecommendationItem[];
};