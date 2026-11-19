document.addEventListener("DOMContentLoaded", () => {
  // Check if the current URL includes the special-game-1 subfolder
  const isSubfolder = window.location.pathname.includes("/special-game-1/");
  const homePath = isSubfolder ? "../index.html" : "index.html";

  const backBtn = document.createElement("a");
  backBtn.href = homePath;
  backBtn.className = "back-to-hub-btn";
  backBtn.textContent = "← All Games";

  document.body.appendChild(backBtn);
});
