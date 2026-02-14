# ⚽ SocialFootball.ai v2.0

**Premium Social Football Platform with Gamification & Real-time Data**

Live at: [https://www.socialfootball.ai/](https://www.socialfootball.ai/)

---

## 🎯 Overview

SocialFootball.ai is a premium web application that combines real-time football data with social engagement features, gamification, and community-driven content creation. The platform offers fans an immersive experience with GPS-verified stadium check-ins, tactical analysis tools, and weighted voting systems.

---

## ✨ Key Features

### 🏆 Gamification System
- **Points & Scoring**: Earn points through various activities
- **Achievements**: Unlock badges and rewards
- **Leaderboards**: Compete with other football fans
- **Progression System**: Level up based on engagement

### 📍 GPS Stadium Verification
- **Location Check-in**: Verify attendance at live matches
- **Bonus Points**: Earn extra points for stadium presence
- **Real-time Validation**: GPS-based verification system
- **Stadium Database**: Comprehensive venue information

### ⚽ Live Match Tracking
- **Real-time Scores**: Live updates during matches
- **Match Statistics**: Detailed stats and analytics
- **Multiple Leagues**: Support for various football leagues
- **Status Indicators**: Live, upcoming, and finished matches

### 🎮 Tactical Formation Selector
- **Visual Formation Builder**: Interactive 11-player formation editor
- **Tactical Analysis**: Compare formations and strategies
- **Team Positioning**: Drag-and-drop player placement
- **Formation Library**: Pre-configured tactical setups

### 🎬 Media Creation Tools
- **Video Generator**: Create match highlight videos
- **Meme Creator**: Generate shareable football memes
- **Social Sharing**: Export to social media platforms
- **Template Library**: Pre-designed media templates

### 📊 Player Comparison Tool
- **Side-by-side Stats**: Compare two players directly
- **Performance Metrics**: Goals, assists, ratings
- **Visual Charts**: Graphical stat comparisons
- **Historical Data**: Season and career statistics

### 🗳️ Premium Voting System
- **Weighted Votes**: Premium users get enhanced voting power
- **Match Predictions**: Predict scores and outcomes
- **Community Polls**: Vote on football topics
- **Contest Participation**: Enter competitions and challenges

### 🏅 Squad & Roster Display
- **Team Lineups**: View current squad lists
- **Player Profiles**: Detailed player information
- **Position Grouping**: Organized by player positions
- **Real-time Updates**: Synced with live data

### 📰 Professional Ticker
- **Scrolling Results**: Recent match results display
- **Multiple Leagues**: Aggregate data from various competitions
- **Live Updates**: Real-time score updates
- **Match Highlights**: Key events ticker

---

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern component-based UI
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Lucide React**: Icon library

### Backend & Database
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Row Level Security**: Protected data access
- **Edge Functions**: Serverless API endpoints
  - `sync-teams`: Team data synchronization
  - `sync-fixtures`: Fixture data updates
  - `sync-standings`: League table updates

### Deployment
- **Vercel**: Production hosting
- **GitHub Actions**: CI/CD pipeline
- **Environment Variables**: Secure configuration

---

## 📦 Project Structure

```
socialfootball-v5/
├── src/
│   ├── components/          # React components
│   │   ├── LiveMatchModule.tsx
│   │   ├── SquadModule.tsx
│   │   ├── ProfessionalTicker.tsx
│   │   ├── StadiumVoteModule.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   └── ErrorState.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useFixtures.ts
│   │   ├── useLiveMatch.ts
│   │   ├── usePlayers.ts
│   │   ├── useStandings.ts
│   │   ├── useTeams.ts
│   │   └── usePolls.ts
│   ├── lib/                 # Utilities and config
│   │   └── supabase.ts      # Supabase client
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── supabase/
│   └── functions/           # Edge functions
│       ├── sync-teams/
│       ├── sync-fixtures/
│       └── sync-standings/
├── public/                  # Static assets
├── dist/                    # Production build
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/100Fernando100/Socialfutbolv2.git
cd Socialfutbolv2
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

---

## 🗄️ Database Schema

### Tables

**teams**
- `id`: Primary key
- `name`: Team name
- `logo`: Team logo URL
- `api_sports_id`: External API reference

**fixtures**
- `id`: Primary key
- `home_team_id`: Home team reference
- `away_team_id`: Away team reference
- `home_team_name`: Denormalized home team name
- `away_team_name`: Denormalized away team name
- `home_team_logo`: Denormalized home team logo
- `away_team_logo`: Denormalized away team logo
- `fixture_date`: Match date and time
- `status_short`: Match status code
- `status_long`: Match status description
- `home_goals`: Home team score
- `away_goals`: Away team score
- `league_id`: League reference
- `venue_name`: Stadium name

**standings**
- `id`: Primary key
- `team_id`: Team reference
- `league_id`: League reference
- `rank`: League position
- `points`: Total points
- `played`: Matches played
- `won`: Matches won
- `drawn`: Matches drawn
- `lost`: Matches lost
- `goals_for`: Goals scored
- `goals_against`: Goals conceded
- `goal_difference`: Goal difference

**players**
- `id`: Primary key
- `name`: Player name
- `team_id`: Team reference
- `position`: Player position
- `number`: Jersey number
- `photo`: Player photo URL
- `api_sports_id`: External API reference

---

## 🔒 Security

- Row Level Security (RLS) policies enabled
- Public read-only access for data tables
- Environment variables for sensitive credentials
- HTTPS encryption via Vercel
- Secure Supabase client configuration

---

## 📝 Deployment

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy main branch to production
4. Automatic deployments on push to main

---

## 🌿 Branching Strategy

- `main`: Production-ready code (v2.0-stable)
- `v2-production`: Backup of v2 production code
- `feature/supabase-integration`: Experimental Supabase integration (v0.1-supabase-experiment)

---

## 📊 Version History

### v2.0-stable (Current Production)
- Complete gamification system
- GPS stadium verification
- Tactical formation selector
- Media creation tools (video, memes)
- Player comparison tool
- Premium weighted voting
- Live match tracking
- Squad/roster display
- Professional results ticker

### v0.1-supabase-experiment (Experimental Branch)
- Supabase real-time data integration
- Custom React hooks for data fetching
- No mock data fallbacks
- Loading states and error handling
- Direct database queries (no JOINs)

---

## 🤝 Contributing

This is a private production application. For feature requests or bug reports, please contact the development team.

---

## 📄 License

Copyright © 2026 SocialFootball.ai. All rights reserved.

---

## 🔗 Links

- **Production**: [https://www.socialfootball.ai/](https://www.socialfootball.ai/)
- **GitHub**: [https://github.com/100Fernando100/Socialfutbolv2](https://github.com/100Fernando100/Socialfutbolv2)
- **Supabase Dashboard**: [https://app.supabase.com/](https://app.supabase.com/)
- **Vercel Dashboard**: [https://vercel.com/dashboard](https://vercel.com/dashboard)

---

## 👨‍💻 Development Team

Developed with ⚡ by the SocialFootball.ai team

**Tech Stack Credits:**
- React, Vite, TypeScript, Tailwind CSS
- Supabase, Vercel
- API-Football for data synchronization
