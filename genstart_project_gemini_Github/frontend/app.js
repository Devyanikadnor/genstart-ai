const ideaInput = document.getElementById("ideaInput");
const modeSelect = document.getElementById("modeSelect");
const generateBtn = document.getElementById("generateBtn");
const statusEl = document.getElementById("status");
const copyBtn = document.getElementById("copyBtn");

const agentDots = document.querySelectorAll(".agent");

const tabs = document.querySelectorAll(".tab");
const tabPanels = {
  overview: document.getElementById("tab-overview"),
  product: document.getElementById("tab-product"),
  tech: document.getElementById("tab-tech"),
  marketing: document.getElementById("tab-marketing"),
  pitch: document.getElementById("tab-pitch"),
};

function setActiveTab(tabName) {
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });
  Object.entries(tabPanels).forEach(([name, node]) => {
    node.classList.toggle("active", name === tabName);
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
});

function setAgentActive(name) {
  agentDots.forEach((el) => {
    el.classList.toggle("active", el.dataset.agent === name);
  });
}

function resetAgents() {
  agentDots.forEach((el) => el.classList.remove("active"));
}

async function generatePlan() {
  const idea = ideaInput.value.trim();
  if (!idea) {
    alert("Please type your startup idea first.");
    return;
  }

  // Enhance prompt with mode
  const mode = modeSelect.value;
  let fullIdea = idea;
  if (mode === "student") {
    fullIdea += " (This idea is primarily for students or campus startups.)";
  } else if (mode === "local") {
    fullIdea += " (This idea should work for a local city like Nashik and can be scaled later.)";
  }

  generateBtn.classList.add("loading");
  statusEl.textContent = "Agents are collaborating on your startup plan...";
  resetAgents();
  setAgentActive("CEO");
  setActiveTab("overview");

  try {
    const res = await fetch("http://localhost:8000/generate-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea: fullIdea }),
    });

    if (!res.ok) {
      throw new Error("Backend error. Is FastAPI running on port 8000?");
    }

    // Show progression through agents with small delays
    setTimeout(() => setAgentActive("Product"), 400);
    setTimeout(() => setAgentActive("Dev"), 800);
    setTimeout(() => setAgentActive("Marketing"), 1200);
    setTimeout(() => setAgentActive("Pitch"), 1600);

    const data = await res.json();

    // Pretty print
    tabPanels.overview.textContent = JSON.stringify(data.ceo || {}, null, 2);
    tabPanels.product.textContent = JSON.stringify(data.product || {}, null, 2);
    tabPanels.tech.textContent = JSON.stringify(data.dev || {}, null, 2);
    tabPanels.marketing.textContent = JSON.stringify(data.marketing || {}, null, 2);
    tabPanels.pitch.textContent = JSON.stringify(data.summary || {}, null, 2);

    statusEl.textContent = "Plan generated! Explore each tab for full details.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Something went wrong. Check console & backend server.";
  } finally {
    generateBtn.classList.remove("loading");
  }
}

generateBtn.addEventListener("click", generatePlan);

copyBtn.addEventListener("click", async () => {
  const combined = [
    "# CEO / Overview",
    tabPanels.overview.textContent,
    "",
    "# Product",
    tabPanels.product.textContent,
    "",
    "# Tech",
    tabPanels.tech.textContent,
    "",
    "# Marketing",
    tabPanels.marketing.textContent,
    "",
    "# Pitch",
    tabPanels.pitch.textContent,
  ].join("\n");

  try {
    await navigator.clipboard.writeText(combined);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy All as Text"), 1500);
  } catch {
    alert("Could not copy to clipboard.");
  }
});