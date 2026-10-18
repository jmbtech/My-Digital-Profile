const YOUR_EMAIL = "jmbtech1.0@gmail.com";
const FORM_URL = "https://formsubmit.co/ajax/" + YOUR_EMAIL;

const menu = document.getElementById("menu");
const form = document.getElementById("contactForm");
const statusText = document.getElementById("formStatus");
const sendButton = document.getElementById("sendBtn");
const themeToggle = document.getElementById("themeToggle");
const themeColorMeta = document.getElementById("themeColor");
const root = document.documentElement;

const THEME_COLORS = {
  dark: "#0f0f0f",
  light: "#ffffff"
};


function closeMenu() {
  menu.removeAttribute("open");
}

function handleMenuClick(event) {
  if (event.target.closest("a")) {
    closeMenu();
  }
}

function handleDocumentClick(event) {
  if (!menu.contains(event.target)) {
    closeMenu();
  }
}

function handleKeydown(event) {
  if (event.key === "Escape") {
    closeMenu();
  }
}


function getTheme() {
  return root.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function applyTheme(theme) {
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }

  themeColorMeta.setAttribute("content", THEME_COLORS[theme]);
  themeToggle.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
}

function saveTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    console.error("Could not save theme:", error);
  }
}

function handleThemeToggle() {
  const nextTheme = getTheme() === "light" ? "dark" : "light";
  applyTheme(nextTheme);
  saveTheme(nextTheme);
}


function showStatus(message, type) {
  statusText.textContent = message;
  statusText.className = "form-status " + type;
}

function getFormValues() {
  return {
    name: form.elements["name"].value.trim(),
    email: form.elements["email"].value.trim(),
    message: form.elements["message"].value.trim(),
    spamTrap: form.elements["_honey"].value
  };
}

async function sendMessage(values) {
  const response = await fetch(FORM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      name: values.name,
      email: values.email,
      message: values.message,
      _subject: "New portfolio message from " + values.name,
      _replyto: values.email,
      _template: "table",
      _captcha: "false"
    })
  });

  const data = await response.json();
  return data.success === true || data.success === "true";
}

async function handleSubmit(event) {
  event.preventDefault();

  const values = getFormValues();

  if (values.spamTrap !== "") {
    return;
  }

  if (values.name === "" || values.email === "" || values.message === "") {
    showStatus("Please fill in your name, email, and message.", "error");
    return;
  }

  if (!form.elements["email"].checkValidity()) {
    showStatus("Please enter a valid email address.", "error");
    return;
  }

  sendButton.disabled = true;
  showStatus("Sending...", "");

  try {
    const wasSent = await sendMessage(values);

    if (wasSent) {
      showStatus("Thank you! Your message was sent.", "success");
      form.reset();
    } else {
      showStatus("Sorry, the message could not be sent. Please try again.", "error");
    }
  } catch (error) {
    console.error("Contact form error:", error);
    showStatus("Network error. Please check your connection and try again.", "error");
  } finally {
    sendButton.disabled = false;
  }
}


menu.addEventListener("click", handleMenuClick);
document.addEventListener("click", handleDocumentClick);
document.addEventListener("keydown", handleKeydown);
form.addEventListener("submit", handleSubmit);
themeToggle.addEventListener("click", handleThemeToggle);

applyTheme(getTheme());
