# SEDS LUNAR CLOCK — IMMERSIVE HACKATHON TIMER

> **ONE REVOLUTION. ONE DAY. ONE MISSION.**  
> An authoritative, photorealistic 3D space mission hackathon countdown experience designed for SEDS REC.

[![Deploy SEDS Lunar Clock to GitHub Pages](https://github.com/venkatengineer/timer/actions/workflows/deploy.yml/badge.svg)](https://github.com/venkatengineer/timer/actions/workflows/deploy.yml)
**Live Webpage**: [https://venkatengineer.github.io/timer/](https://venkatengineer.github.io/timer/)

---

## 🛰️ Security Clearance & Access Credentials

To access the mission operations center:
- **Callsign / Username**: `sedsrec`
- **Security Passphrase**: `sedssdes`
- *(Or click the `AUTOFILL CREDENTIALS` button on the terminal)*

---

## 🌍 Core Concept: The Lunar Clock

The central metaphor connects the orbital revolution of the Moon to the 24-hour event duration:
- **Earth**: The world hosting the hackathon at `[0, 0, 0]`.
- **The Moon**: Accurately tracks along an inclined ($23.5^\circ$) orbital path.
- **One Revolution**: Exactly 24 hours of event time ($360^\circ$).
- **Orbital Trail**: A luminous lavender arc reveals the completed section of the orbit.
- **Milestones**: 4 quadrant checkpoints at 00H (Launch), 06H (Q1), 12H (Midpoint), and 18H (Q3).
- **Authoritative Synchronization**: Orbital angle, completed trail percentage, phase progression, and remaining countdown are strictly derived from high-resolution timestamps.

---

## 🚀 Cinematic 5-Act Launch Sequence

1. **ACT I — THE VOID**: Begins in near-total darkness; camera slowly approaches Earth crescent; minimal typography.
2. **ACT II — PLANETARY REVEAL**: Natural sunlight sweeps across the horizon, revealing the day/night terminator and the Moon in the distance.
3. **ACT III — LAUNCH**: Dedicated tracking shot of the rocket on launchpad; terminal countdown `T−05` to `T−01`; engine ignition with dynamic particle plume; accelerating ascent with gravity turn.
4. **ACT IV — ORBITAL INSERTION**: Rocket glides into space; camera pulls back into wide panoramic composition; orbital path and milestone nodes illuminate.
5. **ACT V — MISSION CLOCK**: Countdown numbers fade into place (`24:00:00`); authoritative countdown starts.

---

## 🛠️ Technology Stack

- **React 19 & TypeScript**: Strongly typed component architecture.
- **Three.js & React Three Fiber (@react-three/drei)**: Photorealistic 3D planetary rendering with custom Rayleigh atmospheric scattering, day/night terminators, and specular glints.
- **GSAP (GreenSock)**: Orchestration for the 15-second multi-act launch sequence.
- **Tailwind CSS v4**: Minimalist, responsive mission-control HUD styling.
- **Lucide React**: Clean telemetry icons.
- **Web Audio API**: Procedural sound effects and telemetry chimes.

---

## ⌨️ Operator Keyboard Shortcuts

- `O`: Open / Close Organizer Mission Controls
- `M`: Toggle Audio Mute / Unmute
- `Space`: Quick Toggle Pause / Resume
- `F`: Toggle Fullscreen Mode

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/venkatengineer/timer.git
cd timer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
