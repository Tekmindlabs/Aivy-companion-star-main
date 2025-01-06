# D:\Aivy\Aivy-Tutor\setup.py
from setuptools import setup, find_packages

setup(
    name="aivy-tutor",
    version="0.1.0",
    packages=find_packages(where="lib/memory/python"),
    package_dir={"": "lib/memory/python"},
    install_requires=[
        "mem0",
        "google-generativeai",
        "jina",
        "qdrant-client",
    ],
)