const API_URL = "http://localhost:3001/api";

export const getHistoricalContext = async (article) => {
  try {
    const response = await fetch(`${API_URL}/context`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ article }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data.context;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
