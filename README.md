# Brownian

## About:
Brownian allows users to manage a theoretical portfolio before risking real money. It also allows users who already have a real portfolio to manage it more effectively by presenting detailed analytics about their portfolio’s past and projected performances.

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
```$ npm install```

5) build the front end (we use 'npm run watch' to avoid building the front end everytime a change is made):  
```$ npm run watch```  

6) change to main directory:  
```$ cd ..```

7) run the server:  
```$ python app.py```

7) access via browser ```http://0.0.0.0/``` and you are good to go :)

## Note about Visualize Page

The visualize page graphs use your portfolio value 1 month ago as its first data point, so if you create a new account you will not see your portfolio's monthly performance (as it did not exist until you created the account). If you want to see an example of the feature you can log in with username: bryan password: xian
