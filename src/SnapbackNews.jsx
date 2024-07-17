import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";

const SnapbackNews = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [context, setContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/news");
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("Failed to fetch news articles.");
    }
  };

  const handleGetContext = async (article) => {
    setIsLoading(true);
    setError("");
    setSelectedArticle(article);
    try {
      const response = await fetch("http://localhost:3001/api/context", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: article.title,
          description: article.description,
          content: article.content,
        }),
      });
      const data = await response.json();
      setContext(data.context);
    } catch (error) {
      setError("Error fetching historical context. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">SnapbackNews</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">News Feed</h2>
          {articles.map((article, index) => (
            <Card key={index} className="mb-4">
              <CardHeader>
                <CardTitle>{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{article.description}</p>
                <Button
                  onClick={() => handleGetContext(article)}
                  className="mt-2"
                  disabled={isLoading && selectedArticle === article}
                >
                  {isLoading && selectedArticle === article
                    ? "Loading..."
                    : "Get Historical Context"}
                </Button>
                <p>{context}</p>
                <Button
                  className="mt-2"
                  onClick={() => window.open("https://tellarep.com", "_blank")}
                >
                  Draft an Opinion Letter
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Historical Context</h2>
          {error && (
            <Card className="mb-4 bg-red-100">
              <CardContent>
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}
          {context && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedArticle?.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{context}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnapbackNews;
