**Best For**: Financial modeling, forecasting, and investment analysis with professional rigor
**Effectiveness**: ⭐⭐⭐⭐⭐ (Critical for business decisions)

---

## 🎯 TEMPLATE

```
ROLE: You are a senior financial analyst and CFA charterholder with 15+ years experience in corporate finance, investment banking, and strategic planning.
Your specialty: Creating robust financial models that surface insights and support high-stakes decisions with precision.

CONTEXT: I need to perform financial analysis for [COMPANY/PROJECT_NAME], a [INDUSTRY] business.
Analysis type: [TYPE: valuation/investment/forecasting/budgeting/turnaround]
Available data: [DATA_SOURCES: financial statements/market data/management projections].
Time horizon: [HORIZON: 1/3/5 years].
Key stakeholders: [AUDIENCE: investors/management/board/lenders].

TASK: Create a comprehensive financial analysis including modeling framework, key metrics, sensitivity analysis, and actionable recommendations.

REQUIREMENTS:
- EXECUTIVE SUMMARY: Key findings, critical metrics, and bottom-line recommendation
- COMPANY OVERVIEW: Business model, market position, recent performance
- FINANCIAL STATEMENT ANALYSIS: 
  * Income statement trends (revenue growth, margin evolution)
  * Balance sheet health (liquidity, leverage, working capital)
  * Cash flow analysis (operating, investing, financing patterns)
- KEY RATIOS & METRICS:
  * Profitability (gross margin, EBITDA margin, ROE, ROIC)
  * Efficiency (asset turnover, inventory days, receivables days)
  * Liquidity (current ratio, quick ratio, cash conversion cycle)
  * Leverage (debt-to-equity, interest coverage, debt service)
- VALUATION/APPRAISAL (if applicable):
  * DCF model with assumptions and sensitivities
  * Comparable company analysis
  * Precedent transactions
  * Sum-of-parts if conglomerate
- FORECASTING MODEL: 
  * Revenue drivers and growth assumptions
  * Cost structure and margin assumptions
  * Working capital projections
  * Capex and depreciation schedules
  * 3-statement integrated model
- SCENARIO ANALYSIS: Base, bull, and bear cases with probabilities
- SENSITIVITY ANALYSIS: Key variable impact on outcomes
- RISK ASSESSMENT: Financial risks and mitigation strategies
- RECOMMENDATIONS: Specific actions with financial impact

CONSTRAINTS:
- NO unsupported assumptions — every input needs justification
- NEVER ignore seasonality or cyclicality in forecasts
- NO DCF without terminal value justification
- NEVER present point estimates without sensitivity ranges
- Don't use industry averages without understanding company-specific deviations
- No analysis without actionable recommendations

AUDIENCE: [DECISION_MAKER_TYPE: CFO/investment committee/board] with [ANALYTICAL_SOPHISTICATION: high/moderate] who need [ACTION_TYPE: approval/monitoring/course correction]

OUTPUT FORMAT:
**EXECUTIVE SUMMARY**
[One-page summary with key metrics and recommendation]

**1. COMPANY & MARKET CONTEXT**
[Business model, competitive position, recent events]

**2. HISTORICAL FINANCIAL ANALYSIS**
2.1 Income Statement Trends
[3-year analysis with growth rates and margin evolution]

2.2 Balance Sheet Analysis
[Capital structure, liquidity, asset efficiency]

2.3 Cash Flow Patterns
[Operating cash generation, free cash flow conversion]

**3. KEY FINANCIAL METRICS**
[Ratio table with industry benchmarks]

**4. VALUATION ANALYSIS** (if applicable)
4.1 DCF Model
[Assumptions table, 5-year projections, terminal value, WACC]

4.2 Comparable Analysis
[Peer set, multiples, premium/discount analysis]

4.3 Valuation Summary
[Football field chart with range]

**5. FORECAST MODEL**
[Driver-based projections with assumptions]

**6. SCENARIO & SENSITIVITY ANALYSIS**
6.1 Scenario Outcomes
[Base/bull/bear financial outcomes]

6.2 Sensitivity Table
[Key variable impact matrix]

**7. RISK ASSESSMENT**
[Financial risks with probability and impact]

**8. RECOMMENDATIONS**
[Specific actions with expected financial outcomes]

SELF-CHECK BEFORE RESPONDING:
Rate your analysis:
- Analytical rigor (1-3):
- Actionability (1-3):
- Presentation clarity (1-3):
If total < 7 — add more specific recommendations or tighten assumptions.
```

---

## 📝 QUICK FILL TEMPLATE

```
**Subject**: [COMPANY/PROJECT_NAME]
**Industry**: [SECTOR]
**Analysis Type**: [Valuation/Investment/Forecast/Budget]
**Time Horizon**: [1/3/5 years]
**Key Data**: [Financial statements/Market data/Both]
**Primary Users**: [Investors/Management/Board]
**Critical Question**: [WHAT_DECISION_NEEDS_SUPPORT]
**Special Factors**: [Seasonality/Cyclicality/Regulatory changes]
```

---

## 🎨 REAL EXAMPLES

**Example 1: Revenue Buildup (SaaS)**
```
5.1 REVENUE FORECAST MODEL

Driver-based approach:

New Customer Acquisition:
• Marketing spend: $XM → leads → qualified opportunities → conversions
• Sales team capacity: X reps → Y demos/month → Z% close rate
• Channel partnerships: X partners → Y referrals/quarter

Existing Customer Expansion:
• Net revenue retention: X% (industry benchmark: 110%)
• Upsell rate: Y% of customers expand annually
• Price increases: Z% annually on legacy contracts

Churn Assumptions:
• Logo churn: X% annually (monthly cohort analysis)
• Revenue churn: Y% (downgrades + cancellations)

Revenue Build:
Year 1: $XM (X customers × $Y ACV × Z% retention)
Year 2: $XM (existing + new - churn)
Year 3: $XM

Validation: Compare to comparable company growth curves at similar scale
```

**Example 2: Sensitivity Analysis Table**
```
6.2 SENSITIVITY ANALYSIS

Impact on Enterprise Value ($M):

                    Revenue Growth
WACC     10%      15%      20%      25%
8%      $45M     $62M     $85M    $112M
10%     $38M     $52M     $71M     $93M
12%     $32M     $44M     $60M     $78M

Key Finding: Each 5% increase in revenue growth adds ~$20M in value at 10% WACC.
Each 2% increase in WACC reduces value by ~$10M.

Implication: Priority should be growth acceleration over margin optimization.
```

---

## 🔧 VARIATIONS

**Variation 1: Credit Analysis (Lending Decision)**
```
Focus: Debt service capacity, collateral coverage, covenant compliance
Add: Cash flow available for debt service (CFADS), debt capacity analysis
Remove: Valuation section (lenders don't care about equity value)
Emphasis: Downside scenarios and recovery analysis
```

**Variation 2: M&A Target Screening**
```
Focus: Strategic fit, synergy quantification, integration costs
Add: Synergy modeling (revenue + cost), integration budget, cultural assessment
Remove: Detailed standalone valuation (already known)
Emphasis: Accretion/dilution analysis, IRR on invested capital
```

**Variation 3: Turnaround/Restructuring**
```
Focus: Cash burn rate, runway, cost reduction opportunities
Add: 13-week cash flow forecast, liquidity covenant headroom, contingency plans
Remove: Long-term DCF (irrelevant if near-term survival uncertain)
Emphasis: Stabilization plan, value preservation vs. value creation
```

---

## ✅ QUALITY CHECKLIST

- [ ] Every assumption has documented basis (historical trend, management guidance, industry data)
- [ ] Financial statements reconcile (balance sheet balances, cash flow ties to balance sheet changes)
- [ ] Growth assumptions are realistic (checked against comparable companies and industry growth)
- [ ] Working capital assumptions reflect actual business cycle (not simple % of revenue)
- [ ] Sensitivities cover the key value drivers (revenue growth, margin, WACC)
- [ ] Scenarios have assigned probabilities and expected value calculated
- [ ] Risks have quantified financial impact where possible
- [ ] Recommendations are specific with expected outcomes
- [ ] Executive summary can stand alone (decision-makers may read only this)

---

## 💡 PRO TIPS

- **Audit your model**: Build in error checks (balance sheet balances, cash flow reconciliation)
- **Document assumptions**: Create a separate assumptions tab — don't bury inputs in formulas
- **Sanity check outputs**: If your DCF says $1B but comps say $100M, find the disconnect
- **Version control**: Save iterations with dates — "Model_v2024-03-15_AssumptionsA"
- **Stress test extremes**: What if revenue is 50% lower? Still viable?
- **Tell the story**: Numbers without narrative don't drive decisions
- **Add an "error term"**: Realize your forecast will be wrong — show confidence intervals

---

## 📊 EFFECTIVENESS METRICS

| Metric | Good | Great | Exceptional |
|--------|------|-------|-------------|
| Forecast Accuracy | ±30% | ±15% | ±5% |
| Model Complexity | Functional | Auditable | Elegant |
| Decision Speed | 2 weeks | 3 days | Same day |
| Stakeholder Confidence | Accepts | Relies on | Builds strategy on |

---

## 🔄 ITERATION WORKFLOW

1. **Data gathering**: Collect financial statements, market data, management projections
2. **Historical analysis**: Understand past performance trends and drivers
3. **Assumption setting**: Document every input with rationale
4. **Model building**: Create integrated 3-statement model
5. **Valuation (if needed)**: Run DCF, comparables, other methodologies
6. **Sensitivity analysis**: Identify key value drivers, test extremes
7. **Peer review**: Have another analyst audit formulas and logic
8. **Presentation**: Create summary output for decision-makers
9. **Ongoing**: Update monthly with actuals, refresh quarterly

---

## 🔗 RELATED TEMPLATES

- Business Plan (for strategic context)
- Pitch Deck (for investment presentations)
- Data Analysis (for quantitative methods)
