import { useState } from "react";
import "./App.css";
import logo from "./assets/logo.png";
import type { RecommendationItem } from "./types/recommendation";
import { mockRecommendations } from "./data/mockRecommendations";

type Theme = "light" | "dark";

function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [recommendations, setRecommendations] = useState(mockRecommendations);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const handleRegenerate = () => {
    setRecommendations((prev) => ({
      movies: [...prev.movies].reverse(),
      books: [...prev.books].reverse(),
    }));
  };

  const handleMoreLikeThis = (item: RecommendationItem) => {
    alert(`More like this: ${item.title}`);
  };

  const handleChangePreferences = () => {
    alert("This will return the user to the homepage/preferences screen.");
  };

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
              </div>

              <button className="regenerate-btn" onClick={handleRegenerate}>
                Regenerate
              </button>
            </div>
          </div>

          <div className="recommendation-sections">
            <RecommendationSection
              title="Movies"
              items={recommendations.movies}
              onMoreLikeThis={handleMoreLikeThis}
            />

            <RecommendationSection
              title="Books"
              items={recommendations.books}
              onMoreLikeThis={handleMoreLikeThis}
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
};

function RecommendationSection({
  title,
  items,
  onMoreLikeThis,
}: RecommendationSectionProps) {
  return (
    <section className="recommendation-section">
      <div className="section-title-row">
        <h2>{title}</h2>
        <span>{items.length} item(s)</span>
      </div>

      <div className="recommendation-list">
        {items.map((item) => (
          <RecommendationRow
            key={item.id}
            item={item}
            onMoreLikeThis={onMoreLikeThis}
          />
        ))}
      </div>
    </section>
  );
}

type RecommendationRowProps = {
  item: RecommendationItem;
  onMoreLikeThis: (item: RecommendationItem) => void;
};

function RecommendationRow({
  item,
  onMoreLikeThis,
}: RecommendationRowProps) {
  return (
    <article className="recommendation-row">
      <div className="recommendation-copy">
        <span className="pill">{item.type}</span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>

      <div className="recommendation-actions">
        <a
          href={item.link}
          target="_blank"
          rel="noreferrer"
          className="open-link"
        >
          Open Link
        </a>

        <button
          className="more-like-btn"
          onClick={() => onMoreLikeThis(item)}
        >
          More like this...
        </button>
      </div>
    </article>
  );
}

export default App;