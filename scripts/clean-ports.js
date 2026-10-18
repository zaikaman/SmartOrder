const { execSync } = require('child_process');

const ports = [8081, 8082, 8083, 5173];
console.log('[CLEAN] Kiem tra va giai phong cac cong 8081, 8082, 8083, 5173 truoc khi khoi dong...');

if (process.platform === 'win32') {
  ports.forEach((port) => {
    try {
      const output = execSync(`netstat -ano | findstr :${port}`, { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'ignore'] 
      });
      const lines = output.trim().split('\n');
      const pids = new Set();
      lines.forEach((line) => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && parts[parts.length - 2] === 'LISTENING') {
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid) && pid !== '0') {
            pids.add(pid);
          }
        }
      });
      pids.forEach((pid) => {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`[CLEAN] Da giai phong cong ${port} (PID: ${pid})`);
        } catch (_) {}
      });
    } catch (_) {
      // Khong co tien trinh chiem cong
    }
  });
} else {
  ports.forEach((port) => {
    try {
      execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore' });
    } catch (_) {}
  });
}
console.log('[CLEAN] Cac cong san sang de khoi dong!');
