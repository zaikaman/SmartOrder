# ==============================================================================
# Kịch bản nạp biến môi trường từ .env vào phiên PowerShell hiện tại
# Cách sử dụng: .\scripts\set-env.ps1
# ==============================================================================

$envFile = Join-Path $PSScriptRoot "..\.env"

if (-not (Test-Path $envFile)) {
    Write-Warning "Không tìm thấy tệp .env tại thư mục gốc. Đang sử dụng .env.example..."
    $envFile = Join-Path $PSScriptRoot "..\.env.example"
}

if (Test-Path $envFile) {
    Write-Host "[ENV] Đang nạp các biến môi trường từ $envFile..." -ForegroundColor Cyan
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value, [System.EnvironmentVariableTarget]::Process)
            Write-Host "  -> $key" -ForegroundColor DarkGray
        }
    }
    Write-Host "[ENV] Đã nạp toàn bộ biến môi trường thành công!" -ForegroundColor Green
} else {
    Write-Error "Không tìm thấy cả .env lẫn .env.example!"
}
