# Brownian

## About:
Stock portfolio analytics and visualization tool

## Main Technologies:
* Python
* pip
* Flask
* Javascript
* ReactJS
* NPM
* webpack
* CSS
* HTML
* D3
* sqlite
* React Router

## Building the application:

1) create virtual environment (we use venv to avoid dependency conflicts):  
```$ virtualenv -p python3.7 venv```

2) activate virtual environment:  
```$ source venv/bin/activate```

3) use pip to install the requirements of the server:  
```$ pip install -r requirements.txt```

4) change directory to static folder:  
```$ cd static```

5) install front end dependencies:  
```
$ npm install  
```

5) build the front end (we use 'npm run watch' to avoid building the front end everytime a change is made):  
```$ npm run watch```  

6) change to main directory:  
```$ cd ..```

7) run the server:  
```$ python app.py```

7) access via browser ```http://0.0.0.0/``` and you are good to go :)
