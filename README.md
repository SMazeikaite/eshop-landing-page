# e-shop landing page

## Running the app

To run the app:
* Run `npm install -g json-server` command to install json-server globally;
* Run `json-server --watch data/db.json` command (in the project directory where `index.html` file is placed);
* Open `index.html` in the browser;

## Known issues
When using json-server one shouldn't use VS code **Live Server** plugin - this plugin interferes with async data loading and reloads page on each request.
