for var in useDockPanels useHover; do
  echo "Finding import for $var..."
  grep -r "^import .*$var.* from" frontend/src | head -n 1
done
