@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Batch Script for Windows
@REM ----------------------------------------------------------------------------
@echo off
setlocal

set "WRAPPER_DIR=%~dp0"
set "MAVEN_VERSION=3.9.9"
set "USER_HOME=%USERPROFILE%"
set "WRAPPER_STORE=%USER_HOME%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%-bin"
set "MAVEN_HOME=%WRAPPER_STORE%\apache-maven-%MAVEN_VERSION%"

if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    goto :EXECUTE
)

echo [INFO] Maven not found in %MAVEN_HOME%. Downloading Apache Maven %MAVEN_VERSION%...
if not exist "%WRAPPER_STORE%" mkdir "%WRAPPER_STORE%"

powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip', '%WRAPPER_STORE%\apache-maven-%MAVEN_VERSION%-bin.zip')"
if errorlevel 1 (
    echo [ERROR] Failed to download Maven %MAVEN_VERSION%.
    exit /b 1
)

echo [INFO] Extracting Apache Maven %MAVEN_VERSION%...
powershell -Command "Expand-Archive -Path '%WRAPPER_STORE%\apache-maven-%MAVEN_VERSION%-bin.zip' -DestinationPath '%WRAPPER_STORE%' -Force"
if errorlevel 1 (
    echo [ERROR] Failed to extract Maven %MAVEN_VERSION%.
    exit /b 1
)

:EXECUTE
"%MAVEN_HOME%\bin\mvn.cmd" %*
exit /b %ERRORLEVEL%
