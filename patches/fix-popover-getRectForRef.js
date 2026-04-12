/**
 * Patch: react-native-popover-view/dist/Utility.js
 *
 * Fixes: "getRectForRef - current is not set" uncaught promise rejection
 * that occurs when the Popover's internal async measurement loop runs
 * after the component has unmounted and the anchor ref becomes null.
 *
 * Instead of rejecting, we resolve with an empty Rect(0,0,0,0).
 */
const fs = require('node:fs');
const path = require('node:path');

const filePath = path.resolve(
  __dirname,
  '../node_modules/react-native-popover-view/dist/Utility.js',
);

try {
  let content = fs.readFileSync(filePath, 'utf8');
  const target = 'reject(new Error(\'getRectForRef - current is not set\'));';
  const replacement = '// Patched: resolve with empty rect instead of crashing\n            resolve(new Rect(0, 0, 0, 0));';

  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Patched react-native-popover-view: getRectForRef graceful fallback');
  }
  else if (content.includes('resolve(new Rect(0, 0, 0, 0))')) {
    console.log('ℹ️  react-native-popover-view: already patched');
  }
  else {
    console.warn('⚠️  react-native-popover-view: could not find target to patch');
  }
}
catch (err) {
  console.error('❌ Failed to patch react-native-popover-view:', err.message);
}
