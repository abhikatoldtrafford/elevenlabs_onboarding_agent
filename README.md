# RIATA Onboarding Tracker

A voice-powered onboarding application that uses ElevenLabs conversation AI to collect user profile information through natural conversation.

## Live Demo

Watch the application in action: [https://www.youtube.com/watch?v=MQ3lW7p4Zn4&t=18s&ab_channel=AbhikMaiti](https://www.youtube.com/watch?v=MQ3lW7p4Zn4&t=18s&ab_channel=AbhikMaiti)

## Features

- **Voice-First Onboarding**: Natural conversation interface powered by ElevenLabs AI
- **Real-Time Profile Building**: Automatically extracts and displays user information as they speak
- **Smart Data Extraction**: Captures personal details, interests, learning preferences, and goals
- **Visual Feedback**: Live updates with animations and progress tracking
- **Completion Tracking**: Shows profile completion percentage and extracted field count

## Profile Information Captured

- **Personal Details**: First name, last name, occupation, location
- **Learning Preferences**: Learning style, preferred study times
- **Interests**: Multiple areas of interest
- **Goals**: Both short-term and long-term objectives
- **AI-Generated Persona**: Overall user profile summary

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/riata-onboarding-tracker.git
cd riata-onboarding-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner in interactive watch mode
- `npm run build` - Builds the app for production to the `build` folder
- `npm run eject` - Ejects from Create React App (one-way operation)

## Technology Stack

- **React 19.1.0** - UI framework
- **TypeScript** - Type-safe JavaScript
- **ElevenLabs React SDK** - Voice conversation integration
- **Create React App** - Build tooling and configuration

## How It Works

1. Click "Start Onboarding" to begin the voice conversation
2. The AI agent will guide you through the onboarding process
3. As you speak, your profile information is extracted in real-time
4. Watch the profile cards populate with your information
5. Track your progress with the completion percentage
6. End the conversation when your profile is complete

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is private and proprietary.