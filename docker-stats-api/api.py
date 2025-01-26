from flask import Flask, make_response, jsonify
from flask_cors import CORS
import docker
import orjson
import asyncio
import os

app = Flask(__name__)
CORS(app)

# Get ENV
allow_fetch_all_containers_env = os.environ.get("ALLOW_FETCH_ALL_CONTAINERS")
excludes_env = os.environ.get("EXCLUDES")
save_network_usage_env = os.environ.get("SAVE_NETWORK_USAGE")

# If you want to make like to the list-shaped container stats view, set True. Defaultely False for security.
ALLOW_FETCH_ALL_CONTAINERS = allow_fetch_all_containers_env.lower() == "true" if allow_fetch_all_containers_env else False
# The container whose name is in this list will be hidden from all API requests.
EXCLUDES = excludes_env.split(",") if excludes_env else []
# Return basic informations only to reduce network usage. This option consumes a little more computing power.
SAVE_NETWORK_USAGE = 0 # NOT IMPLEMENTED
if save_network_usage_env:
    if save_network_usage_env in ["1", "compatible"]:
        SAVE_NETWORK_USAGE = 1
    elif save_network_usage_env in ["2", "extreme"]:
        SAVE_NETWORK_USAGE = 2


client = docker.from_env()
api_client = docker.APIClient(base_url='unix://var/run/docker.sock')

async def get_stat(container):
    try:
        stats = await asyncio.to_thread(api_client.stats, container.id, stream=False)
        return stats
    except docker.errors.APIError as e:
        return {"error": str(e), "container_name": container.name}
    except Exception as e:
        return {"error": str(e), "container_name": container.name}


@app.route('/')
def stat_all():
    if (not ALLOW_FETCH_ALL_CONTAINERS):
        return jsonify({"error": "ALLOW_FETCH_ALL_CONTAINERS is False. If you want to, set that option to 'True'."}), 503

    try:
        containers = client.containers.list()

        async def run_tasks():
            tasks = [get_stat(container) for container in containers if container.name not in EXCLUDES]
            return await asyncio.gather(*tasks)
        
        with app.app_context():
            stats = asyncio.run(run_tasks())

        response = make_response(orjson.dumps(stats))
        response.content_type = 'application/json'
        return response


    except docker.errors.APIError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/<string:name>')
def stat(name):
    if (name in EXCLUDES):
        return jsonify({"error": f"Cannot find container {name}"}), 404

    containers = client.containers.list()
    for container in containers:
        if (container.name == name):
            with app.app_context():
                stats = asyncio.run(get_stat(container))
            
            response = make_response(orjson.dumps(stats))
            response.content_type = 'application/json'
            return response
    else:
        return jsonify({"error": f"Cannot find container {name}"}), 404

if __name__ == '__main__':
    from waitress import serve
    serve(app, host='0.0.0.0', port=1202)