from flask import Flask, current_app, request
from stats import store
import os

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
        store(cid=session_id, agent=agent, app='village', info=event, value=count)
    return ''

@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, public, max-age=0"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

if __name__ == '__main__':
    app.run(threaded=True, host='0.0.0.0', port=4000)
