# User Guide (Installation) 😊

## Pull the image or build it manually 🖼️
> [!caution]
> **Note that only `foresthouse2316/docker-stats-api` is the official image for now.**\
**DO NOT DOWNLOAD OR USE THAT FROM OTHER SITES OR UNKNOWN SOURCES ⚠️**\
It might harm your server and take permission about your docker.

### Pull from Docker Hub 🐋
Download the API contianer image from docker hub.\
[Go to Docker Repository >](https://hub.docker.com/r/foresthouse2316/docker-stats-api)
```bash
docker pull foresthouse2316/docker-stats-api
```
This will pull ARM64 or AMD64 version according to your platform.

### Build and create manually 🔧
If you can't even trust that image, you can make it for yourself.\
[This docker-stats-api folder](../docker-stats-api) has all files to build the container.\
Download the folder and execute this:
```bash
# Execute below in the folder 'docker-stats-api'
docker build -t docker-stats-api . --no-cache
```

> [!tip]
> If you built the image manually, you should not type `foresthouse2316/docker-stats-api` since it's the docker hub image.
> Type only `docker-stats-api`!


## Create container with options 🔨

Now you can create the container from that image we just pulled(or built).
```bash
docker run -d -p 1202:1202 -v /var/run/docker.sock:/var/run/docker.sock --name docker-stats-api foresthouse2316/docker-stats-api
```

There are some options you can set.\
You can set them with `-e` argument of docker command, and `-e` can be written multiple times.
```bash
docker run -d -p 1202:1202 -e ENV1="VAL1" -e ENV2="VAL2" --restart unless-stopped -v /var/run/docker.sock:/var/run/docker.sock --name docker-stats-api foresthouse2316/docker-stats-api
```
|ENV Name|Value|Default|Description|
|:---:|:---:|:---:|:---|
|ALLOW_FETCH_ALL_CONTAINERS|boolean|false|If true, `http://IP_ADDRESS:1202/` will return all container stats.|
|EXCLUDES|comma_separated<br/>string|""|Hides containers whose name is in this list.<br/>Separate container names like `-e EXCLUDES="a,b,c,d"`.|
|SAVE_NETWORK_USAGE|**0**<br/>**1**(_compatible_)<br/>**2**(_extreme_)|0|**NOT IMPLEMENTED** ⚠️<br/>**0** returns the raw value of the docker stats.<br/>**1(compatible mode)** returns necessary keys: `cpu_stats`, `memory_stats`, and etc.<br/>**2(extreme mode)** returns pre-calculated values.|
|SHUTDOWN_TIME|seconds|86400<br/>_(=3600\*24)_|Automatically stop the server with SIGINT.<br/>You should set the API container's restart policies as `unless-stopped`.<br/>You can turn off this by `-e SHUTDOWN_TIMER="0"`.|

> [!note]
> **SAVE_NETWORK_USAGE** option returns these values in 1(compatible mode) and 2(extreme mode)
> 1. `stat.cpu_stats`, `stat.precpu_stats`,
> `stat.memory_stats.usage`,
> `stat.networks[all adapters].tx_bytes`, `stat.networks[all adapters].rx_bytes`,
> `stat.blkio_stats.io_service_bytes_recursive`
> 2. Pre-calculated values with CSV format (`cpu,ram,tx,rx,read,write`).
> Network and IO stats are aggregate values.

This is the example:
```bash
docker run -d -p 1202:1202 -e EXCCLUDES="docker-stats-api" -e ALLOW_FETCH_ALL_CONTAINERS="true" --restart unless-stopped -v /var/run/docker.sock:/var/run/docker.sock --name docker-stats-api foresthouse2316/docker-stats-api
```
> [!warning]
> There's a bug that continuous container stop with `excited with 137`. Before I find the reason, please make sure you have set the restart policies as `unless-stopped`. This will temporarily protect the API server from intermittent shutdowns.

## Open firewall 🧱

The API port number is `1202` if you did not changed it when you start `docker-stats-api`.

Open your operating system's firewall.\
For example, in Ubuntu with `iptables`:

```bash
sudo iptables -A INPUT -p tcp --dport 1202 -j ACCEPT
```

Or you can change the priority of this rule to first if there's a problem.\
(Some IaaS set the ALL-BLOCKING rule in the VM's firewall rules)

```bash
sudo iptables -I INPUT 1 -p tcp --dport 1202 -j ACCEPT
```

If you are using IaaS (AWS, Oracle, Azure...), **open same port it in the cloud management window.**


## [Take a look at the wallpaper list](./WallpaperRepos.md) and subscribe it on STEAM 📥
Choose the wallpapers you want.
[**Here**](./WallpaperRepos.md)'s the list of repositories that made by using this repository.


## Type server information on WallpaperEngine 🖥️
Select the downloaded wallpaper in WallpaperEngine.
Then you will be able to see some options like this:

![](./images/UserProperties.png)

Input the server address, port number, and other information about your server to receive the docker stats data.


## Troubleshooting 🤯


### Modify access permission of the socket 🔑

If the container cannot access to your `docker.sock`, let's add the permission:
```bash
sudo chmod 660 /var/run/docker.sock # this is a default status of docker.sock

sudo chmod 666 /var/run/docker.sock # try this, and if works, add user to group 'docker'
```


### Ping to API Port 🏓
Try ping to the port or check the port's openness from outside of your server.

And, also check this checklist:
- Did you typed `iptables` command correctly?
- Is your rule for port `1202` (or your customised one) is preceding other rules like `REJECT 0.0.0.0`?
- Are you using IaaS? Is there any firewall system else?
- Is port already occupied to another process?


### Fetch timeout error on the low interval 🕑
Requesting stats data too quickly is a DDoS attack to your server.
If your API server cannot handle your pull interval, it will be result in timeout error on fetch method.
Then, you can find your server's minimum interval with **debug mode**.

Turn on `Show Toast` and `Debug Mode` options.
And adjust your interval when toast messages pop up like this:

![](./images/AdjustPullInterval.png)

When the toast messages following `GET > Fetched > Value Updated` sequence, you can use without timeout error.
But if order is not like that, it will cause a number of errors soon.

> [!note]
> Even if the toast messages following that sequence, timeout error may occur intermittently if your server or local computer is overloaded.
