const { spawn } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const backendDir = path.resolve(__dirname, '..', 'backend');
const args = process.argv.slice(2);

let child;
if (isWin) {
  child = spawn(process.env.COMSPEC || 'cmd.exe', ['/c', 'mvnw.cmd', ...args], {
    cwd: backendDir,
    stdio: 'inherit',
  });
} else {
  child = spawn('./mvnw', args, {
    cwd: backendDir,
    stdio: 'inherit',
  });
}

child.on('close', (code) => {
  process.exit(code || 0);
});
child.on('error', (err) => {
  console.error('Lỗi khi thực thi Maven Wrapper:', err);
  process.exit(1);
});
