# ⚖️ The Tiebreaker

**The Tiebreaker** is a highly polished, full-stack decision-making assistant powered by Gemini. It transforms chaotic dilemmas into structured, actionable insights using comprehensive multi-angle analyses, side-by-side comparisons, interactive decision trees, and intelligent option branching.

---

## ✨ Key Features

### 1. Multi-Modal Dilemma Input

Express your dilemmas in the way that suits you best:

- **Form**: Enter structured text inputs specifying your options and custom evaluation preferences.
- **Speak**: Dictate your thoughts and let Gemini extract the core dilemma, options, and context automatically.
- **Photo**: Upload or take a picture of a diagram, list, or situation to generate structured criteria.

### 2. Multi-Angle Analytical Dashboards

Every dilemma is dissected through three analytical views:

- **Comparison View**: High-level scores, key considerations, and targeted verdicts.
- **Pros & Cons View**: Staggered lists highlighting trade-offs for each path.
- **SWOT Analysis**: A full Strengths, Weaknesses, Opportunities, and Threats grid for your choices.

### 3. Dynamic Option Branching (Decision Trees)

Decisions are rarely one-step. When reviewing an option, click **+ Branch Option** to explore sub-dilemmas.

- Gemini maps out the next steps, generating sub-options and criteria dynamically.
- Seamless, instant loading transitions ensure your flow is uninterrupted.
- Fully interactive visual diagram maps the lineage of your primary choices and child branches.

---

## 🛠️ Tech Stack

- **Frontend**: React (v18+) & Vite
- **Styling**: Tailwind CSS & Lucide Icons (clean, adaptive dark-mode interface)
- **State & Routing**: Responsive state engines with persistent local storage
- **AI Core**: Google Gemini API via server-side `@google/genai` (voice, image, and branch generation)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/the-tiebreaker.git
   cd the-tiebreaker
   ```
