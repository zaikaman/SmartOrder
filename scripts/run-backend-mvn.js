const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const isWin = process.platform === 'win32';
const backendDir = path.resolve(__dirname, '..', 'backend');
const args = process.argv.slice(2);

// Tự động phát hiện JAVA_HOME nếu chưa được thiết lập
function detectJavaHome() {
  if (process.env.JAVA_HOME) {
    const javaBin = path.join(process.env.JAVA_HOME, 'bin', isWin ? 'java.exe' : 'java');
    if (fs.existsSync(javaBin)) {
      return process.env.JAVA_HOME;
    }
  }

  const candidateDirs = [];
  const homeDir = os.homedir();

  if (isWin) {
    // Ưu tiên Eclipse Adoptium Temurin JDK 17 LTS chuẩn
    candidateDirs.push('C:\\Program Files\\Eclipse Adoptium');
    candidateDirs.push('C:\\Program Files\\Java');
    candidateDirs.push('C:\\Program Files\\Microsoft');
    candidateDirs.push('C:\\Program Files\\Amazon Corretto');
    candidateDirs.push('C:\\Program Files\\Zulu');
    
    const jetbrainsDir = 'C:\\Program Files\\JetBrains';
    if (fs.existsSync(jetbrainsDir)) {
      try {
        const apps = fs.readdirSync(jetbrainsDir);
        for (const app of apps) {
          const jbr = path.join(jetbrainsDir, app, 'jbr');
          if (fs.existsSync(path.join(jbr, 'bin', 'java.exe'))) {
            candidateDirs.push(jbr);
          }
        }
      } catch (_) {}
    }
    candidateDirs.push(path.join(homeDir, '.jdks'));
    candidateDirs.push('C:\\Program Files (x86)\\Java');
  } else {
    candidateDirs.push('/usr/lib/jvm');
    candidateDirs.push('/Library/Java/JavaVirtualMachines');
    candidateDirs.push(path.join(homeDir, '.jdks'));
  }

  for (const candidate of candidateDirs) {
    if (fs.existsSync(path.join(candidate, 'bin', isWin ? 'java.exe' : 'java'))) {
      return candidate;
    }
    if (fs.existsSync(candidate)) {
      try {
        const subDirs = fs.readdirSync(candidate);
        for (const sub of subDirs) {
          const fullPath = path.join(candidate, sub);
          const javaBin = path.join(fullPath, 'bin', isWin ? 'java.exe' : 'java');
          if (fs.existsSync(javaBin)) {
            return fullPath;
          }
        }
      } catch (_) {}
    }
  }

  return null;
}

const javaHome = detectJavaHome();
const env = { ...process.env };

if (javaHome) {
  env.JAVA_HOME = javaHome;
  const binDir = path.join(javaHome, 'bin');
  env.PATH = `${binDir}${path.delimiter}${env.PATH || ''}`;
}

let child;
if (isWin) {
  child = spawn(process.env.COMSPEC || 'cmd.exe', ['/c', 'mvnw.cmd', ...args], {
    cwd: backendDir,
    stdio: 'inherit',
    env,
  });
} else {
  child = spawn('./mvnw', args, {
    cwd: backendDir,
    stdio: 'inherit',
    env,
  });
}

child.on('close', (code) => {
  process.exit(code || 0);
});
child.on('error', (err) => {
  console.error('Lỗi khi thực thi Maven Wrapper:', err);
  process.exit(1);
});
