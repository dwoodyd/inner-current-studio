## Phase 4 Build Plan

### 1. Enable Lovable Cloud
- Provision backend for AI companion edge function

### 2. Current Guide AI Companion
- Edge function calling Lovable AI with emotional context system prompt
- `CurrentGuide.tsx` page with streaming chat UI
- Sends recent check-in states + current mood as context
- Markdown rendering of responses

### 3. Pattern Mirror
- `PatternMirror.tsx` page showing visual patterns from user data
- State frequency chart, weekly rhythm visualization
- Trend detection from check-in history

### 4. Design Polish (Both animations + visual)
- **Page transitions**: Framer Motion `AnimatePresence` wrapper in AppShell
- **Current Pulse orb**: Enhanced with layered gradients, particle effects, more responsive breathing
- **Card depth**: Glass morphism effect on soul-cards, refined shadows
- **Typography**: Better heading hierarchy, letter-spacing refinements
- **Bottom nav**: Active state glow, smoother transitions
- **Micro-interactions**: Button press feedback, check-in state selection haptics
- **Color refinements**: Richer gradients, better dark mode depth
- **Empty states**: More inviting illustrations/copy

### 5. Route & Navigation Updates
- Add Current Guide and Pattern Mirror to Profile tab
- Update App.tsx routing
