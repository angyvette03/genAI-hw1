import { useState } from "react";

const defaultExample = "chicken thighs, rice, spinach, garlic, onion, lemon";

export default function App() {
  const [ingredients, setIngredients] = useState("");
  const [diet, setDiet] = useState("none");
  const [servings, setServings] = useState("2");
  const [timeLimit, setTimeLimit] = useState("30");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const canSubmit = ingredients.trim().length > 0 && !loading;
  const handleAutofill = () => {
    setIngredients(defaultExample);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult("");
    setCopied(false);

    if (!ingredients.trim()) {
      setError("Add at least two ingredients.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          diet,
          servings,
          timeLimit,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Request failed");
      }

      setResult(data.text || "No response text returned.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy. Select and copy manually.");
    }
  };

  return (
    <div className="page">
      <header className="header">
        <p className="eyebrow">GenAI Recipe Builder</p>
        <h1>Cook a recipe from what you already have.</h1>
        <p className="subhead">
          Paste your ingredients, pick a few preferences, and let Gemini craft a
          fast recipe you can make tonight.
        </p>
      </header>

      <main className="grid">
        <section className="card">
          <form onSubmit={handleSubmit} className="form">
            <label className="label" htmlFor="ingredients">
              Ingredients
            </label>
            <textarea
              id="ingredients"
              name="ingredients"
              rows={5}
              placeholder={defaultExample}
              value={ingredients}
              onChange={(event) => setIngredients(event.target.value)}
            />
            <button
              type="button"
              className="secondary"
              onClick={handleAutofill}
            >
              Use example ingredients
            </button>

            <div className="row">
              <div>
                <label className="label" htmlFor="diet">
                  Diet
                </label>
                <select
                  id="diet"
                  name="diet"
                  value={diet}
                  onChange={(event) => setDiet(event.target.value)}
                >
                  <option value="none">No restriction</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten-free">Gluten-free</option>
                  <option value="dairy-free">Dairy-free</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="servings">
                  Servings
                </label>
                <select
                  id="servings"
                  name="servings"
                  value={servings}
                  onChange={(event) => setServings(event.target.value)}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="4">4</option>
                  <option value="6">6</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="timeLimit">
                  Max time
                </label>
                <select
                  id="timeLimit"
                  name="timeLimit"
                  value={timeLimit}
                  onChange={(event) => setTimeLimit(event.target.value)}
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={!canSubmit}>
              {loading ? "Cooking..." : "Generate recipe"}
            </button>

            {error && <p className="error">{error}</p>}
          </form>
        </section>

        <section className="card output">
          <div className="output-header">
            <h2>Your recipe</h2>
            <p>
              Gemini will return a title, ingredients list, steps, cook time, and
              servings.
            </p>
            <button
              type="button"
              className="secondary"
              onClick={handleCopy}
              disabled={!result}
            >
              {copied ? "Copied" : "Copy recipe"}
            </button>
          </div>
          <div className="output-body">
            {loading && <div className="skeleton" />}
            {!loading && !result && (
              <p className="placeholder">
                Add ingredients and click generate to see a recipe here.
              </p>
            )}
            {!loading && result && <pre>{result}</pre>}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Tip: include pantry basics like rice, pasta, or canned beans.</p>
      </footer>
    </div>
  );
}
