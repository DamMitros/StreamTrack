"use client";

import { useState } from "react";
import { searchTMDB } from "@/services/tmdbService"; 

interface SearchResultItem {
  id: number;
  title?: string;
  name?: string;
  media_type: string;
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const data = await searchTMDB(searchTerm);
      setResults(data.results);
    } catch (err) {
      setError((err as Error).message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Witaj w Streamtrack!</h2>
      <p>
        To jest strona główna Twojej aplikacji. Możesz zacząć od przeglądania
        dostępnych funkcji lub zalogować się, aby uzyskać dostęp do
        spersonalizowanych treści.
      </p>

      <hr style={{ margin: "20px 0" }} />

      <h3>Wyszukaj filmy i seriale</h3>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Np. Incepcja, Friends..."
          style={{ marginRight: "10px", padding: "8px" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "8px 15px" }}
        >
          {loading ? "Szukam..." : "Szukaj"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>Błąd: {error}</p>}

      {results.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Wyniki wyszukiwania:</h4>
          <ul>
            {results.map((item) => (
              <li key={item.id}>
                {item.title || item.name} ({item.media_type})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
