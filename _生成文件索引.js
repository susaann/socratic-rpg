/**
 * 生成 文件索引.json
 *
 * 在本地跑一遍，扫描所有目录，输出 JSON 索引文件。
 * GitHub Pages 上没有目录列表功能，靠这个索引来定位文件。
 *
 * 使用方式：
 *   node _生成文件索引.js
 *
 * 效果：在项目根目录生成 文件索引.json，供教材阅读器和主应用使用。
 */

const fs = require('fs');
const path = require('path');

// 需要索引的目录（相对于项目根目录）
const TARGET_DIRS = [
  '教材',
  '老师',
  '习题集',
  'homework/待批改',
  'system',
];

const ROOT = __dirname;

function scanDirRecursive(dirPath, prefix = '') {
  const result = {};
  const fullPath = path.join(ROOT, dirPath);

  try {
    const entries = fs.readdirSync(fullPath, { withFileTypes: true });
    const names = entries
      .filter(e => e.name !== '.gitkeep')
      .map(e => e.isDirectory() ? e.name + '/' : e.name)
      .sort();

    const key = (prefix + dirPath.replace(/\\/g, '/') + '/').replace(/\/\//g, '/');
    result[key] = names;

    // 递归子目录
    for (const e of entries) {
      if (e.isDirectory() && !e.name.startsWith('.')) {
        const subPath = dirPath + '/' + e.name;
        const subResult = scanDirRecursive(subPath, prefix);
        Object.assign(result, subResult);
      }
    }
  } catch (err) {
    console.warn('⚠️ 无法扫描 ' + dirPath + '：' + err.message);
  }

  return result;
}

console.log('🔍 正在扫描目录…');
const index = {};
for (const dir of TARGET_DIRS) {
  const result = scanDirRecursive(dir);
  Object.assign(index, result);
}

// 写入文件
const outputPath = path.join(ROOT, '文件索引.json');
fs.writeFileSync(outputPath, JSON.stringify(index, null, 2), 'utf-8');

console.log('✅ 文件索引已生成：' + outputPath);
console.log('   共 ' + Object.keys(index).length + ' 个目录');
let totalFiles = 0;
for (const files of Object.values(index)) totalFiles += files.length;
console.log('   共 ' + totalFiles + ' 个文件/目录');
