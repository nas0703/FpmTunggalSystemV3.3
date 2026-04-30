import * as fs from 'fs';
import * as path from 'path';

const src = fs.readFileSync('src/App.tsx', 'utf8');
const lines = src.split('\n');

function extractComponent(startLine: number, endLine: number, targetPath: string, imports: string[]) {
    // lines are 0 indexed
    const componentCode = lines.slice(startLine, endLine + 1).join('\n');
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const fileContent = imports.join('\n') + '\n\n' + 'export ' + componentCode + '\n';
    fs.writeFileSync(targetPath, fileContent);
}

const importsHasil = [
  'import React, { useState, useEffect, useMemo, useRef } from "react";',
  'import { ScanLine, Search, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Target, BarChart3, Loader2, Share2, PieChart as PieChartIcon, X, ZoomIn, ZoomOut, MoveHorizontal, Printer, Download } from "lucide-react";',
  'import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, AreaChart, Area, ComposedChart, PieChart, Pie, Legend } from "recharts";',
  'import { MASTER_DATA, CHART_COLORS, TARGET_ANNUAL_PKT1, TARGET_ANNUAL_PKT2, TARGET_ANNUAL_FELDA } from "../../utils/constants";',
  'import { Transaction } from "../../App";',
  'import { AnimatePresence, motion } from "motion/react";'
];
extractComponent(10147, 11281, 'src/features/dashboard/components/HasilBulananTable.tsx', importsHasil);

const importsReport = [
  'import React from "react";',
  'import { Target, TrendingUp, TrendingDown } from "lucide-react";',
  'import { CHART_COLORS } from "../../utils/constants";',
  'import { AnimatePresence, motion } from "motion/react";'
];
extractComponent(142, 985, 'src/features/dashboard/components/ReportSummarySection.tsx', importsReport);

const importsFloating = [
  'import React, { useState, useEffect, useRef } from "react";',
  'import { Search, Loader2 } from "lucide-react";',
  'import { motion, AnimatePresence } from "motion/react";'
];
extractComponent(11346, 11377, 'src/components/ui/FloatingInput.tsx', importsFloating);

const newLines = [...lines];
newLines.splice(11346, 11377 - 11346 + 1);
newLines.splice(10147, 11281 - 10147 + 1);
newLines.splice(142, 985 - 142 + 1);

let finalApp = newLines.join('\n');
const importStmt = 'import { PruningModule } from "./features/pruning/PruningModule";';
const newImports = `
import { HasilBulananTable } from "./features/dashboard/components/HasilBulananTable";
import { ReportSummarySection } from "./features/dashboard/components/ReportSummarySection";
import { FloatingInput } from "./components/ui/FloatingInput";
`;

finalApp = finalApp.replace(importStmt, importStmt + '\n' + newImports);

fs.writeFileSync('src/App.tsx', finalApp);
console.log("Extraction complete!");
