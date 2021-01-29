import { Movie } from '../App';

export const hashMovie = (movie: Movie) => {
  const { title, year } = movie; // Some movies have duplicate titles so include year
  return `${title.replace(/\s+/g, '-').toLowerCase()}-${year}`;
};

export const extractVideoId = (url: string) => {
  const YOUTUBE_PREFIX_LENGTH = 32;
  return url.substring(YOUTUBE_PREFIX_LENGTH);
};

export const getRandomMovie = (movies: Array<Movie>) => {
  return movies[Math.floor(Math.random() * movies.length)];
};
