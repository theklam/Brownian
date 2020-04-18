import sqlite3
from flask import Flask, render_template, g

app = Flask(__name__, static_folder="static/dist", template_folder="static")


# Helper function that connects the  the sqlite database
DATABASE = 'test.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

# Wrapper function that querys our database and returns a list of tuples 
def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

# Code to shut down database when closed? Not completely sure yet
@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

# Route to home page, currently queries database for connection reasons
@app.route("/")
def index():
    results = query_db("SELECT *, holdings.quantity*prices.price as total_value from holdings, prices where holdings.ticker = prices.ticker")
    print(results)
    return render_template("index.html")



@app.route("/login")
def login():
    
    return 


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, threaded=True)
