<p align="center"> 
  <img src = "https://user-images.githubusercontent.com/19147922/27816506-9f15355a-60a9-11e7-98cc-585312264801.png"><br>
  Open Steel Design and Graphics <br><br>
  <a href="http://osdag.fossee.in/">Osdag on Cloud</a><br><br>
  Osdag on Cloud is a web-based free/libre and open-source software for the design (and detailing) of steel structures, following the Indian Standard IS 800:2007. It allows the user to design steel connections, members and systems using a graphical user interface. The interactive GUI provides a 3D visualisation of the designed component and an option to export the CAD model to any drafting software for the creation of construction/fabrication drawings. The design is typically optimised following industry best practices.

</p>

## Table of contents
* <a href="#quick-start">Quick start</a>
* <a href="#contribute">Contributing</a>
* <a href="#bugs">Bugs and known issues</a>
* <a href="#version">Versioning</a>
* <a href="#license">Copyright and license</a>

## <a id="user-content-quick-start" class="anchor" href="#quick-start" aria-hidden="true"></a> Quick start

<a href= "http://osdag.fossee.in/resources/downloads">Download the latest version of Osdag</a>


#### System Requirements:
    Operating System: 
        Ubuntu LTS 20.04 / 22.04
    Hardware Requirements:
        Minimum 4 Gb RAM
        Minimum of 1 Gb of free disk space
 
    This setup script is for machines running Ubuntu that do not have Miniconda3.  
    If you have Miniconda3 already installed on your computer, please skip Step/Command 1 and proceed to Step/Command 2.
 

    Installation steps:
    ===================
      Extract the downloaded installer using the Archive Manager/File-Roller, or using the following command on the bash prompt: tar -xvf Osdag_ubuntu_installer.tar.gz

      # If you have already installed the  previous version of Osdag in your system then skip Step/Command 1) and just run the new 2-install-osdag.sh.

		In bash, navigate to the extracted installation folder containing the shell 
		scripts (the folder that contains this README file) and a folder named Osdag, 
		and enter Command 1 , Command 2 and Command 3 given below.  
		 
			Note: After entering Command 1, while installing Miniconda3, you will be asked  
		whether you wish to set the system default python to Miniconda3. You need to agree  
		to this.After that you have to run command 2 in order for the 3rd command to work.
		After that execute the 3rd steps. After 3rd step completed run the command 4.Please be sure 
		to have internet connection as it's required to download some files.
			Step/Command 1:
				bash 1-install-Miniconda3-latest-Linux-x86_64.sh
			 Step/Command 2:
			bash 2-init-conda_base.sh
			Step/Command 3:
				bash 3-install-osdag.sh
			Step/Command 4:
			bash 4-install-texlive.sh


    Running Osdag:
    =============
      After the installation is complete, you may copy/move the extracted Osdag folder to a location of your choice (say, directly under your home folder). 
      You can run Osdag in two ways
      1) Using the Osdag Launcher:
          To run Osdag, navigate to the Osdag folder, double click on the file named Osdag (without any extension). 
          This file is different from Osdag_icon.ico (although both will show the Osdag logo in the grid icon view mode).
          If you are using the Unity desktop, you may also pin this launcher to the launcher sidebar.

      2) Using the Command:
          In the bash prompt, navigate to the Osdag directory and enter the following command python osdagMainPage.py

      Note that, Step/Command 2 will work only if the system default python is the one installed through Miniconda2.
      Alternatively, you may specify the (installed) python you wish to use, in Command 2.

    Running Osdag on Cloud:
    ======================
    Node v16.20.0 : Install Node from NVM by running these commands in the terminal

    sudo apt install curl
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
    source /.bashrc
    nvm install v16.20.0

    Postgres : Install Postgres by running the following commands

    sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
    sudo apt-get update
    sudo apt-get -y install postgresql

    Freecad : Install freecad with the following commands 

    cd /
    sudo apt-get update
    sudo apt-get install snapd
    sudo snap install freecad

    Setting up Osdag on Cloud

    sudo apt-get update
    sudo apt-get install -y texlive-latex-extra
    git clone https://github.com/SurajBhosale003/Osdag-web.git
    conda activate

    Enter into the Postgres Terminal
        sudo -u postgres psql
    Create a new role
        CREATE ROLE osdagdeveloper PASSWORD ’password’ SUPERUSER CREATEDB CREATEROLE INHERIT REPLICATION LOGIN;
    Create a database
        CREATE DATABASE "postgres Intg osdag" WITH OWNER osdagdeveloper;
    Exit fron the Postgres terminal
        \q

    Enter into the Osdag-web folder which you have cloned
        cd Desktop/Osdag-web
    Switch to "develop" branch
        git checkout develop
    Install requirements.txt packages
        pip install -r requirements.txt
    Configure the Postgres database
        python populate_database.py
        python update_sequence.py
        python manage.py migrate
    Install the node dependencies
        cd osdagclient
        npm install
        cd ..

    Start the Django server
        python manage.py runserver 8000
    Open another terminal, navigate to root of Osdag-web folder and run the following commands
        cd osdagclient
        npm run dev

    Now your server and client should be running. Navigate to http://localhost:5173/ on your browser.
## <a id="user-content-contribute" class="anchor" href="#bugs" aria-hidden="true"></a> Contributing
Osdag invites enthusiasts with similar interest(s) to contribute to Osdag development. Your contributions can go a long way in improving the software.
Please take a moment to review the <a href= "https://github.com/osdag-admin/Osdag/blob/master/CONTRIBUTING.md">guidelines for contributing</a>.

   * Bug reports
   * Feature requests
   * Pull requests


## <a id="user-content-license" class="anchor" href="#license" aria-hidden="true"></a> Copyright and license
(c) Copyright Osdag contributors 2020.<br>
This program comes with ABSOLUTELY NO WARRANTY. This is free software, and you are welcome to redistribute it under certain conditions. See the <a href="https://github.com/osdag-admin/Osdag/files/1207162/License.txt">License.txt</a> file for details regarding the license.
The beta version of Osdag is released under the terms and conditions of the GNU LESSER GENERAL PUBLIC LICENSE (LGPL) Version 3.

=============================== End of File ===============================
