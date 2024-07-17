const browser = window.chrome || window.browser;

document.addEventListener("DOMContentLoaded", function () {
  const contextDiv = document.getElementById("context");
  const getContextButton = document.getElementById("getContext");
  const loadingSpinner = document.getElementById("loading");
  const errorMessage = document.getElementById("error");

  getContextButton.addEventListener("click", function () {
    contextDiv.textContent = "";
    errorMessage.textContent = "";
    loadingSpinner.style.display = "block";

    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      browser.tabs.sendMessage(
        tabs[0].id,
        { action: "getArticle" },
        function (response) {
          if (response && response.title && response.content) {
            fetch("http://localhost:3001/api/context", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(response),
            })
              .then((res) => res.json())
              .then((data) => {
                loadingSpinner.style.display = "none";
                contextDiv.textContent = data.context;
              })
              .catch((error) => {
                console.error("Error:", error);
                loadingSpinner.style.display = "none";
                errorMessage.textContent = `Error fetching context: ${error.message}`;
              });
          } else {
            loadingSpinner.style.display = "none";
            errorMessage.textContent =
              "Error: Could not retrieve article content.";
          }
        }
      );
    });
  });
});
