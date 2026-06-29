for var in useEngineeringModule useProjectCreation useLocation useParams useProjectLoader deleteAllCustomSections expandAllSelectedInputs MODULE_KEY_FIN_PLATE useViewCamera MODULE_KEY_CLEAT_ANGLE MODULE_KEY_END_PLATE MODULE_KEY_BEAM_COLUMN_END_PLATE openOsiFile loadStateFromOsi getDesignPrefModuleConfig canOpenAdditionalInputs downloadCachedModelByFormat downloadExportCadResponse downloadGroupedInputsCsv; do
  echo "Finding import for $var..."
  grep -r "^import .*$var.* from" frontend/src | head -n 1
done
