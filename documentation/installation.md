# Installation of Osdag-Web Application

### Software Requirements : 

1. Ubuntu LTS 20.04 / 22.04
2. Git : Install Git on Ubuntu with

   ```
   # Update the Repository
   sudo apt update

   # Install Git 
   sudo apt install git
   ```
3. IDE ( **OPTIONAL** ) ( preferrably VSCode ) : Install VSCode with

   ```
   sudo snap install --classic code
   ```
4. Node v16.20.0 : Install Node from NVM by running these commands in the Terminal

   ```
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh

   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

   source ~/.bashrc

   nvm install v16.20.0
   ```



The Osdag-Web application uses 'Conda' environment which contains all the dependencies. To first download these, visit the link : [https://osdag.fossee.in/resources/downloads]() and download the ' Installer [Release: 2021-02-15] ' for Ubuntu :

1. Install both the Installer - Linux and the Installation instructions for Ubuntu files

   ![ubuntu installation](image/installation/1691117745242.png "Osdag Ubuntu Installer")
2. After successfull installation, a file with the name `Osdag_ubuntu_installer_v2021.02.a.a12f.tar.gz` will be downloaded in the 'Downloads' folder on your Ubuntu Machine. Open the terminal in the Downloads folder ( `Ctrl+Alt+T` ) and unpack the tar file with the command :

   ```
   tar -xvf Osdag_ubuntu_installer_v2021.02.a.a12f.tar.gz
   ```
3. After unzipping the file, cd into the folder `Osdag_ubuntu_installer_v2021.02.a.a12f`, open the file 0-README.txt file and follow the instructions given in the file to install the dependencies.
4. Install texlive-latex-extra packages. Open the terminal ( Ctrl + Alt + T )and run the following command :

   ```
   sudo apt-get install -y texlive-latex-extra
   ```
5. Now you have successfully installed Osdag, texLive and miniconda on your machine. Navigate to 'Desktop'
6. The next step is to clone the Osdag-Web repository on github. There are 2 ways to download the repository :

   * If you already have `git` installed on your machine, then open a new terminal in Desktop ( `Ctrl+Alt+T` ) and run the following command :

     ```
     git clone https://github.com/osdag-admin/Osdag-web.git
     ```
   * If you don't have `git` installed, then visit the Repository link : [https://github.com/osdag-admin/Osdag-web](https://github.com/osdag-admin/Osdag-web) , click on `Code` tab and download the zip file

     ![Download zip file](image/installation/Osdag_Installation_Images.png)

     After downloading the zip file, open the terminal and unzip the file :

     ```
     tar -xvf Osdag-Web-master.zip
     ```
     Move the unzipped Osdag-Web-master folder to 'Desktop' or wherever you want and rename it to 'Osdag-web'
7. Next step is to install Postgres. Open the terminal and run the following commands :

   ```
   sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

   wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

   sudo apt-get update

   sudo apt-get -y install postgresql
   ```
8. Open the Osdag-Web-master folder and open a new terminal there. Make sure you have the conda environment activated. You can know this if there is **(base)** written at the start of the terminal line. If you don't see this, activate the conda environment using :

   ```
   conda activate
   ```
9. To configure Freecad software. Navigate to the root directory of the project :

   ![Root Directory](image/installation/root_directory.png)

   And run :

   ```
   bash install_freecad.sh
   ```
10. Create Database and Role in Postgres and Configure it, open the Terminal ( Ctrl + Alt + T ):

    ```
    # To Enter into the Postgres terminal 
    sudo -u postgres psql

    # Create the Role 
    CREATE ROLE osdagdeveloper PASSWORD 'password' SUPERUSER CREATEDB CREATEROLE INHERIT REPLICATION LOGIN;

    # Create the Database
    CREATE DATABASE "postgres_Intg_osdag" WITH OWNER osdagdeveloper;

    # Exit from the Postgres terminal
    \q
    ```
11. Run the Following commnands in the Root of Osdag-web :

    ```
    # switch to develop branch 
    git checkout develop

    # Install Requirements.txt packages 
    pip install -r requirements.txt

    # Configure the Postgres database
    python populate_database.py
    python update_sequences.py
    python manage.py migrate

    # Install the Node dependencies
    cd osdagclient
    npm install
    cd ..

    # Run the Django Server 
    python manage.py runserver 8000

    # Open another terminal pointing to the root of Osdag-web 
    cd osdagclient
    npm run dev
    ```
12. Now your Server and Client are running. Navigate to [http://localhost:5173/](http://localhost:5173/) on your Browser. Now you can use the application.
