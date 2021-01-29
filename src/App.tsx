import React, { useState, useEffect } from 'react';
import initialMovieData from './data/initialMovieData.json';
import axios from 'axios';
import { useLocalStorage } from './hooks/useLocalStorage';
import { hashMovie, extractVideoId, getRandomMovie } from './utils/helpers';
import { theme } from './utils/theme';
import styled from 'styled-components';

export type Movie = {
  title: string;
  year: string;
  director: string;
  country: string;
  genre: string;
  url?: string; // A few movies missing a trailer URL
  synopsis: string;
  recommendation: string;
  streamingOptions: string;
};

type BlockList = {
  [movie: string]: boolean;
};

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 1rem;
`;

const VideoContainer = styled.div`
  color: ${theme.colors.primary};
  display: flex;
  max-width: 35rem;
  width: 100%;
  flex-direction: column;
  font-family: ${theme.fontStack};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  h1 {
    font-weight: 500;
    font-size: 2rem;
    margin-bottom: 0;
    letter-spacing: -0.07rem;
  }
  p {
    font-size: 0.9375rem;
    line-height: 1.5em;
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }
  span {
    font-weight: 600;
    display: block;
    margin-bottom: 0.2rem;
  }
  img {
    pointer-events: none;
  }
`;

const TrailerContainer = styled.div`
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

const InfoContainer = styled.div`
  height: calc(100vh - 5.75rem);
  overflow-y: scroll;
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
  ::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
`;

const Button = styled.button<{ marginTop?: boolean }>`
  font-family: ${theme.fontStack};
  cursor: pointer;
  font-size: 0.9375rem;
  height: 2.75rem;
  text-decoration: none;
  display: inline-block;
  border: 1px solid ${theme.colors.primary};
  background-color: ${theme.colors.background};
  color: ${theme.colors.primary};
  outline: none;
  transition: background-color 250ms, color 250ms;
  padding: 0 0.75rem;
  line-height: 2rem;
  margin-top: ${(props) => (props.marginTop ? '1.5rem' : '')};
  :hover {
    background-color: ${theme.colors.primary};
    color: ${theme.colors.background};
  }
`;

const App = () => {
  const [movies, setMovies] = useState<Array<Movie>>(initialMovieData);
  const [blockList, setBlockList] = useLocalStorage<BlockList>('blockList', {});
  const [currentMovie, setCurrentMovie] = useState<Movie>(
    getRandomMovie(movies)
  );

  const getNewMovie = () => {
    const movie = getRandomMovie(movies);
    movie && setCurrentMovie(movie);
    movie && setBlockList({ ...blockList, [hashMovie(movie)]: true });
  };

  const fetchNewMovies = () => {
    axios
      .get(
        `https://wrapapi.com/use/andrew/very-good-films/films/3.0.0?wrapAPIKey=${process.env.REACT_APP_API_KEY}`
      )
      .then((res) => {
        setMovies(res.data.data.movies);
      });
  };

  const resetMovies = () => {
    setBlockList({});
    setMovies(initialMovieData);
    fetchNewMovies();
  };

  useEffect(() => {
    const newMovies: Array<Movie> = [];
    movies.forEach((movie: Movie) => {
      if (!blockList[hashMovie(movie)]) {
        newMovies.push(movie);
      }
    });
    setMovies(newMovies);
  }, [blockList]); // eslint-disable-line

  useEffect(() => {
    fetchNewMovies();
  }, []);

  const {
    title,
    year,
    director,
    country,
    genre,
    url,
    synopsis,
    recommendation,
    streamingOptions,
  } = currentMovie;

  return (
    <AppContainer>
      <VideoContainer>
        {movies.length > 0 && (
          <>
            <InfoContainer>
              {url && (
                <TrailerContainer>
                  <iframe
                    title="video"
                    src={`https://www.youtube-nocookie.com/embed/${extractVideoId(
                      url
                    )}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </TrailerContainer>
              )}
              <h1>{title}</h1>
              <p>
                {year} &middot; {director} &middot; {country} &middot; {genre}
              </p>
              <p>
                <span>Synopsis</span>
                {synopsis}
              </p>
              <p>
                <span>Watch if you like</span>
                {recommendation}
              </p>
              <p>
                <span>Watch it on</span>
                {streamingOptions}
              </p>
            </InfoContainer>
            <Button onClick={() => getNewMovie()}>Give me another movie</Button>
          </>
        )}
        {movies.length === 0 && (
          <>
            <img
              src="/lost.gif"
              alt="We're all out!"
              width={440}
              height={424}
            />
            <h1>We're all out!</h1>
            <p>Come back more for next time.</p>
            <Button onClick={() => resetMovies()} marginTop>
              Start over
            </Button>
          </>
        )}
      </VideoContainer>
    </AppContainer>
  );
};

export default App;
