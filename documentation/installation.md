# Installation of Osdag-Web Application

The Osdag-Web application uses 'Conda' environment which contains all the dependencies. To first download these, visit the link : [https://osdag.fossee.in/resources/downloads]() and download the ' Installer [Release: 2021-02-15] ' for Ubuntu :

1. Install both the Installer - Linux and the Installation instructions for Ubuntu files

   ![ubuntu installation](image/installation/1691117745242.png "Osdag Ubuntu Installer")
2. After successfull installation, a file with the name `Osdag_ubuntu_installer_v2021.02.a.a12f.tar.gz` will be downloaded in the 'Downloads' folder on your Ubuntu Machine. Open the terminal in the Downloads folder ( `Ctrl+Alt+T` ) and unpack the tar file with the command :

   ```
   tar -xvf Osdag_ubuntu_installer_v2021.02.a.a12f.tar.gz
   ```
3. After unzipping the file, cd into the folder `Osdag_ubuntu_installer_v2021.02.a.a12f`, open the file 0-README.txt file and follow the instructions given in the file to install the dependencies.
4. Now you have successfully installed Osdag, texLive and miniconda on your machine. Navigate to 'Desktop'
5. The next step is to clone the Osdag-Web repository on github. There are 2 ways to download the repository :

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
     Move the unzipped Osdag-Web-master folder to 'Desktop' or wherever you want
6. Next step is to install Postgres. Open the terminal and run the following commands :

   ```
   sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

   wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

   sudo apt-get update

   sudo apt-get -y install postgresql
   ```
7. Now install Pgadmin ( **OPTIONAL** ). Open the terminal and run the following commands :

   ```
   curl -fsS https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo gpg --dearmor -o /usr/share/keyrings/packages-pgadmin-org.gpg

   sudo sh -c 'echo "deb [signed-by=/usr/share/keyrings/packages-pgadmin-org.gpg] https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list && apt update'

   sudo apt install pgadmin4

   sudo apt install pgadmin4-desktop

   sudo /usr/pgadmin4/bin/setup-web.sh
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
10. Run the Following commnands in the Root of Osdag-web :

    ```
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
11. Now your Server and Client are running. Navigate to [http://localhost:5173/](http://localhost:5173/) on your Browser. Now you can use the application.
