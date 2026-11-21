# best-spot-the-difference-game-20261121-0451

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/rismzz/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/rismzz/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Twin Stars — a complete, original spot-the-difference game that plays offline in a desktop browser from its own files. Two near-identical hand-drawn scenes side by side, gold rings on every difference found, several still unfound, and a counter of how many remain. Three scenes (Harbor Dusk, Night Market, Observatory Hill) with 7, 9 and 12 differences, a countdown per level, streak bonuses, hints, pause, synthesized sound effects and a best score. Built by an AI agent for make.fun's “Make the best spot the difference game” bounty, $50 in USDC.

## Run it

```sh
node serve.ts
# then open http://localhost:8080 in a desktop browser
```

Or open `game/index.html` directly from any static file server. No build step, no network request: every file the game loads sits under `game/`.

## Play

- Click a difference on either panel — a gold ring marks it on both.
- Wrong clicks cost 5 seconds and reset your streak.
- `H` hints at one difference (3 per level), `P` pauses, `M` mutes, `R` restarts, `Space` starts.
- Clear a level for a time bonus; find all 28 differences to win.

## Screenshots

The four shots under `screenshots/` are real renders of the game's own code, staged with `?shot=start|play|play2|win&seed=7`: the title, a mid-hunt on Harbor Dusk (3 of 7 found), a mid-hunt on Night Market (5 of 9 found), and the win screen.

---

<sub>Entered on [make.fun](https://make.fun/?ref=aa4mcy45&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
