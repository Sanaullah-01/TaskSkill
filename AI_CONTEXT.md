# TaskSkill

> Production-grade SaaS Task Management Platform

---

# Project Vision

TaskSkill is a modern SaaS task management platform inspired by Linear, Todoist, ClickUp, and Notion.

The goal is to build a scalable, production-ready application that starts as a web application and later expands into:

- Chrome Extension
- Desktop Application
- Mobile Application

Every architectural decision should prioritize scalability, maintainability, performance, and code quality.

---

# Development Philosophy

Write code as if this application will serve thousands of users.

Prioritize:

- Scalability
- Readability
- Maintainability
- Reusability
- Performance
- Accessibility
- Security

Never take shortcuts that would create technical debt.

---

# Tech Stack

## Framework

- Next.js 15 (App Router)

## Language

- TypeScript

## Styling

- Tailwind CSS v4

## UI Components

- shadcn/ui

## Animations

- Framer Motion

## Forms

- React Hook Form

## Validation

- Zod

## State Management

- Redux Toolkit
- Redux Persist

## Authentication

- Supabase Auth

## Database

- Supabase PostgreSQL

## Storage

- Supabase Storage

## Emails

- Resend

## Icons

- Lucide React

## Themes

- next-themes

## Notifications

- Sonner

## Date Handling

- date-fns
- date-fns-tz

## Image Cropping

- React Easy Crop

## Deployment

- Vercel

---

# Architecture

Use a single Next.js repository.

Never create:

- Express backend
- Separate API repository

Use:

- App Router
- Route Handlers
- Server Actions
- Middleware
- Server Components by default
- Client Components only when required

---

# Folder Structure

```
src/

app/

(auth)/
dashboard/
tasks/
profile/
settings/
api/

components/

features/

auth/
dashboard/
tasks/
profile/
settings/

redux/

hooks/

services/

actions/

lib/

types/

utils/

middleware.ts
```

Organize by feature, not by file type.

---

# UI Design Principles

The application should feel premium.

Inspired by

- Linear
- Vercel Dashboard
- Arc Browser
- Notion

Requirements

- Clean
- Minimal
- Modern
- Responsive
- Accessible
- Smooth animations
- Beautiful spacing
- Rounded corners
- Soft shadows
- Glass effects only where appropriate

---

# Theme

Support

- Light
- Dark
- System

Persist user preference.

Never hardcode colors.

Always use design tokens.

---

# Typography

Use modern typography.

Maintain consistent spacing.

Avoid clutter.

---

# Responsive Design

Support

- Desktop
- Laptop
- Tablet
- Mobile

Design mobile-first.

---

# State Management

Redux is only for

- Authentication
- Theme
- Sidebar
- Current User
- UI State

Never store server data unnecessarily.

Fetch server data using Server Components, Server Actions, or Supabase.

---

# Authentication

Use Supabase Auth.

Support

- Login
- Signup
- Logout
- Forgot Password
- Reset Password
- Email Verification

Future

- Two Factor Authentication
- OAuth
- Magic Links
- Passkeys

---

# Security

Always

Validate inputs

Sanitize user data

Protect routes

Protect API routes

Use middleware

Never trust client-side validation.

---

# Email System

Use Resend.

Email Templates

- Welcome
- Email Verification
- Password Reset
- Invitation
- Due Reminder
- Weekly Summary

Email templates must be reusable.

---

# Task Module

Each task contains

- id
- title
- description
- priority
- status
- dueDate
- createdAt
- updatedAt
- userId

Future

- Labels
- Comments
- Attachments
- Activity
- Mentions

---

# Time

Always store

UTC

Display

User Timezone

Timezone stored in user profile.

Never store local timestamps.

---

# Dashboard

Dashboard should include

- Task Statistics
- Recent Tasks
- Upcoming Tasks
- Productivity Cards
- Quick Add Task

---

# Profile

Support

- Avatar
- Display Name
- Email
- Timezone
- Theme

Future

- Banner
- Social Links
- Bio

---

# Settings

General

Appearance

Security

Timezone

Notifications

Future

API Keys

Connected Accounts

Billing

---

# Chrome Extension (Future)

Must reuse

Authentication

API

Business Logic

Features

Quick Add Task

Save Current Page

Create Task

Browser Notifications

Context Menu

---

# Desktop Application (Future)

Prefer

Tauri

Reuse

React Components

Business Logic

API Layer

---

# Coding Standards

Always

- Use TypeScript
- Strong typing
- No any
- No duplicated code
- Small components
- Reusable hooks
- Reusable utilities
- Reusable UI
- Meaningful variable names

Follow SOLID principles where appropriate.

---

# Naming Convention

Components

PascalCase

Example

TaskCard.tsx

Hooks

camelCase

Example

useTasks.ts

Utilities

camelCase

Example

formatDate.ts

Constants

UPPER_SNAKE_CASE

Redux slices

featureSlice.ts

---

# Component Rules

Each component should have one responsibility.

Avoid giant files.

Split reusable UI.

Prefer composition over inheritance.

---

# Forms

Always use

React Hook Form

+

Zod

Never manually validate forms.

---

# Error Handling

Every feature should include

Loading

Empty State

Error State

Skeleton Loader

Toast Notifications

---

# Accessibility

Every form element must have

Labels

Keyboard support

Focus states

ARIA attributes where necessary.

---

# Performance

Use

Server Components

Lazy Loading

Dynamic Imports

Image Optimization

Memoization only when necessary

Avoid unnecessary re-renders.

---

# Git Workflow

main

↓

develop

↓

feature branches

Naming

feature/auth

feature/dashboard

feature/tasks

feature/profile

feature/security

feature/chrome-extension

Commit format

feat:

fix:

refactor:

docs:

style:

test:

chore:

Examples

feat(auth): implement Supabase login

fix(tasks): resolve task update bug

---

# Definition of Done

A feature is complete only if

✅ TypeScript passes

✅ ESLint passes

✅ Responsive

✅ Accessible

✅ No console errors

✅ No duplicated code

✅ Loading state exists

✅ Error state exists

✅ Empty state exists

✅ Mobile tested

✅ Desktop tested

✅ Reusable

---

# Current Development Roadmap

## Phase 1

- Project Foundation
- Authentication
- Dashboard
- Task CRUD
- Profile
- Theme
- Timezone
- Welcome Email

## Phase 2

- Google reCAPTCHA
- Two Factor Authentication
- QR Codes
- Recovery Codes
- Activity Timeline
- Notifications
- Attachments

## Phase 3

- Chrome Extension
- Save Current Page
- Quick Add Task
- Browser Notifications
- Keyboard Shortcuts

---

# AI Instructions

Whenever generating code:

1. Think before coding.
2. Follow the existing architecture.
3. Never introduce breaking changes unnecessarily.
4. Prefer reusable solutions over quick fixes.
5. Explain major architectural decisions.
6. Keep code production-ready.
7. Do not generate placeholder implementations unless explicitly requested.
8. Verify imports and TypeScript before considering a task complete.
9. If multiple implementation approaches exist, choose the most scalable one and briefly explain why.
10. Maintain consistency with previous code and project conventions.
