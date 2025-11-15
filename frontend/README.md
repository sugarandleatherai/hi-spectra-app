# Hi-Spectra Frontend

React frontend for Hi-Spectra - a continuous cognitive bridge for neurodivergent and trauma-affected minds.

## Features

- Clean, accessible interface for testing Hi-Spectra
- Real-time communication with backend API
- Visual feedback for different intent types
- Example commands for quick testing
- Responsive design

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the App

### Development Mode

Start the development server:

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

1. Make sure the backend is running at http://localhost:8000
2. Start the frontend dev server
3. Enter a message starting with "Hi Spectra", "High Spectra", or "Hey Spectra"
4. View the classified intent and response

## Example Commands

Try these example commands:

**Self-Translation:**
- "Hi Spectra, what was I trying to say?"
- "Hey Spectra, help me express this clearly"

**Decode Others:**
- "High Spectra, what did they mean by that?"
- "Hi Spectra, is that hostile or neutral?"

**Emotional Regulation:**
- "Hi Spectra, I'm overwhelmed right now"
- "Hey Spectra, help me stay regulated"

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Entry point
│   └── styles.css       # Global styles
├── index.html           # HTML template
├── package.json
└── vite.config.js       # Vite configuration
```

## API Integration

The frontend communicates with the backend via:
- Base URL: `http://localhost:8000`
- Main endpoint: `POST /spectra/process`

The Vite dev server is configured with a proxy for `/api` requests.

## Customization

### Styling

All styles are in `src/styles.css`. The app uses CSS custom properties for theming:

```css
:root {
  --primary: #6366f1;
  --secondary: #8b5cf6;
  --bg: #0f172a;
  --text: #f1f5f9;
  /* etc. */
}
```

### API URL

To change the backend URL, update `API_BASE_URL` in `src/App.jsx`:

```javascript
const API_BASE_URL = 'http://localhost:8000'
```

## Future Enhancements

- [ ] Voice input via Web Speech API
- [ ] Conversation history
- [ ] User profile settings
- [ ] Dark/light theme toggle
- [ ] Audio output for responses
- [ ] Mobile app version

## License

MIT
