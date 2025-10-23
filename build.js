const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 编译TypeScript
console.log('Building TypeScript...');
execSync('tsc', { stdio: 'inherit' });

// 复制SVG图标文件
console.log('Copying icons...');
function copySVGFiles(dir, targetDir) {
	if (!fs.existsSync(dir)) return;
	
	const files = fs.readdirSync(dir);
	files.forEach(file => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		
		if (stat.isDirectory()) {
			const targetSubDir = path.join(targetDir, file);
			fs.mkdirSync(targetSubDir, { recursive: true });
			copySVGFiles(filePath, targetSubDir);
		} else if (file.endsWith('.svg')) {
			const targetPath = path.join(targetDir, file);
			fs.copyFileSync(filePath, targetPath);
			console.log(`  Copied: ${path.relative(path.join(__dirname, 'nodes'), filePath)}`);
		}
	});
}

const nodesDir = path.join(__dirname, 'nodes');
const distNodesDir = path.join(__dirname, 'dist', 'nodes');
copySVGFiles(nodesDir, distNodesDir);

console.log('Build completed successfully!');
