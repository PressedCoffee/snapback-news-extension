// content.js
(function () {
  const browser = window.chrome || window.browser;

  function getArticleContent() {
    const title = document.querySelector("h1").innerText;
    const content = Array.from(document.querySelectorAll("p"))
      .map((p) => p.innerText)
      .join("\n");
    return { title, content };
  }

  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getArticle") {
      sendResponse(getArticleContent());
    }
  });

  const button = document.createElement("button");
  button.textContent = "Get Context";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.zIndex = "9999";
  document.body.appendChild(button);

  button.addEventListener("click", () => {
    const article = getArticleContent();
    browser.runtime.sendMessage(
      { action: "getContext", article },
      (response) => {
        alert(response.context);
      }
    );
  });
})();
