export type RecommendationItem = {
  title: string;
  type: string;
  genre?: string;
  year?: string;
  author?: string;
  description: string;
  reason?: string;
  link?: string;
};

export type RecommendationResponse = {
  movies: RecommendationItem[];
  books: RecommendationItem[];
};