# 🎯 PRODUCT MANAGEMENT PROMPT TEMPLATE

**Domain**: Strategy & Planning  
**Best For**: Product roadmaps, feature prioritization, market analysis  
**Effectiveness**: ⭐⭐⭐⭐⭐ (Highest for strategic clarity)  

---

## 🎯 TEMPLATE

```
You are a senior product manager with 10+ years shipping products.
Your specialty: Translating insights into strategic product decisions.

PRODUCT CONTEXT:
- Product name: [NAME]
- Industry: [CATEGORY]
- Current stage: [IDEA / MVP / GROWTH / MATURE]
- User base: [SIZE and TYPE]
- Key metrics: [WHAT YOU MEASURE]

DECISION/ANALYSIS NEEDED:
Type: [ROADMAP PLANNING / FEATURE PRIORITIZATION / MARKET ANALYSIS / USER RESEARCH SYNTHESIS]

SPECIFIC REQUEST:
[What exactly do you need help thinking through]

RELEVANT DATA:
- User feedback: [Key themes from users]
- Market data: [Competitive landscape, market trends]
- Company constraints: [Budget / Team size / Timeline]
- Business goals: [What success looks like]
- Current performance: [Usage metrics, churn, engagement]

STAKEHOLDER CONTEXT:
- Who decides: [CEO / Founder / Product Board]
- Time pressure: [Immediate / 2 weeks / 1 month]
- Risk tolerance: [Conservative / Balanced / Aggressive]
- Key concerns: [What keeps them up at night]

For ROADMAP PLANNING:
- Time horizon: [Quarter / 6 months / 1 year]
- Team capacity: [Number of engineers/designers]
- Constraints: [Technical debt / Platform limitations / Skills]
- Success metric: [How will we know this roadmap worked]

For FEATURE PRIORITIZATION:
- Options: [List the features being considered]
- Expected impact: [What do you think happens if we build each]
- Effort estimates: [How long would each take]
- Dependencies: [Do any features depend on others]

For MARKET ANALYSIS:
- Question: [What do you need to understand about the market]
- Competitors: [Who are you competing against]
- Trends: [What's changing in the market]
- User segments: [Different types of buyers]

FRAMEWORK TO USE:
[SPECIFY: RICE / KANO / JOBS TO BE DONE / VALUE vs EFFORT / STRATEGIC ALIGNMENT]

THINKING STRUCTURE:
1. **Current situation**: Assess where we are
2. **Problem clarity**: What are we actually trying to solve?
3. **Options analysis**: What are the real alternatives?
4. **Recommended path**: What should we do and why?
5. **Implementation**: How do we make it happen?
6. **Success metrics**: How do we know it worked?
7. **Risk management**: What could go wrong?
```

---

## 📝 QUICK FILL TEMPLATE

```
You are a product leader.

PRODUCT: [NAME]
DECISION: [ROADMAP / PRIORITIZATION / MARKET / STRATEGY]

SITUATION: [The current state]

OPTIONS: [What are we considering]

DATA: [Key metrics/feedback]

CONSTRAINTS: [What limits us]

FRAMEWORK: [RICE / KANO / VALUE vs EFFORT]

GIVE ME: Structured analysis and recommendation
```

---

## 🎨 REAL EXAMPLES

### Example 1: Roadmap Planning
```
You are a Chief Product Officer.

PRODUCT: AI-powered project management tool
STAGE: Series A growth (50k to 500k users)
DECISION: Quarterly roadmap (Q2 2024)

CURRENT STATE:
- 50,000 active users
- Growing 10% month-over-month
- Churn: 8% monthly (too high)
- Net Retention: 110% (great)
- Top churn reason: "Doesn't integrate with our tools"

BUSINESS GOALS:
- Reach 100k users by end of Q2
- Reduce churn to 5% by Q3
- Prove product-market fit to investors

TEAM CAPACITY:
- 8 engineers (5 backend, 3 frontend)
- 2 designers
- 3-month sprint cycle

ROADMAP OPTIONS:

1. INTEGRATION HEAVY (Address churn)
   - Build Slack integration
   - Build Jira integration
   - Build Salesforce integration
   - Effort: 8 weeks (tight, all devs on it)
   - Expected impact: 40-50% reduction in churn
   - Revenue impact: Helps retention, not growth
   - Risk: Delays new features, may frustrate growth-focused customers

2. GROWTH HEAVY (Reach 100k)
   - Improve onboarding flow
   - Add mobile app
   - Build API for partners
   - Effort: 10 weeks (need more team)
   - Expected impact: 20-30% user growth
   - Revenue impact: Gross new revenue
   - Risk: Growing churn if not addressed

3. BALANCED APPROACH (Some integration, some growth)
   - Month 1: Top 2 integrations (Slack + Jira)
   - Month 2: Improved onboarding
   - Month 3: Build APIs (enables partner integrations)
   - Effort: 12 weeks distributed
   - Expected impact: Churn down 25%, Growth up 15%
   - Risk: Nothing gets full attention

ANALYSIS:

Market context:
- Integration is table stakes now (competitors have this)
- High churn customers specifically cite integrations
- New users expect this out of box

Customer feedback:
- Existing: "Why can't you talk to Slack?"
- Prospect: "Show me Salesforce integration or we're out"

Financial impact:
- 1% churn improvement = $8k MRR saved
- 1% growth = $3k new MRR
- So retention > growth right now

RECOMMENDATION:

DO: Balanced approach (70% integration, 30% growth)

REASONING:
1. Churn is our biggest problem (losing customers faster than gaining)
2. Integrations are table stakes (we fall behind without them)
3. Slack + Jira are 80% of requests (not all 5)
4. Improved onboarding (quick win) helps both retention and growth
5. API foundation enables future revenue (partners)

QUARTER ROADMAP:

MONTH 1 (Integrations foundation):
- Slack integration (2 weeks)
- Jira integration (2 weeks)
- [Buffer for bugs/feedback]

MONTH 2 (Growth + stability):
- Improve onboarding flow (2 weeks)
- Polish integrations based on feedback (1 week)
- Bug fixes / technical debt (1 week)

MONTH 3 (APIs + expansion):
- Build integration APIs (allow community to build integrations)
- Start native mobile app (exploratory)

METRICS TO TRACK:
- Churn: Target 5% (from 8%)
- MRR: $50k to $80k
- User growth: 50k to 75k (75% of goal)
- Integration adoption: Track Slack/Jira usage
- Mobile app: Usage if shipped

RISKS & MITIGATION:
- Risk: Integrations take longer than planned
  Mitigation: Pre-plan Slack (lower dependency), start early
- Risk: Onboarding changes reduce usage
  Mitigation: A/B test with subset, monitor daily
- Risk: Customers want other integrations (Asana, Monday)
  Mitigation: APIs in Month 3 unblock community

BOARD PRESENTATION:
- Mission: 100k customers, <5% churn
- Strategy: Integration + growth balance (retention first)
- Q2 outcomes: Direction clear, execution proven
- Key metrics: Churn down, growth steady, momentum sustained
```

### Example 2: Feature Prioritization
```
You are a product manager at a startup.

PRODUCT: Content management system for creators

SITUATION:
- 5,000 paying customers
- $100k MRR (goal: $500k in 12 months)
- Free tier gets 50x paid tier in usage (conversion needed)
- Top customer request: "Scheduling"
- Market seeing: Everyone building scheduling

5 FEATURES UNDER CONSIDERATION:

Feature A: POST SCHEDULING
- Request volume: #1 (40% of user feedback)
- Competitive pressure: High (Medium, Substack, Ghost all have this)
- Customer LTV impact: Medium (convenience feature)
- Effort: 4 weeks (moderate)
- Expected revenue impact: 5% conversion improvement
- Market signal: High (everyone wanting this)

Feature B: ADVANCED ANALYTICS
- Request volume: Medium (23% of user feedback)
- Competitive pressure: Medium (some competitors have this)
- Customer LTV impact: High (creates switching cost)
- Effort: 6 weeks (complex)
- Expected revenue impact: 15% LTV increase (+15% retention)
- Market signal: Medium (smart customers want this)

Feature C: API ACCESS
- Request volume: Low (10% of user feedback)
- Competitive pressure: Low (few have good APIs)
- Customer LTV impact: Extreme (enables integration ecosystem)
- Effort: 8 weeks (complex)
- Expected revenue impact: Platform expansion (long-term)
- Market signal: Low current, High future

Feature D: WHITE LABEL OPTION
- Request volume: Medium (12% of user feedback)
- Competitive pressure: Low
- Customer LTV impact: Extreme (enterprise customers)
- Effort: 10 weeks (very complex)
- Expected revenue impact: 10x on 5 customers = $50k MRR upside
- Market signal: Enterprise customers asking

Feature E: IMPROVED UI/UX REDESIGN
- Request volume: Low (8% of user feedback)
- Competitive pressure: Medium (design matters)
- Customer LTV impact: Medium (retention + NPS)
- Effort: 12 weeks (massive)
- Expected revenue impact: 2% improvement across metrics
- Market signal: Low (no one asks for UI redesign)

PRIORITIZATION USING RICE FRAMEWORK:

R: Reach (How many users affected, per week/month)
I: Impact (How much does it help each user: 3x, 2x, 1.5x, 1x, 0.5x)
C: Confidence (High 100%, Medium 80%, Low 50%)
E: Effort (In weeks)

RICE = (Reach × Impact × Confidence) / Effort

Feature A (Scheduling):
R = 4,000 users ask (80% of base)
I = 2x (makes their job easier)
C = 100% (confident it works)
E = 4 weeks
RICE = (4,000 × 2 × 1.0) / 4 = 2,000

Feature B (Analytics):
R = 1,000 users care (20% of base)
I = 3x (significant value)
C = 100% (confident)
E = 6 weeks
RICE = (1,000 × 3 × 1.0) / 6 = 500

Feature C (API):
R = 200 users want (4% of base) BUT enable 1000+ integrations
I = 2x initially, 5x eventually
C = 50% (uncertain how much ecosystem helps)
E = 8 weeks
RICE = (200 × 2 × 0.5) / 8 = 25 (now) vs strategic play

Feature D (White label):
R = 5 customers (0.1% of base) BUT $50k MRR upside
I = 5x (if it works)
C = 70% (sales confidence)
E = 10 weeks
RICE = (5 × 5 × 0.7) / 10 = 17.5 (metrics) BUT strategic importance = build

Feature E (Redesign):
R = 5,000 users affected
I = 1x (slightly better)
C = 90% (confident it helps)
E = 12 weeks
RICE = (5,000 × 1 × 0.9) / 12 = 375 (low score but high reach)

SCORING:
1. A (Scheduling): 2,000 - HIGHEST
2. B (Analytics): 500 - HIGH
3. E (Redesign): 375 - MEDIUM
4. D (White label): 17.5 - LOW (but strategic)
5. C (API): 25 - LOWEST (but foundational)

RECOMMENDATION:

PRIORITY FOR NEXT QUARTER:

1. A (SCHEDULING) - Build this
   Why: Highest RICE, most requested, competitive table stakes
   Timeline: 4 weeks
   Expected outcome: 5% conversion lift = +$5k MRR

2. B (ANALYTICS) - Build this
   Why: High RICE, retention driver, smart customers want it
   Timeline: 6 weeks
   Expected outcome: 10% retention improvement = +$10k MRR

3. C (API) - Plan/Foundation
   Why: Strategic (enables ecosystem, long-term moat)
   Timeline: Start Month 2 (overlaps with B)
   Expected outcome: Foundation for partnerships

HOLD/LATER:
- E (UI Redesign): Important but deprioritized (do incrementally instead)
- D (White label): Strategic but wait until $200k MRR (then becomes #1)

QUARTERLY OUTCOMES:
- Launch Scheduling (40% requested feature)
- Launch Analytics (premium differentiator)
- Begin API (strategic foundation)
- Incremental UI improvements (not full redesign)
- MRR target: $115k (from $100k)
```

### Example 3: Market Analysis
```
You are a product strategist.

ANALYSIS NEEDED: Which market should we enter?

PRODUCT: SaaS for small business accounting

CURRENT: $500k MRR in SMB accounting (1-50 employees)

OPTIONS FOR EXPANSION:

Market A: Freelancer Accounting (1 person)
- Market size: 60M freelancers globally, 5M in US
- TAM: $200k MRR potential (niche but defined)
- Competitor intensity: HIGH (Wave, Square)
- Pricing power: LOW ($19-29/month)
- Expansion potential: Medium (upsell to agencies)
- Effort to enter: 4 weeks (small product changes)
- Risk: Race to bottom on pricing

Market B: Accountant Practice Management (20-100 person firms)
- Market size: 50k accountant firms globally, 10k in US
- TAM: $500M+ MRR potential (huge) 
- Competitor intensity: MEDIUM (Karbon, Jetpack)
- Pricing power: EXTREME ($500-2000/month)
- Expansion potential: Extreme (cross-sell other products)
- Effort to enter: 16 weeks (completely different product)
- Risk: Long sales cycles (3-6 months)

Market C: International Expansion (Canada, UK, Australia)
- Market size: 3x US market (60M+ SMBs)
- TAM: $2M+ MRR potential
- Competitor intensity: MEDIUM (regional competitors)
- Pricing power: LOCAL (adjust to local economics)
- Expansion potential: HIGH (template for other countries)
- Effort to enter: 12 weeks (compliance, localization)
- Risk: Regulatory complexity per country

ANALYSIS:

Market A (Freelancers):
- Pros: Easiest to enter, quick revenue, product overlap
- Cons: Low pricing, intense competition, race to bottom
- Verdict: "Quick money" but doesn't advance business

Market B (Accountants):
- Pros: Huge TAM, high pricing, creates moat, VIP customers
- Cons: Long sales cycles, completely different customer, 16-week effort
- Verdict: "Payday" if successful, but risky pivot

Market C (International):
- Pros: 3x market, high pricing, repeatable (template), expansion
- Cons: Regulatory complexity, compliance work, localization effort
- Verdict: "Sustainable growth" using existing product

RECOMMENDATION: Market B (Accountants)

REASONING:
1. Long-term strategic value (accountants < accountant practices)
2. Higher pricing power (10x current pricing)
3. Creates defensible competitive advantage
4. Enables thought leadership in the space
5. Accountants are influencers → SMBs follow

EXECUTION PLAN:
1. DO: Research accountant workflows (2 weeks)
2. DO: Design for accountant needs (4 weeks)
3. DO: Build accountant features (8 weeks)
4. DO: Land first 3 accountant customers (2 weeks)
5. MEASURE: Adoption, NPS, pricing acceptance

RISKS MitigATION:
- Risk: Accountants need features we don't have
  Mitigation: Early customer research, build flexibility
- Risk: Sales cycles too long
  Mitigation: PLG component (free tier for accountants)
- Risk: Team doesn't understand accountants
  Mitigation: Hire former accountant as advisor

QUARTERLY MILESTONES:
- Q2: Research complete, design finalized
- Q3: MVP built, 3 beta customers
- Q4: Pricing validated, 10 customers at $1k/month
```

---

## 🎯 FRAMEWORKS

### RICE Prioritization
```
R: Reach (users affected)
I: Impact (magnitude of effect)
C: Confidence (% sure)
E: Effort (weeks)

RICE Score = (R × I × C) / E
Higher = better priority
```

### KANO Model
```
Basics: Table stakes (if missing, customer unhappy)
Satisfiers: More = better
Delighters: Unexpected, creates loyalty
```

### Value vs Effort
```
High Value, Low Effort = Do NOW
High Value, High Effort = Do LATER
Low Value, Low Effort = Do IF TIME
Low Value, High Effort = Don't do
```

### JOBS TO BE DONE
```
Customer hires product to "get a job done"
Focus on job, not product features
```

---

## 💡 PRO TIPS

1. **Data > Opinion**
   - Use metrics to decide
   - Test assumptions
   - Let data guide you

2. **Customer Context Matters**
   - Same feature = different impact for different customers
   - Understand your customer segments
   - Tailor strategy

3. **Say No**
   - Every "Yes" is a "No" to something else
   - Most roadmaps fail by doing too much
   - Prioritization is about trade-offs

4. **Validate Assumptions**
   - Talk to customers before building
   - Test with prototypes
   - Get feedback early

5. **Think Long-term**
   - Short-term wins vs long-term moats
   - Balance quarterly goals + strategic positioning
   - Some features are "table stakes" even if not urgent

---

## 📊 EFFECTIVENESS METRICS

**Decision clarity**: Stakeholders agree on direction  
**Execution**: Team ships on time  
**Impact**: Roadmap items hit stated goals  

---

**Domain**: Product Management  
**Mastery Level**: Advanced  
**Time to Craft Prompt**: 20-30 minutes  
**Quality Outcome**: Clear strategy, aligned execution  

