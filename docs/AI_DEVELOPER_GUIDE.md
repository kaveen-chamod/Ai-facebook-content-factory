# AI Developer Guide

## Project Information

### Project Name
AI Facebook Content Factory

### Goal
Build a fully automated AI system that generates, stores, manages, schedules, and publishes high-quality Facebook content for multiple pages.

### Target Audience
- USA
- Age 65+
- Simple American English

## Tech Stack

- Node.js (ES Modules)
- Supabase
- Gemini API
- n8n
- GitHub
- VS Code

## Project Architecture

```text
src/
services/
prompts/
database/
utils/
config/
docs/
```

## Coding Rules

- Use ES Modules only.
- Never use CommonJS.
- Always use async/await.
- Never duplicate code.
- One responsibility per file.
- Keep files modular.
- Write production-ready code.
- Never hardcode API keys.
- Never hardcode prompts.

## Prompt Architecture

- System Prompt
- Audience Prompt
- Content Profile
- Topics
- Prompt Builder
- Gemini Service

## Database Rules

- Supabase is the source of truth.
- Every generated post must be stored in Supabase.
- Never delete records.
- Use status instead of published boolean.
- Store image prompts separately.
- Store Facebook IDs after publishing.

## Content Rules

### Audience
- USA
- Age 65+

### Writing Style
- Use warm, friendly English.
- Avoid politics.
- Avoid religion.
- Avoid medical claims.
- Facts must be true.
- Optimize for Facebook engagement.
- Encourage comments.
- No clickbait.
- Generate JSON only.

## Folder Responsibilities

### services/
External APIs

### prompts/
Prompt builders

### database/
Database logic

### utils/
Helper functions

### config/
Configuration

### docs/
Documentation

## Git Rules

- Commit after every completed lesson.
- Use meaningful commit messages.
- Push to GitHub frequently.
- Never commit .env.

## Environment Variables

- GEMINI_API_KEY
- SUPABASE_URL
- SUPABASE_ANON_KEY
- FACEBOOK_PAGE_ID
- FACEBOOK_ACCESS_TOKEN

## Development Principles

- Clean Architecture
- SOLID Principles
- DRY
- KISS
- Separation of Concerns

## Future Roadmap

- Image Generation
- Image Editing
- Video Generation
- Facebook Publishing
- Scheduling
- Analytics
- Multi-page Support
- AI Agent
- Dashboard

## Working Guidelines for AI Assistants

When generating code:

- Never modify unrelated files.
- Always explain the reason before coding.
- Prefer reusable functions.
- Follow the existing project architecture.
- Add clear comments.
- Keep changes focused and professional.
