# ztd-charts-mcp

A stdio MCP server for ztd charts. Tools: `list_charts`, `get_chart_schema`, `validate_spec`, `render_chart` (PNG image + SVG + React code, `locale: "ko"` for Korean chart text), `suggest_chart`. Resource: `ztd-charts://schema/chart-spec.json`.

Renamed from `@junhanlee/chart-kit-mcp` in 0.2.0. The server name in configs is now `ztd-charts`.

Claude Code:

```bash
claude mcp add ztd-charts -- npx -y ztd-charts-mcp
```

Claude Desktop (`claude_desktop_config.json`), Cursor (`.cursor/mcp.json`) and other clients:

```json
{
  "mcpServers": {
    "ztd-charts": { "command": "npx", "args": ["-y", "ztd-charts-mcp"] }
  }
}
```
