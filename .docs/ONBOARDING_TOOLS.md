# CheckIn Contract: Unique Use Cases Research

## Contract Capabilities Analysis

**Core Features:**
- Daily check-in (24h cooldown)
- Streak tracking: `currentStreak`, `longestStreak`, `totalCheckIns`
- 48-hour grace window (miss a day, don't lose streak immediately)
- Multi-token rewards system
- On-chain stats: `firstCheckIn`, `lastCheckIn` timestamps
- Composable: other contracts can read user stats

---

## Unique Use Cases (Brainstorm)

### 1. **Onchain Reputation Layer**
Your streak = your commitment proof. Unlike POAPs (one-time attendance), daily check-in shows *sustained* engagement.

**Applications:**
- DAO governance weight (longer streak = more voting power)
- DeFi trust score (protocols offer better rates to consistent users)
- Job/gig platforms (verifiable work ethic on-chain)

---

### 2. **Anti-Sybil Token Distribution**
Traditional airdrops get farmed. Streak-based distribution rewards real users.

**Mechanism:**
- Projects add their token to rewards pool
- Only users with 30+ day streaks qualify for premium drops
- Impossible to fake sustained engagement

---

### 3. **Multichain Presence Proof**
Check in on Base, Optimism, Celo = prove you're a multichain citizen.

**Value:**
- L2 ecosystem loyalty badge
- Cross-chain identity aggregation
- "Power user" status for early access to new chains

---

### 4. **NFT Tier Unlocks (Streak Milestones)**
Gamify the journey with collectible achievements:

| Streak | NFT Tier | Perks |
|--------|----------|-------|
| 7 days | Bronze | Basic community access |
| 30 days | Silver | Exclusive Discord role |
| 100 days | Gold | Whitelist for launches |
| 365 days | Diamond | Revenue share / governance |

---

### 5. **Learn-to-Earn Integration**
Daily check-in + educational content = habit formation.

**Flow:**
1. User checks in
2. Presented with daily quiz/lesson
3. Correct answers boost rewards
4. Streak tracks learning consistency

---

### 6. **Social Coordination Game**
"Check-in challenges" between communities:

- Which community can maintain highest average streak?
- Competitive leaderboards
- Team streaks (requires X% of members to check in daily)

---

### 7. **DeFi Protocol Integration**

| Protocol Type | Use Case |
|--------------|----------|
| Lending | Lower collateral ratio for 90-day+ streak users |
| DEX | Reduced fees for consistent traders |
| Yield | Priority access to limited vaults |
| Insurance | Lower premiums for engaged users |

---

### 8. **Farcaster Mini-App Specific**

Since this is a Farcaster mini-app, unique social use cases:

- **Cast Boost**: Users with streaks get amplified reach
- **Frame Gates**: Unlock special frames at streak milestones
- **Channel Access**: Exclusive channels for 30+ day streak holders
- **Tip Multiplier**: Higher streak = more reward from tips
- **Social Proof Badge**: Display streak on profile

---

### 9. **Event/Conference Companion**
For multi-day conferences:

- Check in each day of ETH Denver
- Complete all days = exclusive POAP + rewards
- Missed a day? Streak feature handles grace period
- Post-conference: "I was there for 5/5 days" proof

---

### 10. **Creator Economy**

- **Patreon-style**: Check in daily to support creators
- **Unlock content**: Streak gates premium content
- **Revenue share**: Consistent supporters get % of creator earnings

---

## Market Research Insights

### Successful Precedents:
- **Starbucks Odyssey**: Gamified journeys with NFT rewards
- **Station Casinos STN Charms**: 250K+ members, 1.6M NFTs collected
- **Knovus**: Learn-to-earn with daily engagement
- **Tap-to-Earn games**: 100M+ users on TON

### POAP Learnings:
- POAPs prove attendance but not **sustained** engagement
- Check-in contract fills the "proof of consistency" gap
- Can complement POAPs (POAP for event, streak for community)

---

## Summary

The CheckIn contract is more than a "daily reward" mechanic—it's a **proof of sustained engagement** primitive that can:

1. Build verifiable on-chain reputation
2. Enable fair, anti-sybil token distribution
3. Create composable engagement data for DeFi/social protocols
4. Gamify onboarding to blockchain
5. Coordinate communities around shared commitment

The **unique value proposition**: Anyone can prove they attended something (POAP). Very few can prove they showed up *every day*.

---

## Selected Direction: ONBOARDING TOOL

### Vision: "Hello Onchain" = Your First Week on Base

**Problem**: New crypto users are intimidated by transactions. They create wallets but never use them.

**Solution**: Hello Onchain gamifies the first 7 days of blockchain interaction.

### User Journey

```
Day 1: First Transaction Ever
├── Check in → "You just made your first on-chain transaction!"
├── Reward: Small token amount
└── Learn: What is a transaction? What is gas?

Day 2: Understanding Wallets
├── Check in → Streak begins!
├── Reward: Slightly more tokens
└── Learn: Your wallet is your identity

Day 3: Multi-Chain Basics
├── Check in on 2nd chain (e.g., Optimism)
├── Reward: Tokens on both chains
└── Learn: What are L2s? Why multiple chains?

Day 4-6: Building Habits
├── Continue streaks
├── Increasing rewards
└── Unlock: Badge at Day 5

Day 7: Graduation
├── Complete first week
├── Reward: "Hello Onchain Graduate" NFT
└── CTA: Links to explore Base ecosystem dApps
```

### Onboarding Features to Build

| Feature | Purpose |
|---------|---------|
| **Progress Bar** | Show 1/7, 2/7... progress to graduation |
| **Daily Tips** | Educational content on each check-in |
| **Streak Celebration** | Confetti/animation on milestone days |
| **Graduate NFT** | Proof of completing onboarding |
| **Ecosystem Links** | After Day 7, suggest next dApps to try |

### Key Metrics to Track

- Day 1 → Day 7 retention rate
- Users who try other dApps after graduation
- Streak distribution (how many reach 7, 30, 100 days)
- Cross-chain adoption rate

### Partnerships

- **Base**: Official onboarding tool recommendation
- **Coinbase Wallet**: Integration for new users
- **Farcaster**: Frames for social sharing progress

### Revenue Model (Optional)

1. Projects pay to be in "Ecosystem Links" (post-graduation suggestions)
2. Projects add tokens to reward pool for exposure to engaged users
3. Premium badges/NFTs for purchase

---

## Next Steps

1. Add progress indicator UI (Day X of 7)
2. Design "Graduate NFT" artwork
3. Create daily educational tips content
4. Build celebration animations for milestones
5. Add ecosystem dApp links for post-graduation

---

## DEEP DIVE: User Journey Flow

### Pre-Journey: First Visit (Not Connected)

**Screen State:**
```
┌─────────────────────────────────────┐
│                                     │
│     👋 Hello Onchain                │
│                                     │
│   Your first week on Base           │
│   starts now.                       │
│                                     │
│   ┌─────────────────────────────┐   │
│   │     Connect Wallet          │   │
│   └─────────────────────────────┘   │
│                                     │
│   "7 days. 7 lessons. Free tokens." │
│                                     │
└─────────────────────────────────────┘
```

**Micro-copy:**
- Headline: "Hello Onchain"
- Subhead: "Your first week on Base starts now."
- CTA: "Connect Wallet"
- Footer: "7 days. 7 lessons. Free tokens."

---

### Day 0 → Day 1: The First Check-In

**User Action:** Connected wallet, first check-in

**UI State:**
```
┌─────────────────────────────────────┐
│  Day 1 of 7          ○○○○○○○       │
├─────────────────────────────────────┤
│                                     │
│  🎉 Welcome to the blockchain!      │
│                                     │
│  You just sent your first           │
│  transaction on Base.               │
│                                     │
│  ┌─────────────────────────────┐   │
│   │  +10 HELLO tokens          │   │
│  └─────────────────────────────┘   │
│                                     │
│  💡 Did you know?                   │
│  "Every action on blockchain        │
│   is a transaction - even           │
│   this check-in."                   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Come back tomorrow →       │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Animation:** Confetti burst on first check-in
**Sound:** Optional success chime
**Toast:** "Welcome to Base! 🔵"

---

### Day 2: Building the Streak

**Pre-check-in state:**
```
┌─────────────────────────────────────┐
│  Day 2 of 7          ●○○○○○○       │
├─────────────────────────────────────┤
│                                     │
│  👋 Welcome back!                   │
│                                     │
│  Ready for Day 2?                   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      CHECK IN               │   │
│  └─────────────────────────────┘   │
│                                     │
│  🔥 1 day streak                    │
│                                     │
└─────────────────────────────────────┘
```

**Post-check-in:**
```
│  🔥 2 day streak!                   │
│                                     │
│  💡 Today's lesson:                 │
│  "Your wallet address is like       │
│   your email - but for money.       │
│   It's yours forever."              │
│                                     │
│  +12 HELLO tokens                   │
```

**Note:** Rewards increase slightly each day (10 → 12 → 15...)

---

### Day 3: Multichain Introduction

**UI Change:** Show second chain option

```
┌─────────────────────────────────────┐
│  Day 3 of 7          ●●○○○○○       │
├─────────────────────────────────────┤
│                                     │
│  🌐 NEW: Try Another Chain!         │
│                                     │
│  Base                    ✅ Done    │
│  ┌─────────────────────────────┐   │
│  │      03:42:15              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Optimism                 🆕 New    │
│  ┌─────────────────────────────┐   │
│  │      CHECK IN              │   │
│  └─────────────────────────────┘   │
│                                     │
│  💡 "Base and Optimism are both     │
│   'Layer 2s' - faster, cheaper      │
│   versions of Ethereum."            │
│                                     │
└─────────────────────────────────────┘
```

**Milestone:** First multichain action
**Badge unlock:** "Multichain Explorer" 🌐

---

### Day 4-5: Habit Building

**UI Focus:** Emphasize streak, minimize friction

```
┌─────────────────────────────────────┐
│  Day 5 of 7          ●●●●○○○       │
├─────────────────────────────────────┤
│                                     │
│  🔥 4 day streak                    │
│                                     │
│  You're halfway there!              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      CHECK IN               │   │
│  └─────────────────────────────┘   │
│                                     │
│  💡 "Consistency > perfection.      │
│   You're building an onchain        │
│   reputation."                      │
│                                     │
└─────────────────────────────────────┘
```

**Day 5 Special:**
- Halfway celebration animation
- Bonus tokens
- Preview of Day 7 reward

---

### Day 6: Anticipation Building

```
┌─────────────────────────────────────┐
│  Day 6 of 7          ●●●●●○○       │
├─────────────────────────────────────┤
│                                     │
│  🎁 Tomorrow: Graduation Day!       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      CHECK IN               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Preview your reward:               │
│  ┌─────────────────────────────┐   │
│  │  🏆 HELLO ONCHAIN           │   │
│  │     GRADUATE NFT            │   │
│  │     [Silhouette/Blur]       │   │
│  └─────────────────────────────┘   │
│                                     │
│  One more day to claim it!          │
│                                     │
└─────────────────────────────────────┘
```

**Psychology:** Show the reward but blur it - creates anticipation

---

### Day 7: GRADUATION 🎓

**Pre-check-in:**
```
┌─────────────────────────────────────┐
│  Day 7 of 7          ●●●●●●○       │
├─────────────────────────────────────┤
│                                     │
│  🎓 GRADUATION DAY                  │
│                                     │
│  This is it. One final check-in.    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      GRADUATE 🎓            │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Post-check-in (Full celebration):**
```
┌─────────────────────────────────────┐
│                                     │
│  🎉🎊🎓🎉🎊                         │
│                                     │
│  CONGRATULATIONS!                   │
│                                     │
│  You are now officially             │
│  ONCHAIN                            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🏆 HELLO ONCHAIN           │   │
│  │     GRADUATE                │   │
│  │     [NFT Image]             │   │
│  │     #0042                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  7 days ✓                           │
│  100+ HELLO tokens ✓                │
│  1 NFT ✓                            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Share on Farcaster 📣      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Explore Base Ecosystem →   │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Animations:**
- Full-screen confetti explosion
- NFT reveal animation (flip/unveil)
- Counter animation for tokens earned
- Badge collection animation

---

### Post-Graduation: The Alumni

**UI Change:** Progress bar becomes "GRADUATE" badge

```
┌─────────────────────────────────────┐
│  🎓 GRADUATE         🔥 42 days    │
├─────────────────────────────────────┤
│                                     │
│  Welcome back, graduate!            │
│                                     │
│  Keep your streak alive to          │
│  unlock more rewards.               │
│                                     │
│  [Chain cards as normal]            │
│                                     │
│  ───────────────────────────────    │
│                                     │
│  🌐 EXPLORE BASE ECOSYSTEM          │
│                                     │
│  [Aerodrome] [Uniswap] [Aave]      │
│  [Friend.tech] [Zora] [More...]    │
│                                     │
└─────────────────────────────────────┘
```

---

### Edge Cases

**Missed Day (Within 48h window):**
```
│  ⚠️ Close call!                     │
│  You almost lost your streak.       │
│  Check in now to continue!          │
```

**Missed Day (Streak lost):**
```
│  💔 Streak lost                     │
│  But don't worry - every day        │
│  is a fresh start.                  │
│                                     │
│  New streak: Day 1                  │
```

**Returning Graduate (Day 50+):**
```
│  🏆 VETERAN                         │
│  🔥 50 day streak!                  │
│                                     │
│  You're in the top 5% of            │
│  Hello Onchain users.               │
```

---

### Micro-Interaction Details

| Moment | Animation | Duration |
|--------|-----------|----------|
| First check-in | Confetti burst | 2s |
| Streak increase | Fire icon pulse | 0.5s |
| Day 5 halfway | Fireworks | 1.5s |
| Day 7 graduation | Full celebration | 3s |
| NFT reveal | Card flip | 1s |
| New chain unlock | Slide in | 0.3s |

### Copy Tone

- **Encouraging, not pushy**: "Welcome back!" not "Don't miss your streak!"
- **Educational, not patronizing**: "Did you know?" not "Let me teach you"
- **Celebratory, not transactional**: "You did it!" not "Transaction complete"
- **Inclusive**: "Your first week" not "Beginner mode"
