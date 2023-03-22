import requests
import os
STATS_URL = os.environ['STATSURL']

def store(cid, agent, app, info, value):
    PARAMS = {
        'clientid':cid,
        'agent':agent,
        'app':app,
        'info':info,
        'value':value
    }
    r = requests.get(url = STATS_URL, params = PARAMS)
    return