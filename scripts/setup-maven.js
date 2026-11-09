const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const mavenVersion = '3.9.9';
const userHome = os.homedir();
const storeDir = path.join(userHome, '.m2', 'wrapper', 'dists', `apache-maven-${mavenVersion}-bin`);
const mavenHome = path.join(storeDir, `apache-maven-${mavenVersion}`);
const mvnCmd = path.join(mavenHome, 'bin', 'mvn.cmd');

if (fs.existsSync(mvnCmd)) {
  console.log('[MAVEN] Apache Maven ' + mavenVersion + ' đã có sẵn tại ' + mavenHome);
  process.exit(0);
}

fs.mkdirSync(storeDir, { recursive: true });
const zipPath = path.join(storeDir, `apache-maven-${mavenVersion}-bin.zip`);

const downloadUrl = `https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/${mavenVersion}/apache-maven-${mavenVersion}-bin.zip`;
console.log(`[MAVEN] Đang tải Apache Maven ${mavenVersion} từ ${downloadUrl}...`);

function download(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return download(res.headers.location, dest, cb);
    }
    if (res.statusCode !== 200) {
      return cb(new Error(`Tải thất bại với mã trạng thái ${res.statusCode}`));
    }
    res.pipe(file);
    file.on('finish', () => {
      file.close(cb);
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => cb(err));
  });
}

download(downloadUrl, zipPath, (err) => {
  if (err) {
    console.error('[MAVEN] Lỗi tải Maven:', err.message);
    process.exit(1);
  }
  console.log('[MAVEN] Đang giải nén Apache Maven ' + mavenVersion + '...');
  try {
    execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${storeDir}' -Force"`, { stdio: 'inherit' });
    try { fs.unlinkSync(zipPath); } catch (_) {}
    console.log('[MAVEN] Cài đặt Apache Maven ' + mavenVersion + ' thành công!');
  } catch (extractErr) {
    console.error('[MAVEN] Lỗi giải nén:', extractErr.message);
    process.exit(1);
  }
});
