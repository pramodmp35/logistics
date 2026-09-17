document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".ftrnewsform");
  const input = document.querySelector(".ftrnewsinp");
  const errorMsg = document.getElementById("ftrEmailError");

  form.addEventListener("submit", function (e) {
    const email = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validation checks
    if (email === "") {
      e.preventDefault(); // Stop the form from submitting
      errorMsg.textContent = "Email address is required.";
      errorMsg.classList.add("visible");
      form.classList.add("has-error");
      return;
    }

    if (!emailRegex.test(email)) {
      e.preventDefault(); // Stop the form from submitting
      errorMsg.textContent = "Please enter a valid email address.";
      errorMsg.classList.add("visible");
      form.classList.add("has-error");
      return;
    }

    // If valid, do NOT call e.preventDefault().
    // The form will naturally submit to action="./404.html"

    // Clear any previous error styling just before submission
    errorMsg.textContent = "";
    errorMsg.classList.remove("visible");
    form.classList.remove("has-error");
  });

  // Clear error message when the user starts typing
  input.addEventListener("input", function () {
    errorMsg.textContent = "";
    errorMsg.classList.remove("visible");
    form.classList.remove("has-error");
  });
});
