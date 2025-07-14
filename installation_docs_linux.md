# now give the entire steps. all 20+ steps to install in linux(ubuntu) cleary. i am making documentation. also mention the errors we might find how to fix them at last

Here is a **comprehensive, step-by-step guide to installing and configuring Osdag-web on Ubuntu/Linux**, covering all the steps from your Windows script (including database setup, dependency installation, code fixes, and configuration changes). At the end, you'll find a troubleshooting section listing common errors and their solutions.

---

## **Osdag-web Installation Steps on Ubuntu/Linux**

### **1. Update System Packages**

```bash
sudo apt update
sudo apt upgrade
```


---

### **2. Install System Build Tools**

```bash
sudo apt install -y build-essential cmake
```

*These are required for compiling dependencies.*

---

### **3. Install Git (if not already installed)**

```bash
sudo apt install -y git
```


---

### **4. Install Miniconda (if not already installed)**

```bash
# Download Miniconda installer
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh

# Run the installer
bash Miniconda3-latest-Linux-x86_64.sh

# Follow prompts, say 'yes' to initialize Miniconda
```

*Restart your terminal after installation.*

---

### **5. Clone the Osdag-web Repository**

```bash
git clone https://github.com/osdag-admin/Osdag-web.git
cd Osdag-web
```

*Or download and extract the zip, then `cd` into the folder.*

---

### **6. Create and Activate a Conda Environment**

```bash
conda create -n osdag-env python=3.9
conda activate osdag-env
```


---

### **7. Install Python Dependencies from requirements.txt**

```bash
pip install -r requirements.txt
```

*If any package fails, try installing it manually with pip or conda.*

---

### **8. Install Additional Conda and Pip Packages**

```bash
conda install -c conda-forge pythonocc-core pylatex
pip install psycopg2-binary django numpy pandas matplotlib
```


---

### **9. Install TeX Live (for PDF/LaTeX features)**

```bash
sudo apt install -y texlive-latex-extra
```


---

### **10. Install FreeCAD (if required by Osdag)**

```bash
sudo apt install -y snapd
sudo snap install freecad
```


---

### **11. Install PostgreSQL**

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```


---

### **12. Create PostgreSQL User and Database**

```bash
sudo -u postgres psql
```

At the `psql` prompt, run:

```sql
CREATE ROLE osdagdeveloper PASSWORD 'password' SUPERUSER CREATEDB CREATEROLE INHERIT REPLICATION LOGIN;
CREATE DATABASE "postgres_Intg_osdag" WITH OWNER osdagdeveloper;
\q
```


---

### **13. Update Django Database Settings**

Edit `osdag_api/settings.py` (or wherever your Django DB config is):

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres_Intg_osdag',
        'USER': 'osdagdeveloper',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```


---

### **14. Update Database Credentials in Python Scripts**

Edit any scripts that connect directly to the database (like `populate_database.py`, `update_sequences.py`):

```python
conn = psycopg2.connect(
    dbname='postgres_Intg_osdag',
    user='osdagdeveloper',
    password='password',
    host='localhost',
    port=5432
)
```

*Search for `psycopg2.connect` and update the parameters accordingly.*

---

### **15. Fix Typing Import in module_finder.py**

Open `osdag_api/module_finder.py` and ensure the top imports look like:

```python
from typing import Dict, Any, List
from typing_extensions import Protocol as _Protocol
```

*Remove `_Protocol` from any `from typing import ...` line.*

---

### **16. Switch to the winter24 Branch**

```bash
git checkout winter24
```

*If you need the latest development features.*

---

### **17. Run Database Setup and Migrations**

```bash
python populate_database.py
python update_sequences.py
python manage.py migrate
```


---

### **18. Install Node.js and NPM (for frontend)**

```bash
sudo apt install -y nodejs npm
```


---

### **19. Install Frontend Dependencies**

```bash
cd osdagclient
npm install
cd ..
```


---

### **20. Run the Django Server**

```bash
python manage.py runserver 8000
```

*Visit `http://localhost:8000` in your browser.*

---

### **21. Install and Launch pgAdmin**

```bash
sudo apt install -y pgadmin4
pgadmin4
```

*Use pgAdmin for graphical database management.*

---

### **22. Install Any Other Required Tools**

*Refer to Osdag-web documentation for any project-specific requirements.*

---

## **Troubleshooting \& Common Errors**

| Error Message | Likely Cause | Solution |
| :-- | :-- | :-- |
| `psycopg2.OperationalError: FATAL: password authentication failed` | Wrong DB username/password | Double-check credentials in `settings.py` and scripts |
| `ModuleNotFoundError: No module named ...` | Missing Python package | Run `pip install <package>` or `conda install <package>` |
| `ERROR: Could not build wheels for ...` | Missing build tools | Ensure `build-essential` and `cmake` are installed |
| `django.db.utils.OperationalError: FATAL: database ... does not exist` | Wrong DB name or not created | Check DB name in `settings.py` and that DB exists in PostgreSQL |
| `Permission denied` when running scripts | Lack of executable permissions | Run `chmod +x script.sh` or use `sudo` if needed |
| `pip: command not found` | pip not installed in conda env | Run `conda install pip` |
| `ImportError: cannot import name '_Protocol'` | Typing import issue | Fix imports in `module_finder.py` as described above |
| `pgAdmin4 fails to launch` | Missing dependencies | Try running `sudo apt --fix-broken install` and reinstall pgAdmin4 |
| `npm: command not found` | Node.js/NPM not installed | Run `sudo apt install nodejs npm` |


---

## **Summary Table: Key Steps**

| Step | Task |
| :-- | :-- |
| 1 | Update system packages |
| 2 | Install build tools |
| 3 | Install git |
| 4 | Install Miniconda |
| 5 | Clone Osdag-web repo |
| 6 | Create/activate conda env |
| 7 | Install Python dependencies |
| 8 | Install extra conda/pip packages |
| 9 | Install TeX Live |
| 10 | Install FreeCAD |
| 11 | Install PostgreSQL |
| 12 | Create DB/user in PostgreSQL |
| 13 | Update Django settings.py |
| 14 | Update DB creds in scripts |
| 15 | Fix typing import in module_finder.py |
| 16 | Checkout develop branch |
| 17 | Run DB setup/migrations |
| 18 | Install Node.js/NPM |
| 19 | Install frontend deps |
| 20 | Run Django server |
| 21 | Install/launch pgAdmin |
| 22 | Install extra tools |


---

**This guide covers all steps found in your Windows script, adapted for Ubuntu/Linux, including all code and configuration changes required for a successful setup.**
If you encounter any issues, refer to the troubleshooting section above for solutions.