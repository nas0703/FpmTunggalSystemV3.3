import fs from 'fs';
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `        const originalPosition = node.style.position;\n        const originalWidthNode = node.style.width;\n\n        if (tableContainer) {`;
const replaceStr = `        const originalPosition = node.style.position;\n        const originalWidthNode = node.style.width;\n\n        const parentWithTransform = node.parentElement;\n        let originalTransform = "";\n        if (parentWithTransform && parentWithTransform.style.transform) {\n          originalTransform = parentWithTransform.style.transform;\n          parentWithTransform.style.transform = "none";\n        }\n\n        if (tableContainer) {`;

content = content.replace(targetStr, replaceStr);

const targetStr2 = `        if (tableContainer) {\n          tableContainer.style.overflow = originalOverflow;\n          tableContainer.style.width = originalWidth;\n          tableContainer.style.maxWidth = originalMaxWidth;\n        }\n        node.style.position = originalPosition;\n        node.style.width = originalWidthNode;\n      } finally {`;
const replaceStr2 = `        if (tableContainer) {\n          tableContainer.style.overflow = originalOverflow;\n          tableContainer.style.width = originalWidth;\n          tableContainer.style.maxWidth = originalMaxWidth;\n        }\n        node.style.position = originalPosition;\n        node.style.width = originalWidthNode;\n        if (parentWithTransform && originalTransform) {\n          parentWithTransform.style.transform = originalTransform;\n        }\n      } finally {`;

content = content.replace(targetStr2, replaceStr2);

fs.writeFileSync(file, content);
console.log("Updated App.tsx scale transform");
