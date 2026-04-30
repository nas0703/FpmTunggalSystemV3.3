const fs = require('fs');

const src = fs.readFileSync('src/App.tsx', 'utf8');

// Find start of HasilBulananTable
const startStr = "const HasilBulananTable = ({";
const startIndex = src.indexOf(startStr);

if (startIndex === -1) {
    console.error("Could not find start of HasilBulananTable");
    process.exit(1);
}

// Simple brace matching to find the end
let braceCount = 0;
let endIndex = -1;
let started = false;

for (let i = startIndex; i < src.length; i++) {
    if (src[i] === '{') {
        braceCount++;
        started = true;
    } else if (src[i] === '}') {
        braceCount--;
    }

    if (started && braceCount === 0) {
        endIndex = i + 1;
        break;
    }
}

if (endIndex === -1) {
    console.error("Could not find end of HasilBulananTable");
    process.exit(1);
}

const componentCode = src.substring(startIndex, endIndex);

const imports = `import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ScanLine,
  Search,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Loader2,
  Share2,
  PieChart as PieChartIcon,
  X,
  ZoomIn,
  ZoomOut,
  MoveHorizontal,
  Printer,
  Download
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  AreaChart,
  Area,
  ComposedChart,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { MASTER_DATA, CHART_COLORS, TARGET_ANNUAL_PKT1, TARGET_ANNUAL_PKT2, TARGET_ANNUAL_FELDA } from "../utils/constants";
import { Transaction } from "../App";
import { AnimatePresence, motion } from "motion/react";

`;

fs.mkdirSync('src/components', { recursive: true });
fs.writeFileSync('src/components/HasilBulananTable.tsx', imports + 'export ' + componentCode + '\n');

// Now remove from App.tsx add import 
const importStatement = `import { HasilBulananTable } from "./components/HasilBulananTable";\n`;
let importsEndIndex = src.lastIndexOf("import ", src.indexOf("function App()"))
let importsEndLineIndex = src.indexOf("\n", importsEndIndex)

const newApp = src.substring(0, importsEndLineIndex + 1) + importStatement + src.substring(importsEndLineIndex + 1, startIndex) + src.substring(endIndex);
fs.writeFileSync('src/App.tsx', newApp);

console.log("Successfully extracted HasilBulananTable");
