# VIBE-LA-YOUDRAWIT

A belief-driven visualisation interactive for Learning Analytics. Students are shown partial data about their course engagement and asked to draw what they think the rest looks like, before the actual data is revealed. This supports self-regulated learning through reflection.

## Prerequisites

- Python 3.10+
- Node.js 18+

## Setup & Run

### Backend (FastAPI)

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
python backend/main.py
```

The API runs on `http://localhost:8080`.

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend.

## Usage

Open `http://localhost:5173/student/<username>` in your browser. For example:

- `http://localhost:5173/student/s4501001` (Liam Chen)
- `http://localhost:5173/student/s4501004` (Olivia Nguyen)

The default URL redirects to `s4501001`.

## Wizard Screens

1. **Intro** - Explains the activity
2. **Course Material Access** (You Draw It line chart) - Draw your predicted weekly access, then compare with actual
3. **Applied Classes & Weekly Activities** (You Draw It bar chart) - Estimate completion, then compare
4. **Reflection** - Final reflection on self-regulated learning

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI server
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Wizard.jsx           # Multi-step wizard controller
│       │   ├── IntroScreen.jsx      # Welcome & instructions
│       │   ├── AccessDrawScreen.jsx # You Draw It line chart
│       │   ├── BarChartScreen.jsx   # You Draw It bar chart
│       │   └── EndScreen.jsx        # Reflection & completion
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── data/                    # CSV data files
│   ├── enrolled_students.csv
│   ├── course_details.csv
│   ├── gradebook.csv
│   ├── appliedclassstats.csv
│   └── access.csv
└── prompts/
```
