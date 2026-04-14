# TTFinder — Project Definition

## Overview
TTFinder is a web/mobile app that helps TTRPG (tabletop RPG) players and game masters find each other. Users register and indicate whether they are **Looking for Table (LFT)** or **Looking for Players (LFP)**. One account can hold both roles simultaneously, and a GM can manage multiple LFP table listings.

## Core Roles

### Looking for Table (LFT) — Player seeking a group
- TTRPG system(s) they want to play
- Availability (days, times, frequency)
- Display name: first name or initials (user's choice)
- Profile photo — uploaded for identification only, **not shown publicly** until they join a table

### Looking for Players (LFP) — GM/group seeking players
- TTRPG system(s) played at the table
- When the group meets (day of week, frequency, time)
- Safety tools in use at the table — **free text field**
- Meeting location type (game store, private home, park, etc.) — **no specific address shown until after vetting**
- Profile photo of the GM — shown to matched players for in-person identification
- A single user account can manage **multiple LFP table listings**

## Location & Discovery
- Uses device location (with permission) to find nearby groups/players
- Search radius granularity: same town → city → county → state (scales for rural users)
- Only expose town name or distance ("within 10 miles") — **never expose coordinates or precise address**

## Match & Connection Flow
1. **Discovery** — User browses listings; no personal info exposed
2. **Initiation** — Either party can initiate:
   - Player sends a **Join Request** to a table listing
   - GM sends an **Invite** to a player's LFT listing — only if that player has LFT set to **public**
   - Players can set LFT to **private** (hidden from discovery, but still usable for direct connections with a known GM)
   - Private LFT generates a **QR code** the player shares directly with a GM; scanning it sends the GM an invite prompt
3. **Mutual Acceptance** — The other party accepts; both must confirm before anything unlocks
4. **Chat** — In-app chat unlocks once both sides have accepted; privacy still protected (no location or photo yet)
5. **Agree to Meet** — Both parties explicitly confirm intent to meet in-app
6. **Reveal** — Specific meeting location and profile photos become visible to each other for in-person identification

## Social Features
- **Favorite** — Save a listing or user to revisit later
- **Block** — Prevent a user from seeing you or contacting you; removes existing matches
- **Report** — Flag a user for inappropriate behavior, content, or photos; goes to moderation queue

## Reputation & Review System
- Reviews only allowed after a **completed connection** (both parties confirmed meeting)
- **One review per connection** — cannot review the same person twice for the same match
- **Cooldown period** before a review can be submitted (prevents heat-of-the-moment retaliation)
- Reviews can be flagged by the reviewed party as **retaliatory**; goes to moderation queue
- **Negative threshold** — Too many negative marks triggers a moderation review of that user
- **Positive threshold** — Enough positive marks highlights/boosts the user's listing(s)
- Review format: **combination of star rating (1–5) + written text** (exact weight/threshold values TBD)

## Moderation & Safety
- Uploaded photos pass automated moderation (e.g., AI content check for explicit material)
- **Human moderation queue** for reported users, reported photos, and flagged reviews
- **Ban system** — Moderators can ban users for infractions (temporary or permanent)
- Banned users cannot create new accounts (device/email fingerprinting TBD)
- No identifying information (full name, address, exact location) exposed publicly
- Specific meeting location only revealed after both parties confirm intent to meet

## Key Constraints & Principles
- Safety-first design: protect user identity until trust is established at each layer
- Mobile-first, but full web support
- Scalable location search (works for dense cities and sparse rural areas)
- One account, multiple roles (player + GM), multiple table listings

## Authentication
- Email/password registration
- Social login supported (Google, etc.) — **social network identity and data never exposed publicly**
- All auth methods resolve to the same internal user account type

## Platform & Tech Direction
- **Web-first**, fully responsive/mobile-friendly (works well on phones without a native app)
- Single codebase; can be wrapped for app stores later (PWA or Capacitor)

## Tech Stack
| Layer | Choice | Notes |
|---|---|---|
| Frontend + Backend | Next.js (React + TypeScript) | Full-stack, deployed to Vercel free tier |
| Styling | Tailwind CSS | Responsive-first |
| Database | MySQL (Bluehost) — `dvqeyxmy_ttfinder` | Managed via phpMyAdmin; SQL files generated and pasted in |
| Auth | Auth.js (NextAuth) | Email/password + social login |
| File storage | Cloudinary | Free tier; photo upload + moderation hooks |
| Photo moderation | Google Vision SafeSearch | 1,000 free checks/month |
| Real-time chat | Pusher | Free tier (200 connections, 200k messages/day); works with Vercel serverless |
| Email | Resend or Brevo | Verification + password reset; free tier |
| QR codes | `qrcode` npm library | No external service needed |
| Hosting | Bluehost (app + DB) or Vercel (app) + Bluehost (DB) | TBD — Bluehost supports Node.js via cPanel |

## Moderation at Launch
- Single moderator (site owner) to start
- Moderation dashboard must be simple and manageable for one person
- Architecture should support adding more moderators later without a redesign

## Ban & Abuse Policy
- **Phase 1 (launch):** Account-level bans only — cancel/disable the individual account
- **Phase 2 (future):** Escalate to device/email fingerprinting if ban evasion becomes a problem

## Monetization
- **Launch:** Donation-based (e.g., Ko-fi, Patreon link, or in-app donate button)
- **Future:** Monetization planned but model TBD — design data model to accommodate future paid features without requiring a rewrite
- No ads, no selling user data

---

## Decisions Log
| Date | Decision | Notes |
|------|----------|-------|
| 2026-04-14 | Project defined | Initial scope set by client |
| 2026-04-14 | Vetting = structured mutual acceptance → chat → agree to meet | Location revealed at final step |
| 2026-04-14 | Human moderation queue + ban system required | In addition to automated photo checks |
| 2026-04-14 | One account supports both LFT and LFP roles; multiple LFP tables allowed | |
| 2026-04-14 | Location display: town name or distance only | No coordinates or precise address ever exposed |
| 2026-04-14 | Safety tools field is free text | |
| 2026-04-14 | Review/reputation system with moderation thresholds | Negative = flag for review; Positive = boost listing |
| 2026-04-14 | Block and favorite features included | |
| 2026-04-14 | Match initiation is bidirectional | Player can request to join; GM can invite player with public LFT only |
| 2026-04-14 | LFT private mode uses a QR code | Player shares QR with GM; scanning triggers invite prompt |
| 2026-04-14 | Platform: web-first, responsive/mobile-friendly | Single codebase; app store wrapping deferred |
| 2026-04-14 | Tech stack finalized | Next.js + Tailwind + MySQL (Bluehost) + Vercel + Pusher + Cloudinary |
| 2026-04-14 | DB managed via phpMyAdmin | SQL schema files generated, pasted in by user |
| 2026-04-14 | Review safeguards: post-connection only, one per connection, cooldown, retaliatory flag | Star rating (1–5) + written text |
| 2026-04-14 | Auth: email/password + social login; social data never exposed publicly | |
| 2026-04-14 | Moderation: single moderator (owner) at launch; scalable architecture | |
| 2026-04-14 | Ban policy: account-level only at launch; fingerprinting deferred | |
| 2026-04-14 | Monetization: donations at launch; future paid features TBD; no ads, no data selling | |

---

## Open Questions
- Review threshold values — how many negatives trigger moderation review? How many positives trigger listing boost?
- Future monetization model (premium listings, supporter badge, etc.)?
