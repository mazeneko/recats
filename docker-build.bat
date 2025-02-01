@echo off
setlocal enabledelayedexpansion

for /f "delims=" %%A in ('node -p "require('./package.json').version"') do set VERSION=%%A

docker build -t recats:%VERSION% .
