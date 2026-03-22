import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/logo.png";
import "../App.css";
import GeminiConnecter from "../services/GeminiConnecter";
import type {
  RecommendationItem,
  RecommendationResponse,
} from "../types/recommendation";

type Theme = "light" | "dark";

type RawRecommendation = Partial<RecommendationItem> & {
  type?: unknown;
};

type RawRecommendationResponse = {
  movies?: RawRecommendation[];
  books?: RawRecommendation[];
};

const emptyRecommendations: RecommendationResponse = {
  movies: [],
  books: [],
};

function normalizeItem(
  item: RawRecommendation,
  fallbackType: string
): RecommendationItem {
  return {
    title: item.title ?? "",
    type: typeof item.type === "string" ? item.type : fallbackType,
    genre: item.genre ?? "",
    year: item.year ?? "",
    author: item.author ?? "",
    description: item.description ?? "",
    reason: item.reason ?? "",
    link: item.link ?? "",
  };
}

function normalizeRecommendations(data: unknown): RecommendationResponse {
  const raw = (data ?? {}) as RawRecommendationResponse;

  return {
    movies: Array.isArray(raw.movies)
      ? raw.movies.map((item) => normalizeItem(item, "movie"))
      : [],
    books: Array.isArray(raw.books)
      ? raw.books.map((item) => normalizeItem(item, "book"))
      : [],
  };
}

function RecommendationsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("query") || "";

  const [theme, setTheme] = useState<Theme>(
  () => (localStorage.getItem("theme") as Theme) ?? "light");

  const [recommendations, setRecommendations] =
    useState<RecommendationResponse>(emptyRecommendations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const preferences = {
    mood: query,
    genre: "",
    movies: true,
    books: true,
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const next = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      return next;
    });
  };

  const handleChangePreferences = () => {
    navigate("/");
  };

  const fetchInitialRecommendations = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError("");

      const result = await GeminiConnecter("initial", preferences);
      console.log("Initial Gemini result:", result);

      if (result?.success && result.recommendations) {
        setRecommendations(normalizeRecommendations(result.recommendations));
      } else {
        setError(result?.error || "Failed to generate recommendations.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      setError("");

      const previousTitles = [
        ...recommendations.movies.map((item) => item.title),
        ...recommendations.books.map((item) => item.title),
      ];

      const result = await GeminiConnecter(
        "regenerate",
        preferences,
        null,
        previousTitles
      );
      console.log("Regenerate Gemini result:", result);

      if (result?.success && result.recommendations) {
        setRecommendations(normalizeRecommendations(result.recommendations));
      } else {
        setError(result?.error || "Failed to regenerate recommendations.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to regenerate recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    document.body.classList.toggle("light", theme === "light");
  }, [theme]);

  const handleMoreLikeThis = async (item: RecommendationItem) => {
    try {
      setLoading(true);
      setError("");

      const result = await GeminiConnecter("similar", preferences, item.title);
      console.log("More like this Gemini result:", result);

      if (result?.success && result.recommendations) {
        setRecommendations(normalizeRecommendations(result.recommendations));
      } else {
        setError(`Failed to get more suggestions like ${item.title}.`);
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to get more suggestions like ${item.title}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className={`app ${theme}`}>
      <main className="page-shell">
        <section className="recommendation-panel">
          <div className="panel-top-row">
            <button className="back-btn" onClick={handleChangePreferences}>
              ← Change Preferences
            </button>

            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === "light" ? "☾ Dark" : "☀ Light"}
            </button>
          </div>

          <div className="panel-header">
            <div className="brand-block">
              <img
                src={logo}
                alt="Popcorn & Paperbacks logo"
                className="brand-logo"
              />
            </div>

            <div className="response-header">
              <div>
                <p className="eyebrow">Suggestion Page</p>
                <h1>AI Response</h1>
                <p className="response-subtitle">
                  Personalized movie and book recommendations based on your
                  preferences.
                </p>
                {query && <p className="response-subtitle">Prompt: {query}</p>}
              </div>

              <button
                className="regenerate-btn"
                onClick={handleRegenerate}
                disabled={loading}
              >
                {loading ? "Loading..." : "Regenerate"}
              </button>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {!loading &&
            recommendations.movies.length === 0 &&
            recommendations.books.length === 0 && (
              <div className="empty-state">
                No recommendations found yet. Try changing your preferences.
              </div>
            )}

          <div className="recommendation-sections">
            <RecommendationSection
              title="Movies"
              items={recommendations.movies}
              onMoreLikeThis={handleMoreLikeThis}
              loading={loading}
            />

            <RecommendationSection
              title="Books"
              items={recommendations.books}
              onMoreLikeThis={handleMoreLikeThis}
              loading={loading}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

type RecommendationSectionProps = {
  title: string;
  items: RecommendationItem[];
  onMoreLikeThis: (item: RecommendationItem) => void;
  loading: boolean;
};

function RecommendationSection({
  title,
  items,
  onMoreLikeThis,
  loading,
}: RecommendationSectionProps) {
  return (
    <section className="recommendation-section">
      <div className="section-title-row">
        <h2>{title}</h2>
        <span>{items.length} item(s)</span>
      </div>

      <div className="recommendation-list">
        {items.length === 0 && !loading ? (
          <div className="empty-state">No {title.toLowerCase()} found.</div>
        ) : (
          items.map((item, index) => (
            <RecommendationRow
              key={`${item.title}-${index}`}
              item={item}
              onMoreLikeThis={onMoreLikeThis}
              loading={loading}
            />
          ))
        )}
      </div>
    </section>
  );
}

type RecommendationRowProps = {
  item: RecommendationItem;
  onMoreLikeThis: (item: RecommendationItem) => void;
  loading: boolean;
};

function RecommendationRow({
  item,
  onMoreLikeThis,
  loading,
}: RecommendationRowProps) {
  return (
    <article className="recommendation-row">
      <div className="recommendation-copy">
        <span className="pill">{item.type}</span>
        <h3>{item.title}</h3>
        {item.genre && (
          <p>
            <strong>Genre:</strong> {item.genre}
          </p>
        )}
        {item.year && (
          <p>
            <strong>Year:</strong> {item.year}
          </p>
        )}
        {item.author && (
          <p>
            <strong>Author:</strong> {item.author}
          </p>
        )}
        <p>{item.description}</p>
        {item.reason && (
          <p>
            <strong>Why it fits:</strong> {item.reason}
          </p>
        )}
        {item.link && (
          <p>
            <strong>Link:</strong>{" "}
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "blue", textDecoration: "none" }}
            >
              {item.link}
            </a>
          </p>
        )}
      </div>

      <div className="recommendation-actions">
        <button
          className="more-like-btn"
          onClick={() => onMoreLikeThis(item)}
          disabled={loading}
        >
          {loading ? "Loading..." : "More like this..."}
        </button>
      </div>
    </article>
  );
}

export default RecommendationsPage;