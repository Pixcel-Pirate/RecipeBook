Unicode true
!include "MUI2.nsh"
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
  WriteRegStr HKCU "${UNINST}" "DisplayVersion" "1.0.0"
  WriteRegStr HKCU "${UNINST}" "UninstallString" '"$INSTDIR\Uninstall.exe"'

  ; The app draws with Microsoft Edge WebView2 (built into Windows 11 and up-to-date Windows 10).
  ReadRegStr $0 HKLM "SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\${WV2}" "pv"
  StrCmp $0 "" 0 done
  ReadRegStr $0 HKCU "Software\Microsoft\EdgeUpdate\Clients\${WV2}" "pv"
  StrCmp $0 "" 0 done
  MessageBox MB_YESNO "Recipe Book needs Microsoft Edge WebView2, which isn't on this PC yet. Open Microsoft's download page now?" IDNO done
  ExecShell "open" "https://go.microsoft.com/fwlink/p/?LinkId=2124703"
  done:
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\Recipe Book.lnk"
  Delete "$SMPROGRAMS\Recipe Book.lnk"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "${UNINST}"
SectionEnd
