#!/usr/bin/env python3
"""
Setup script for The Transparent Compiler
"""
import os
import subprocess
import sys

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"Running: {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    print("Setting up The Transparent Compiler...")
    print("=" * 50)
    
    # Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        return False
    
    # Run Django migrations
    if not run_command("python manage.py migrate", "Running database migrations"):
        return False
    
    # Collect static files (if needed in production)
    # run_command("python manage.py collectstatic --noinput", "Collecting static files")
    
    print("\n" + "=" * 50)
    print("Setup completed successfully!")
    print("\nTo start the development server, run:")
    print("python manage.py runserver")
    print("\nThen open your browser to: http://127.0.0.1:8000")

if __name__ == "__main__":
    main()