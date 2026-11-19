document.addEventListener("DOMContentLoaded", () => {
  // Automatically detect if the game is inside a subfolder like /special-game-1/
  const isSubfolder = window.location.pathname.split("/").filter(Boolean).length > 2;
  const homePath = isSubfolder ? "../index.html" : "index.html";

  const backBtn = document.createElement("a");
  backBtn.href = homePath;
  backBtn.className = "back-to-hub-btn";
  backBtn.textContent = "← All Games";

  document.body.appendChild(backBtn);
});
