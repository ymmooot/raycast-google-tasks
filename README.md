# Google Tasks for Raycast

A Raycast extension to view, add, complete, and delete Google Tasks. It talks to Google through the [gog](https://github.com/openclaw/gogcli) CLI instead of calling the Google Tasks API directly.

## Commands

| Command | Description |
| --- | --- |
| Google Tasks | Shows incomplete tasks grouped by task list |
| Add Google Task | Adds a task with a title, list, due date, and notes |

### Actions in Google Tasks

| Action | Shortcut |
| --- | --- |
| Mark as complete | `↵` |
| Add a task to the list | `⌘N` |
| Open in Google Tasks | — |
| Reload | `⌘R` |
| Delete | `⌃X` |

## Setup

1. Install [gog](https://github.com/openclaw/gogcli) and sign in to your Google account with it.

   ```sh
   brew install gogcli
   ```

2. Clone this repository and run it in Raycast. Running `pnpm dev` once registers the extension in Raycast, and it stays available after you stop the command.

   ```sh
   pnpm install
   pnpm dev
   ```

## Preferences

| Name | Description |
| --- | --- |
| gog Path | Absolute path to the `gog` binary. If empty, the extension looks in `/opt/homebrew/bin` and `/usr/local/bin`. |

## Development

```sh
pnpm dev        # run in Raycast with hot reload
pnpm build      # build into dist/
pnpm typecheck
```

## License

[MIT](LICENSE)
