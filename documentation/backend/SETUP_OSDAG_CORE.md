# osdag_core Setup Guide

## Status
✅ **osdag_core is configured for direct imports via sys.path**

The `osdag_core` module is **not a pip-installable package** (no `setup.py` or `pyproject.toml`). Instead, it's configured to work via direct imports by adding the project root to Python's `sys.path` in Django settings.

## How It Works

The Django settings file (`backend/config/settings.py`) automatically adds the project root to `sys.path`, allowing direct imports:

```python
from osdag_core.design_type.connection.fin_plate_connection import FinPlateConnection
```

**Configuration Location:**
- `backend/config/settings.py` (lines ~20-25)
- Automatically adds `BASE_DIR` (project root) to `sys.path`

## Verification

To verify `osdag_core` is accessible:

```bash
# From backend/ directory
cd backend
python manage.py shell

# In Django shell:
>>> from osdag_core.design_type.connection.fin_plate_connection import FinPlateConnection
>>> print("Import successful!")
```

## Troubleshooting

### Error: "No module named 'osdag_core'"

1. **Check Django settings:**
   - Verify `backend/config/settings.py` has the `sys.path` configuration
   - Look for: `sys.path.insert(0, str(BASE_DIR))`

2. **Verify project structure:**
   ```
   Osdag-web/
   ├── osdag_core/          ← Must exist at project root
   │   ├── __init__.py      ← Should exist (created automatically)
   │   ├── design_type/
   │   └── ...
   └── backend/
       └── config/
           └── settings.py  ← Contains sys.path configuration
   ```

3. **Restart Django server:**
   ```bash
   # Stop the server (Ctrl+C) and restart
   python manage.py runserver
   ```

### Error: "ModuleNotFoundError: No module named 'pylatex'"

This is a **dependency issue**, not a path issue. Install missing dependencies:

```bash
pip install pylatex
# Or install all requirements:
pip install -r requirements.txt
```

### Error persists

1. **Check sys.path in Django shell:**
   ```python
   python manage.py shell
   >>> import sys
   >>> print(sys.path)
   # Should include your project root directory
   ```

2. **Manual verification:**
   ```python
   python manage.py shell
   >>> import osdag_core
   >>> print(osdag_core.__file__)
   # Should print path to osdag_core/__init__.py
   ```

## Why Not pip install?

`osdag_core` doesn't have a `setup.py` or `pyproject.toml`, so it cannot be installed as a package. The direct import approach via `sys.path` is:
- ✅ **Simpler**: No package installation needed
- ✅ **Faster**: No build/install step
- ✅ **Flexible**: Works immediately after cloning the repo
- ✅ **Standard**: Common pattern for monorepo projects

## Notes

- **No installation needed**: Just ensure `osdag_core/` exists at project root
- **Automatic**: Django settings handle the path configuration
- **Development**: Changes to `osdag_core` are immediately available (no reinstall)
- **Production**: Same setup works in production (no special deployment steps)

