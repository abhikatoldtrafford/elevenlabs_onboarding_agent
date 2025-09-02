# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm start` - Start development server on http://localhost:3000
- `npm test` - Run tests in interactive watch mode
- `npm run build` - Build production bundle to `build/` folder

### Testing
- `npm test` - Run tests in watch mode
- `npm test -- --watchAll=false` - Run tests once without watch mode
- `npm test -- --coverage` - Run tests with coverage report

## Architecture

This is a React TypeScript application bootstrapped with Create React App that implements an onboarding tracker using ElevenLabs conversation API.

### Key Components

**Main Application (src/App.tsx)**
- Manages conversation state with ElevenLabs agent (AGENT_ID: agent_1401k0xe16ree10bp35fs692mhn7)
- Implements `UPDATE_PROFILE` client tool to capture user profile data during voice conversations
- Tracks profile completion metrics and conversation duration
- Displays real-time profile data extraction with visual feedback

### Profile Data Structure
The app captures and tracks the following user profile fields:
- Basic info: firstName, lastName, occupation, location
- Learning preferences: interests[], learningStyle, studyTime
- Goals: shortTermGoals[], longTermGoals[]
- Generated persona: overallUserPersona

### Dependencies
- React 19.1.0 with TypeScript
- @elevenlabs/react for voice conversation integration
- Testing library (@testing-library/react, jest-dom)
- Standard Create React App tooling (react-scripts)

### TypeScript Configuration
- Strict mode enabled
- Target: ES5 with modern lib features
- JSX: react-jsx
- Module: ESNext with Node resolution