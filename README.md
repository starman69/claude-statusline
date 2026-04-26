# claude-statusline

A compact statusline for [Claude Code](https://docs.claude.com/en/docs/claude-code/overview): model, context usage bar, and Pro/Max rate-limit windows — all in one line.

![statusline preview](docs/screenshots/statusline.png)

## Features

- **Model name** — from the active session.
- **Context progress bar** — 10-block visual + percentage of the context window used.
- **5-hour window** — usage % and reset time (Pro/Max plans only).
- **7-day window** — usage % (Pro/Max plans only).
- **Two equivalent versions** — bash (`jq` + GNU `date`) or Node (no external deps). Same output, pick whichever fits your environment.

## Requirements

Pick one runtime:

- **Bash version** — `bash` 4+, `jq`, GNU `date` (Linux default; on macOS install `coreutils` via `brew install coreutils` and swap `date` for `gdate` in the script).
- **Node version** — Node 18+. No other dependencies.

## Install

1. Copy your chosen script into your Claude config directory.

   Bash version:
   ```bash
   mkdir -p ~/.claude
   cp src/statusline-command.sh ~/.claude/statusline-command.sh
   chmod +x ~/.claude/statusline-command.sh
   ```

   Node version:
   ```bash
   mkdir -p ~/.claude
   cp src/statusline-command.mjs ~/.claude/statusline-command.mjs
   chmod +x ~/.claude/statusline-command.mjs
   ```

2. Add the `statusLine` block to `~/.claude/settings.json` (see [`examples/settings.json`](examples/settings.json)):

   Bash version:
   ```json
   {
     "statusLine": {
       "type": "command",
       "command": "bash /home/YOU/.claude/statusline-command.sh"
     }
   }
   ```

   Node version:
   ```json
   {
     "statusLine": {
       "type": "command",
       "command": "node /home/YOU/.claude/statusline-command.mjs"
     }
   }
   ```

   Replace `/home/YOU` with your actual home path (`echo $HOME`).

3. Restart Claude Code. The statusline appears at the bottom of the interface.

## How it works

Claude Code invokes the `statusLine.command` on each render, piping a JSON session snapshot on stdin. The script extracts a few fields, renders a progress bar, and prints a single line to stdout. The bash version uses `jq` + `printf`; the Node version parses JSON natively and uses `String.repeat`.

Fields consumed from the stdin JSON:

| Field | Purpose |
|---|---|
| `model.display_name` | Shown in brackets at the left |
| `context_window.used_percentage` | Drives the progress bar |
| `rate_limits.five_hour.used_percentage` | 5h window % |
| `rate_limits.five_hour.resets_at` | Unix timestamp for `↻HH:MM` |
| `rate_limits.seven_day.used_percentage` | 7d window % |

## Customization

The same knobs live in both [`src/statusline-command.sh`](src/statusline-command.sh) and [`src/statusline-command.mjs`](src/statusline-command.mjs):

- `BAR_WIDTH=10` — number of blocks in the bar.
- `▓` / `░` — filled/empty glyphs. Try `█`/`·`, `=`/`-`, `#`/`.` to taste.
- The `OUT=...` / `out +=` lines at the bottom compose labels and separators — reorder or drop sections there.

## Troubleshooting

- **`5h` / `7d` sections missing.** These fields appear only after the first API response on a Pro or Max plan. Fresh sessions render context only until the first call lands.
- **`jq: command not found`.** Install via your package manager — `apt install jq`, `brew install jq`, etc. Or use the Node version, which has no external deps.
- **`date: invalid option`** on macOS (bash version). BSD `date` doesn't accept `-d @timestamp`. Either use the Node version, or install GNU coreutils and replace `date` with `gdate` in the script.
- **Statusline not appearing.** Confirm `~/.claude/settings.json` parses cleanly (`jq . ~/.claude/settings.json`) and that the path in `statusLine.command` is absolute.

## Repo layout

```
claude-statusline/
├── README.md                  # this file
├── LICENSE                    # MIT
├── .gitignore
├── src/
│   ├── statusline-command.sh  # bash version (jq + GNU date)
│   └── statusline-command.mjs # node version (no external deps)
├── examples/
│   └── settings.json          # minimal settings.json snippet
└── docs/
    └── screenshots/           # preview image lives here
```

## License

MIT — see [LICENSE](LICENSE).
