// ================= MOBILE MENU TOGGLE =================
const navMobileBtn = document.getElementById("navMobileBtn");
const navCloseBtn = document.getElementById("navCloseBtn");
const navMobileMenu = document.getElementById("navMobileMenu");

navMobileBtn.addEventListener("click", () => {
  navMobileMenu.classList.add("navOpen");
  document.body.style.overflow = "hidden"; // Prevent background scrolling
});

navCloseBtn.addEventListener("click", () => {
  navMobileMenu.classList.remove("navOpen");
  document.body.style.overflow = ""; // Restore background scrolling
});

// Close mobile menu when a link is clicked
document
  .querySelectorAll(".navMobileLink, .navMobileTrackBtn")
  .forEach((link) => {
    link.addEventListener("click", () => {
      navMobileMenu.classList.remove("navOpen");
      document.body.style.overflow = "";
    });
  });
