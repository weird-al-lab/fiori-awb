# # SAP React UI5 Project Rules

We are building a React application using Vite and official SAP UI5 Web Components (@ui5/webcomponents-react). 

## Your Tools & Context Limits

1. **You have access to @ui5/mcp-server.** 

   - ⚠️ IMPORTANT: This project is a VITE + REACT project. It is NOT a classic SAPUI5 XML/controller project and does NOT contain a `ui5.yaml` file.

   - Do NOT call tools that look for `ui5.yaml` or expect standard UI5 project structures (like running classic lints or project structure commands).

   - ONLY use the UI5 MCP server to query general documentation, guidelines, or fetch standard component properties via its guideline tools.

2. **You have access to @sap-ux/fiori-mcp-server** to reference layout standards.

3. **You have access to figma-mcp** to read visual layouts.

## Local SAP AI Skills

- This workspace contains pre-loaded SAP expert skills located in: `.cursor/skills/` (or your project's local skills directory).

- **The Fiori Guidelines Skill:** Located in `.cursor/skills/sap-fiori-guidelines/SKILL.md` (or your equivalent local path).

- **CRITICAL TRIGGER:** If the user mentions "Fiori", "UI5", "Wizard", "S/4HANA", "ShellBar", "Semantic colors", or asks about UX layout/design, **you MUST explicitly read the local [SKILL.md](http://SKILL.md) file** first to adopt the exact rules of the SAP Design System (v1.145). Do not hallucinate or guess properties.

## Best Practices

- Always prefer using `@ui5/webcomponents-react` components (e.g., `<ShellBar>`, `<TabContainer>`, `<Wizard>`, `<FlexibleColumnLayout>`) over raw HTML elements.

- When generating layout styling, always use official SAP theme CSS variables (e.g., `--sapBackgroundColor`, `--sapTile_Background`) to ensure the design matches the S/4HANA theme automatically.

- When the user provides a Figma link to a design or component (especially if utilizing the SAP S/4HANA Web UI Kit):

  1. Call the `figma-desktop` tool to inspect the selected frame, layers, properties, and overall component structure.

  2. Read your local *`sap-fiori-guidelines`** skill to map those identified elements directly to standard S/4HANA layout patterns.

  3. Generate the React components using the validated properties from the `@ui5/mcp-server`.