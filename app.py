from flask import Flask, current_app, request
import psycopg2
import urllib.parse as urlparse
import os

url = urlparse.urlparse(os.environ['DATABASE_URL'])
dbname = url.path[1:]
user = url.username
password = url.password
host = url.hostname
port = url.port

app = Flask(__name__)

@app.route('/')
def index():
    return current_app.send_static_file('index.html')

@app.route('/stats')
def stats():
    if os.environ['ENV'] == 'prod':
        agent = request.headers.get('User-Agent')
        event = request.args.get('e')
        count = request.args.get('c')
        session_id = request.args.get('s')
        con = psycopg2.connect(
                dbname=dbname,
                user=user,
                password=password,
                host=host,
                port=port
            )
        cur = con.cursor()
        cur.execute("INSERT INTO STATISTICS (AGENT,EVENT,SESSION_ID,COUNT,LEVEL_ID,APPLICATION) VALUES ('%s','%s', '%s', %i, %i, 'village')" % (agent, event, session_id, int(count), int(count)))
        con.commit()
        con.close()
    return ''

@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, public, max-age=0"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

if __name__ == '__main__':
    app.run(threaded=True, host='0.0.0.0', port=5000)
