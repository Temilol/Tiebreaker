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
   git clone https://github.com/Temilol/tiebreaker.git
   cd tiebreaker
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   APP_URL=http://localhost:3000
   ```

4. **Run locally (development mode):**

   ```bash
   npm run dev
   ```

   The app will start on `http://localhost:3000`

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📦 Project Structure

```
tiebreaker/
├── src/
│   ├── components/          # React components
│   │   └── ...
│   ├── App.tsx              # Main app component
│   ├── types.ts             # TypeScript interfaces
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles
├── server.ts                # Express backend + API routes
├── vite.config.ts           # Vite bundler config
├── tsconfig.json            # TypeScript config
├── render.yaml              # Render deployment config
└── package.json
```

---

## 🚀 API Endpoints

### POST `/api/tiebreak`

Analyzes a decision dilemma and returns a comprehensive report.

**Request:**

```json
{
  "topic": "Should I change careers?",
  "options": ["Stay at current job", "Switch to new industry"],
  "preferences": "Value work-life balance and growth",
  "optionImages": [null, "base64_image_string"]
}
```

**Response:**

```json
{
  "verdict": {
    "recommendedOption": "Switch to new industry",
    "confidence": 85,
    "reasoning": "...",
    "keyTradeoff": "...",
    "nextSteps": ["..."]
  },
  "prosCons": [...],
  "comparisonTable": [...],
  "swotAnalysis": [...]
}
```

### POST `/api/suggest-branch`

Generates sub-options for branching into a chosen option.

**Request:**

```json
{
  "parentTopic": "Should I change careers?",
  "branchedFromOption": "Switch to new industry",
  "preferences": "Value work-life balance and growth"
}
```

**Response:**

```json
{
  "suggestedTopic": "Which industry should I switch to?",
  "suggestedOptions": ["Tech", "Finance", "Consulting"],
  "suggestedPreferences": "...",
  "suggestedTag": "Career"
}
```

---

## 🌐 Deployment

### Deploy to Render (Free Tier)

1. **Create a Render account** at [render.com](https://render.com)

2. **Connect your GitHub repository:**
   - Go to Render Dashboard → Create New → Web Service
   - Select your repository
   - Render will auto-detect `render.yaml` and use the configuration

3. **Set environment variables** in Render dashboard:
   - `GEMINI_API_KEY` = Your Gemini API key
   - `APP_URL` = Your Render service URL (e.g., `https://tiebreaker.onrender.com`)

4. **Deploy:**
   - Save and deploy
   - The app will build with `npm install && npm run build`
   - Start command: `npm run start`

> **Note:** Free tier instances spin down after 15 minutes of inactivity. The first request after sleep may take 30-60 seconds to respond, but subsequent requests are fast.

---

## 🔑 Environment Variables

| Variable         | Required    | Description                                                                    |
| ---------------- | ----------- | ------------------------------------------------------------------------------ |
| `GEMINI_API_KEY` | ✅ Yes      | API key for Google Gemini (get from [AI Studio](https://aistudio.google.com/)) |
| `APP_URL`        | ❌ Optional | URL of the deployed app for self-referential links                             |
| `NODE_ENV`       | ❌ Optional | Set to `production` for optimized builds                                       |

---

## 💡 Usage Tips

### Creating a Decision

1. **Choose your input method:**
   - **Structured Form**: Best for clear, well-defined choices
   - **Voice**: Quick dictation of your dilemma
   - **Image**: Upload diagrams, mockups, or options

2. **Add tags** to organize decisions by category (Career, Finance, Housing, Tech, Personal, Health, Travel, or custom)

3. **Set preferences** for personalized analysis (e.g., "I prioritize cost over time")

### Branching into Options

- After getting your verdict, click **+ Branch Option** on any recommended choice
- Explore sub-decisions and next steps recursively
- Full decision tree history is preserved

### Comparing Decisions

- Enable **Comparison Mode** in the sidebar
- Select up to 3 decisions to compare side-by-side
- View confidence levels, verdicts, and tradeoffs across decisions

---

## ⚙️ Scripts

| Script                 | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start development server with hot reload |
| `npm run build`        | Build frontend & backend for production  |
| `npm run build:static` | Build frontend only (Vite)               |
| `npm run start`        | Start production server                  |
| `npm run clean`        | Clean build artifacts                    |
| `npm run lint`         | Run TypeScript type checking             |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🐛 Troubleshooting

### "GEMINI_API_KEY is not configured"

- Ensure your `.env` file exists in the root directory
- Verify the API key is correct from [Google AI Studio](https://aistudio.google.com/)
- On Render, check that the environment variable is set in the dashboard

### App fails to start

- Ensure Node.js v18+ is installed: `node --version`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run lint`

### Decision analysis times out

- Gemini API may be slow; try again after a few seconds
- Ensure your internet connection is stable
- Check that your Gemini API key has active quota

### Styling issues in production

- Run `npm run build` to ensure Tailwind CSS is fully compiled
- Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)

---

## 📞 Support

For issues, feature requests, or questions:

- Open an issue on [GitHub Issues](https://github.com/Temilol/Tiebreaker/issues)

---

**Built with ⚖️ for better decisions**
