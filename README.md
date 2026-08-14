# Aviator Live Analyzer

A read-only Chrome Manifest V3 extension for collecting visible Aviator multipliers and testing statistical signals.

## Current status
- Live DOM observation
- Conservative duplicate suppression
- Up to 5,000 locally stored observations
- Rolling statistical analysis
- Backtesting utilities
- No automatic betting or account interaction

## Install locally
1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select this repository folder.
5. Open the target game page and then open the extension popup.

## Important
The collector is intentionally generic because the exact DOM structure differs between sites and deployments. A site-specific selector/event adapter should be added only after inspecting the actual page structure. Statistical signals are experimental and are not guarantees of future outcomes.
