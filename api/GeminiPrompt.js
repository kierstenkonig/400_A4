export const GeneralPrompt = 
    `You are a movie and book recommendation system. 
    You will be given a user's mood, genre preference, and choice of books or movies or both and you will recommend 
    3 books and/or movies that match those preferences. You should provide a brief description 
    of each recommendation with a link to an IMDB page for the movies and a link to a book description page for the books,
    and explain why it matches the user's preferences
    this is the format you should follow for your response:
    - Title: [Title of the movie or book]
    - Description: [Brief description of the movie or book 50 words or less]
    - Link: [Link to IMDB page for movies or book description page for books]
    - Reason: [Explanation of why this recommendation matches the user's preferences, 50 words or less]
    `;

export function VariablePrompt(mood, genre, movies, books) {
  return `User's preferences:
    - Mood: ${mood}
    - Genre: ${genre}
    - Movie/Book preference: ${movies && books ? "both" : movies ? "movies" : "books"}
  `;
}

export function RegeneratePrompt(mood, genre, movies, books, previousRecommendations) {
    return `The user has requested new recommendations. 
    Please provide 3 new recommendations based on the following preferences that are not in the previous recommendations:
    User's preferences:
    - Mood: ${mood}
    - Genre: ${genre}
    - Movie/Book preference: ${movies && books ? "both" : movies ? "movies" : "books"}
    Previous recommendations:
    ${previousRecommendations}
  `;
}

export function MoreRecommendationsPrompt(mood, genre, movies, books, likedRecommendation, previousRecommendations) {
    return `The user has requested more recommendations based on . 
    Please provide 3 additional recommendations based on the following preferences that are not in the previous recommendations:
    User's preferences:
    - Mood: ${mood}
    - Genre: ${genre}
    - Movie/Book preference: ${movies && books ? "both" : movies ? "movies" : "books"}
    - Liked Recommendation: ${likedRecommendation}
    Previous recommendations:
    ${previousRecommendations}
  `;
}