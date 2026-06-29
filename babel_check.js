const fs = require('fs');
const parser = require('@babel/parser');
const code = fs.readFileSync('frontend/src/homepage/components/Header.jsx', 'utf-8');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log("No syntax errors!");
} catch (e) {
  console.error("Syntax Error:", e.message);
  console.error("Line:", e.loc?.line, "Col:", e.loc?.column);
}
