const fs = require("fs");
const path = require("path");

const diagnosticsPath = path.join(__dirname, "diagnostics.json");
const outputPath = path.join(process.cwd(), "REACT_DOCTOR_REPORT_FULL.md");

function loadDiagnostics() {
  const raw = fs.readFileSync(diagnosticsPath, "utf8");
  return JSON.parse(raw);
}

function groupByFile(diagnostics) {
  const byFile = new Map();
  for (const d of diagnostics) {
    if (!byFile.has(d.filePath)) {
      byFile.set(d.filePath, []);
    }
    byFile.get(d.filePath).push(d);
  }
  return byFile;
}

// Simple heuristic score per file:
// start at 100, -10 for each "error", -2 for each "warning", floor at 0.
function scoreForIssues(issues) {
  let score = 100;
  for (const i of issues) {
    if (i.severity === "error") {
      score -= 10;
    } else {
      score -= 2;
    }
  }
  return Math.max(0, score);
}

function formatIssue(issue, index) {
  const loc = `line ${issue.line}, col ${issue.column}`;
  const rule = `${issue.plugin}/${issue.rule}`;
  return `- **${index + 1}. [${issue.severity.toUpperCase()} | ${issue.category}]**\n` +
    `  - Rule: \`${rule}\`\n` +
    `  - Location: ${loc}\n` +
    `  - Message: ${issue.message}\n` +
    (issue.help ? `  - Help: ${issue.help}\n` : "");
}

function generateReport() {
  const diagnostics = loadDiagnostics();
  const byFile = groupByFile(diagnostics);

  const lines = [];
  lines.push("## React Doctor Per-File Code Quality Report");
  lines.push("");
  lines.push("Generated from the latest `react-doctor` diagnostics.");
  lines.push("");
  lines.push("**Per-file score rule (custom heuristic):**");
  lines.push("- Start at **100**.");
  lines.push("- Subtract **10 points** for each `error`.");
  lines.push("- Subtract **2 points** for each `warning`.");
  lines.push("- Minimum score is **0**.");
  lines.push("");
  lines.push("---");
  lines.push("");

  // Sort files alphabetically for stable output
  const files = Array.from(byFile.keys()).sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    const issues = byFile.get(file);
    const score = scoreForIssues(issues);
    const errorCount = issues.filter((i) => i.severity === "error").length;
    const warningCount = issues.filter((i) => i.severity !== "error").length;

    lines.push(`### \`${file}\``);
    lines.push("");
    lines.push(`- **Score**: ${score} / 100`);
    lines.push(`- **Issues**: ${errorCount} errors, ${warningCount} warnings`);
    lines.push("");

    issues.forEach((issue, idx) => {
      lines.push(formatIssue(issue, idx));
    });

    lines.push("");
    lines.push("---");
    lines.push("");
  }

  fs.writeFileSync(outputPath, lines.join("\n"), "utf8");
  // eslint-disable-next-line no-console
  console.log(`React Doctor per-file report written to ${outputPath}`);
}

generateReport();

