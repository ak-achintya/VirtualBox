@echo off
if not exist "target\classes" mkdir "target\classes"
"C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot\bin\javac.exe" @compile_args.txt
if %ERRORLEVEL% EQU 0 (
    echo BUILD SUCCESSFUL
) else (
    echo BUILD FAILED
)
