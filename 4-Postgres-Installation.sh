#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################

#! /bin/bash
echo "Hello world"

cd ~

pwd


databaseName=postgres_Intg_osdag
user=osdagdeveloper
password=password
host=127.0.0.1
port=5432

echo $host

# Create the file repository configuration:
echo "Creating the File repository configuration"
command1=`sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'`
{
    # try 
    echo $command1
    echo "Success : Configurated"
} || {
    # catch
    echo "Error while configuring the repository"
}


# Import the repository signing key:
echo "Importing the Repository signing key"
command2=`wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -`
{
    # try
    echo $command2
    echo "Success : Signing key imported"
} || {
    # catch
    echo "Error while Importing the signing key"
}


# # Update the package lists:
echo "Updating the package lists"
command3=`sudo apt-get update`
{
    # try 
    echo $command3
    echo "Success : Updated the package list"
} || {
    echo "Error while Updating the package list"
}


# Install the latest version of PostgreSQL.
# If you want a specific version, use 'postgresql-12' or similar instead of 'postgresql':
echo "Installing PostgreSQl version 15.3"
command4=`sudo apt-get -y install postgresql-15`
{
    # try
    echo $command4
    echo "Success : PostgreSQL ( version : 15.3 ) installed"
} || {
    # catch
    echo "Error while installing PostgreSQL"
}

echo "finished"




