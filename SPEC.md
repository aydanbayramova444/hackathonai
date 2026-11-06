# HireFlow – HR Daily Workspace

> "Your HR workflow. Simplified."

## Tech Stack
- Structure: `frontend/` and `backend/` folders
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + lucide-react + Recharts
- Backend: Node.js + Express + SQLite (better-sqlite3), REST API
- Database tables: candidates, vacancies, interviews, onboarding_tasks
- Seed on first run: 4 vacancies, 20 candidates, 3 interviews, 8 onboarding tasks
- Kanban stage changes persist to the database
- Design: premium SaaS (Linear/Notion level), Inter font, soft shadows, rounded cards, indigo/purple accent, animations

## Project Overview
A modern, professional, interactive SaaS web application called **HireFlow**, an HR Daily Workspace that simplifies everyday HR tasks: recruitment, job announcements, interview preparation, candidate pipelines and employee onboarding, all in one workspace. It should feel like a real enterprise HR product, not a landing page or static dashboard.

## Design & Visual Style
- Modern SaaS dashboard, clean, minimal, premium
- White and light-gray backgrounds
- Soft blue, indigo and purple accents
- Rounded cards, subtle shadows, professional typography
- Smooth transitions, interactive components
- Responsive (desktop and mobile), consistent spacing

## Pages

### 1. Dashboard
- Welcome: "Good morning, HR Team!"
- Stats: active vacancies, total candidates, interviews scheduled, pending onboarding tasks
- Recruitment pipeline overview, recent activity, upcoming interviews
- Quick actions: Create Job Post, Generate Interview Kit, Add Candidate, Create Onboarding Plan
- Charts and visual statistics

### 2. Job Post Generator
- Inputs: job title, company name, location, employment type, required skills, job description, application link, job description paste area
- Platform: LinkedIn, Instagram, Facebook
- Tone: Professional, Friendly, Engaging
- Generate Post → headline, intro, key responsibilities, requirements, CTA, hashtags
- Live preview, copy to clipboard, regenerate, edit
- Rule-based templates, no external AI APIs

### 3. Interview Kit Generator
- Select vacancy, interview type (HR / Technical / Behavioral), level (Junior / Mid-level / Senior)
- Output: interview, behavioral and technical questions, evaluation criteria, scorecard, 1–5 rating scale, notes
- Printable evaluation form
- Predefined question banks, rule-based selection

### 4. Candidate Pipeline (Kanban)
- Stages: Applied, Screening, Interview, Offer, Hired, Rejected
- Add candidate, profile cards, info, vacancy assignment, status tracking
- Search and filtering, detail modal, move between stages, visual progress
- Realistic demo data

### 5. Onboarding Automation
- Add new employee: name, position, department, start date, experience level
- Generate role-based checklist (company email, laptop, HR docs, team intro, mentor, department training, first-week check-in…)
- Task status, progress indicators, completion %, assignment, overview

### 6. HR Message Assistant
- Templates: interview invitation, reminder, rescheduling, rejection, job offer, follow-up
- Inputs: candidate name, job title, company name
- Generate personalized message, copy
- Placeholder-based generation

## Navigation
- Left sidebar: logo, Dashboard, Job Posts, Interview Kits, Candidates, Onboarding, HR Messages, Settings
- Top bar: search, notifications, user profile, workspace selector

## Functional Requirements
Working navigation, functional buttons, validated forms, candidate status updates, task toggles, search/filtering, copy-to-clipboard, editable generated content, modals, dashboard stats driven by data, persistence. Opens straight into the dashboard, no auth.

## Build Order (stop after each step for review)
1. Backend + database + API
2. Layout and Dashboard
3. Candidate Pipeline (Kanban)
4. Job Post Generator
5. Interview Kit
6. Onboarding
7. HR Messages
