for var in React useState useRef useEffect useMemo useCallback useNavigate message Modal Radio Button Spin Dropdown Menu Tooltip BaseInputDock BaseOutputDock CadViewer Logs FloatingNavBar DesignReportModal CustomizationModal DesignPrefSections DesignStatusModal HelpLinkModal AboutOsdagModal XlsxImportTrigger DESIGN_STATUS UI_STRINGS DESIGN_EXAMPLES_URL ASK_QUESTION_LINK useViewport useEngineeringShortcuts downloadGroupedOutputsCsv MODULE_KEY_SEAT_ANGLE UnifiedDropdownMenu; do
  echo "Finding import for $var..."
  grep -r "^import .*$var.* from" frontend/src | head -n 1
done
