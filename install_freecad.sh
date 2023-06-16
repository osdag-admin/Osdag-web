#!/bin/bash

# Update the system package list
sudo apt-get update

# Install snapd package manager
sudo apt-get install snapd

# Install FreeCAD from Snap
sudo snap install freecad

# Print success message
echo "FreeCAD has been installed successfully!"
