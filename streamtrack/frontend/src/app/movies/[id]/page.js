'use client';

import React from 'react';
import { useParams } from 'next/navigation'; 
import Link from 'next/link';

const MovieDetailPage = () => {
  const params = useParams();
  const movieId = params.movie_id; 

  if (!movieId) {
    return <div>Ładowanie ID filmu...</div>;
  }

  return (
    <div>
      <h1>Strona Szczegółów Filmu</h1>
      <p>ID Filmu: {movieId}</p>
      <br />
      <Link href="/movies">
        Powrót do listy filmów
      </Link>
    </div>
  );
};

export default MovieDetailPage;

// Nie działa:D Trzeba to routing next zmiast link