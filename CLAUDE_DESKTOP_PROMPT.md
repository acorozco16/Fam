# Claude Desktop - FamApp Project Manager Prompt

## Context
I'm building FamApp, a comprehensive family travel planning application. I have a working MVP with:
- Complete trip planning wizard (destination, dates, family members, activities)
- Smart packing lists based on trip details
- Trip readiness tracking with customizable items
- Family profiles with health/dietary information
- Accommodations supporting multiple types (hotels, rentals, family stays)
- Activity management with booking status

The app is currently a 5000+ line React component using localStorage. I'm working 24/7 on this project with my engineering partner (Claude Code) and need an aggressive 1-month roadmap to get to live web + mobile apps.

## Your Task
Create a detailed project structure in my Notion Projects database with the following sprint breakdown:

### Week 1: Deploy & Architecture (Days 1-7)
**Project Name:** FamApp Week 1 - Deploy & Architecture
**Priority:** High
**Status:** Not started

Create detailed tasks for:
1. **Immediate Deploy (Day 1-2)**
   - Deploy current version to Vercel/Netlify
   - Set up basic analytics (Mixpanel/PostHog)
   - Create simple landing page
   - Get 5 beta users signed up

2. **Component Architecture (Day 3-5)**
   - Break App.tsx into logical components
   - Create component hierarchy plan
   - Set up proper file structure
   - Implement React Context for state

3. **Mobile Responsive (Day 6-7)**
   - Fix all mobile breakpoints
   - Test on real devices
   - Optimize touch interactions
   - PWA setup for app-like experience

### Week 2: Core Infrastructure (Days 8-14)
**Project Name:** FamApp Week 2 - Core Infrastructure
**Priority:** High
**Status:** Not started

Create tasks for:
1. **Authentication System (Day 8-10)**
   - Implement Supabase/Firebase auth
   - User registration flow
   - Secure session management
   - Social login (Google/Apple)

2. **Database Migration (Day 11-13)**
   - Design PostgreSQL schema
   - Migrate from localStorage to database
   - API endpoints for CRUD operations
   - Real-time sync setup

3. **State Management (Day 14)**
   - Implement Zustand/Redux
   - Optimize re-renders
   - Add offline support
   - Data persistence layer

### Week 3: Features & Polish (Days 15-21)
**Project Name:** FamApp Week 3 - Features & Polish
**Priority:** High
**Status:** Not started

Create tasks for:
1. **Family Collaboration (Day 15-17)**
   - Trip sharing functionality
   - Real-time collaborative editing
   - Permission system
   - Invite flow

2. **Mobile App (Day 18-20)**
   - React Native setup
   - Core screens implementation
   - Push notifications
   - App store prep

3. **Polish & UX (Day 21)**
   - Loading states
   - Error handling
   - Animations
   - Onboarding flow

### Week 4: Launch Prep (Days 22-30)
**Project Name:** FamApp Week 4 - Launch Prep
**Priority:** High
**Status:** Not started

Create tasks for:
1. **Beta Testing (Day 22-24)**
   - Recruit 20 beta families
   - Bug tracking system
   - Feedback collection
   - Critical fixes

2. **Marketing & Analytics (Day 25-27)**
   - Product Hunt launch prep
   - Social media presence
   - SEO optimization
   - Conversion tracking

3. **Launch (Day 28-30)**
   - Production deployment
   - Monitoring setup
   - Support system
   - First user onboarding

## For Each Task, Include:
- Specific deliverables
- Success metrics
- Dependencies
- Technical requirements
- Time estimates (in hours, assuming 16-hour work days)

## Additional Projects to Create:

1. **Technical Debt Tracker** - Ongoing list of refactoring needs
2. **User Feedback Pipeline** - System for collecting/prioritizing feedback
3. **Feature Backlog** - Future features based on user requests
4. **Bug Tracker** - Critical issues that need immediate attention

## Integration Notes:
- Each task should be actionable for Claude Code (the engineering partner)
- Include specific file paths and component names where relevant
- Add GitHub issue numbers once created
- Link related tasks across projects

## Communication Protocol:
Set up a daily standup structure where:
- Morning: Review progress, prioritize day's work
- Midday: Quick sync on blockers
- Evening: Deploy updates, plan next day

Create a "Daily Standups" database in Notion to track these.

## Success Metrics for Month 1:
- 100+ active beta users
- < 3 second load time
- 95% mobile responsive
- 50+ trips created
- 4.5+ star average feedback
- Live on web + app stores submitted

Please create this entire structure in my Notion workspace, making it actionable and specific enough that my engineering partner can execute without ambiguity.