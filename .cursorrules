# SAP React UI5 Project Rules

We are building a React application using Vite and official SAP UI5 Web Components (@ui5/webcomponents-react). 

## Your Tools & Context Limits
1. **You have access to @ui5/mcp-server.** 
   - ⚠️ IMPORTANT: This project is a VITE + REACT project. It is NOT a classic SAPUI5 XML/controller project and does NOT contain a `ui5.yaml` file.
   - Do NOT call tools that look for `ui5.yaml` or expect standard UI5 project structures (like running classic lints or project structure commands).
   - ONLY use the UI5 MCP server to query general documentation, guidelines, or fetch standard component properties via its guideline tools.
2. **You have access to @sap-ux/fiori-mcp-server** to reference layout standards.
3. **You have access to figma-mcp** to read visual layouts.

## Best Practices
- Always prefer using `@ui5/webcomponents-react` components (e.g., `<ShellBar>`, `<TabContainer>`, `<Wizard>`, `<FlexibleColumnLayout>`) over raw HTML elements.
- When generating layout styling, always use official SAP theme CSS variables (e.g., `--sapBackgroundColor`, `--sapTile_Background`) to ensure the design matches the S/4HANA theme automatically.
- Check the official `@ui5/webcomponents-react` library definitions inside the installed `node_modules` if the MCP server fails to find React-specific API shapes.