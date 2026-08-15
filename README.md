# Aviator Live Analyzer

A read-only Chrome Manifest V3 extension for collecting visible Aviator multipliers and testing statistical signals.

## Test it
1. Clone/download this repository.
2. Open Chrome → `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the repository folder.
5. Open the Aviator page, refresh it, and open the extension popup.

## What it does
- Observes visible multiplier text in the page.
- Deduplicates repeated DOM mutations.
- Stores up to 5,000 observations locally.
- Shows rolling distributions, volatility, streaks and a transparent risk score.
- Runs baseline/backtest calculations without placing bets.
- Keeps a paper-trading/research boundary: no automatic betting or account interaction.

## Important limitation
The collector is intentionally generic. Aviator deployments can use different DOM structures and rendering approaches. If the extension does not collect rounds on your specific page, the next step is to add a site-specific adapter based on that page's DOM/event structure. Do not treat the statistical signal as a guarantee of the next crash point.
