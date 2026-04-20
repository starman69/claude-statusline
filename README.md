# claude-statusline

A compact statusline for [Claude Code](https://docs.claude.com/en/docs/claude-code/overview): model, context usage bar, and Pro/Max rate-limit windows — all in one line.

![statusline preview](docs/screenshots/statusline.png)

## Features

- **Model name** — from the active session.
- **Context progress bar** — 10-block visual + percentage of the context window used.
- **5-hour window** — usage % and reset time (Pro/Max plans only).
- **7-day window** — usage % (Pro/Max plans only).
- **No runtime deps** beyond `bash`, `jq`, and GNU `date` — no network calls, no Node, nothing to install.

## Requirements

- `bash` 4+
- `jq`
- GNU `date` (Linux default; on macOS install `coreutils` via `brew install coreutils` and swap `date` for `gdate` in the script)

## Install

1. Copy the script into your Claude config directory:

   ```bash
   mkdir -p ~/.claude
   cp src/statusline-command.sh ~/.claude/statusline-command.sh
   chmod +x ~/.claude/statusline-command.sh
   ```

2. Add the `statusLine` block to `~/.claude/settings.json` (see [`examples/settings.json`](examples/settings.json)):

   ```json
   {
     "statusLine": {
       "type": "command",
       "command": "bash /home/YOU/.claude/statusline-command.sh"
     }
   }
   ```

   Replace `/home/YOU` with your actual home path (`echo $HOME`).

3. Restart Claude Code. The statusline appears at the bottom of the interface.

## How it works

Claude Code invokes the `statusLine.command` on each render, piping a JSON session snapshot on stdin. The script extracts fields with `jq`, renders a progress bar using `printf`-padded spaces with block-character substitution, and prints a single line to stdout.

Fields consumed from the stdin JSON:

| Field | Purpose |
|---|---|
| `model.display_name` | Shown in brackets at the left |
| `context_window.used_percentage` | Drives the progress bar |
| `rate_limits.five_hour.used_percentage` | 5h window % |
| `rate_limits.five_hour.resets_at` | Unix timestamp for `↻HH:MM` |
| `rate_limits.seven_day.used_percentage` | 7d window % |

## Customization

Tweak these knobs in [`src/statusline-command.sh`](src/statusline-command.sh):

- `BAR_WIDTH=10` — number of blocks in the bar.
- `▓` / `░` — filled/empty glyphs. Try `█`/`·`, `=`/`-`, `#`/`.` to taste.
- The `OUT=...` lines at the bottom compose labels and separators — reorder or drop sections there.

## Troubleshooting

- **`5h` / `7d` sections missing.** These fields appear only after the first API response on a Pro or Max plan. Fresh sessions render context only until the first call lands.
- **`jq: command not found`.** Install via your package manager — `apt install jq`, `brew install jq`, etc.
- **`date: invalid option`** on macOS. BSD `date` doesn't accept `-d @timestamp`. Install GNU coreutils and replace `date` with `gdate` in the script.
- **Statusline not appearing.** Confirm `~/.claude/settings.json` parses cleanly (`jq . ~/.claude/settings.json`) and that the path in `statusLine.command` is absolute.

## Repo layout

```
claude-statusline/
├── README.md                 # this file
├── LICENSE                   # MIT
├── .gitignore
├── src/
│   └── statusline-command.sh # the script
├── examples/
│   └── settings.json         # minimal settings.json snippet
└── docs/
    └── screenshots/          # preview image lives here
```

## License

MIT — see [LICENSE](LICENSE).
