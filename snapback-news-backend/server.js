require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

async function searchWeb(query) {
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`;
  const response = await axios.get(url);
  return response.data.items.slice(0, 3).map((item) => ({
    title: item.title,
    link: item.link,
  }));
}

app.post("/api/context", async (req, res) => {
  try {
    const { title, content } = req.body;

    // First, get the main topics and entities from the article
    const topicsCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that identifies key topics and entities from news articles.",
        },
        {
          role: "user",
          content: `Identify the main topics, people, places, and events mentioned in this news article. Focus on elements that might have historical significance. Title: "${title}" Content: ${content}`,
        },
      ],
    });

    const topics = topicsCompletion.choices[0].message.content;

    // Now, get historical context based on these topics
    const contextCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that provides historical context for news articles. Focus on past events, trends, or patterns that relate to the current article.",
        },
        {
          role: "user",
          content: `Provide historical context for a news article with the following main topics and entities: ${topics}. Make it easy to digest, focusing on relevant historical events, trends, or patterns that help understand the current situation. Do not summarize the current article.`,
        },
      ],
    });

    const context = contextCompletion.choices[0].message.content;

    // Perform web search based on the historical context
    const searchResults = await searchWeb(`historical background ${topics}`);

    res.json({
      context: context,
      disclaimer:
        "Note: The following sources are generated through an automated web search and may not directly correspond to the information provided. Please verify the information independently.",
      sources: searchResults,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "An error occurred while fetching the historical context.",
    });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));
