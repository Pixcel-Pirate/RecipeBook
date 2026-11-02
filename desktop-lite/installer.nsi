Unicode true
!include "MUI2.nsh"
!ifndef VERSION
  !define VERSION "dev"
!endif
Name "Recipe Book"
OutFile "RecipeImporter-Setup.exe"
InstallDir "$LOCALAPPDATA\Programs\RecipeImporter"
RequestExecutionLevel user
SetCompressor /SOLID lzma
!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"
!define MUI_FINISHPAGE_RUN "$INSTDIR\RecipeImporter.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Open Recipe Book"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

!define UNINST "Software\Microsoft\Windows\CurrentVersion\Uninstall\RecipeImporter"
!define WV2 "{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"

Section "Install"
  ; Windows won't let us replace the app while it's open.
  ; A silent install (/S) comes from the in-app update, which is quitting right now: give it up to 30 seconds.
  StrCpy $1 0
  retry:
  ClearErrors
  IfFileExists "$INSTDIR\RecipeImporter.exe" 0 copy
  Delete "$INSTDIR\RecipeImporter.exe"
  IfErrors 0 copy
  IfSilent 0 ask
  IntOp $1 $1 + 1
  IntCmp $1 30 quit 0 quit
  Sleep 1000
  Goto retry
  ask:
  MessageBox MB_RETRYCANCEL "Recipe Book is still open. Close it, then click Retry." IDRETRY retry IDCANCEL quit
  quit:
  Abort
  copy:
  SetOutPath "$INSTDIR"
  File "RecipeImporter.exe"
  File "resources.neu"
  File "icon.ico"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  CreateShortcut "$DESKTOP\Recipe Book.lnk" "$INSTDIR\RecipeImporter.exe" "" "$INSTDIR\icon.ico"
  CreateShortcut "$SMPROGRAMS\Recipe Book.lnk" "$INSTDIR\RecipeImporter.exe" "" "$INSTDIR\icon.ico"
  WriteRegStr HKCU "${UNINST}" "DisplayName" "Recipe Book"
  WriteRegStr HKCU "${UNINST}" "DisplayIcon" "$INSTDIR\icon.ico"
  WriteRegStr HKCU "${UNINST}" "Publisher" "pixcel"
  WriteRegStr HKCU "${UNINST}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${UNINST}" "UninstallString" '"$INSTDIR\Uninstall.exe"'

  ; The app draws with Microsoft Edge WebView2 (built into Windows 11 and up-to-date Windows 10).
  ReadRegStr $0 HKLM "SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\${WV2}" "pv"
  StrCmp $0 "" 0 done
  ReadRegStr $0 HKCU "Software\Microsoft\EdgeUpdate\Clients\${WV2}" "pv"
  StrCmp $0 "" 0 done
  MessageBox MB_YESNO "Recipe Book needs Microsoft Edge WebView2, which isn't on this PC yet. Open Microsoft's download page now?" /SD IDNO IDNO done
  ExecShell "open" "https://go.microsoft.com/fwlink/p/?LinkId=2124703"
  done:
  ; the in-app update reopens Recipe Book on the new version
  IfSilent 0 +2
  Exec '"$INSTDIR\RecipeImporter.exe"'
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\Recipe Book.lnk"
  Delete "$SMPROGRAMS\Recipe Book.lnk"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "${UNINST}"
SectionEnd
