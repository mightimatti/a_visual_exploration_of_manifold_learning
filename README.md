# A Visual Exploration of Manifold Learning for Images


## About
This repository contains the results of my work on final project of the Sapienza "Visual Analytics" MSc Computer engineering course.

## Installation
### React
- `cd frontend` 
- `npm install package.json --legacy-peer-deps` (this is required as `react-vis` is sadly deprecated, yet compatible with React 17)
- `npm run start`

### Python
- `cd embedding_backend` 
- `python3 -m venv venv`
- `source venv/bin/activate`
- `pip install -r requirements.txt`
- `python server.py`

Both applications need to be running at the same time for the prototype to function properly 