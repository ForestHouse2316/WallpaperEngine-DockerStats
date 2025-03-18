# Making your own wallpaper ⚙️

## Necessary things to do ⚠️

### On your repository
- ⚠️ **DO NOT SHARE CUSTOMISED VERSION OF `docker-stats-api` AS THE OFFICIAL IMAGE**.
If you want some improved features in `docker-stats-api`, it would be better to make PR.
If you need to do something you want, **make the source codes public** so that the users can build it for themselves.
This is also for security.
- Attach your STEAM Workshop URL or name to make it easy to find your wallpaper 😋

### On the STEAM Workshop
- For wallpaper setup guide, Attach this repository's URL. Users needs instruction📜🫠
If your repository also have a guide, you can use your URL!
- Unless you cannot do that, it would be better to include the url of this repository instead of saying like "Pull `foresthouse2316/docker-stats-api`".

### License
Basically follows `MPL 2.0` for all files in here.
Additionally, I hope you to follow the rules above.
That rules are not mandatory, but if you can, I hope you to follow them.


## Make a theme
Feel free to modify Vue components with your favourites!
Just change the UI using Vue. That's all.

### Adding .env.develop referring to [.env.example](../.env.example)
User-preferences are only available int WallpaperEngine.
So, in development, we need environment variables to test our project.

You can modify major and development options by making `.env.develop` file.
Copy all from `.env.example` and paste it.
Change the values to what you want.
For more information, please check the comments in `.env.example`.
> ℹ️ While `.env.example` does not affect to the project and is tracked by git, `.env.development` affects to the project and registered in `.gitignore`.



### [App.vue](../src/App.vue)
`<template>` is listing all components.
Make components and layer them from here.

And this file is containing data fetch logic, user preference listener, and toast messaging system.
You can give the data to your components with `props` system of Vue.

### Toast System
[ToastList.vue](../src/components/ToastList.vue) and [ToastMessage.vue](../src/components/ToastMessage.vue) show toast messages.
You can pop up the message via `makeToast(str)` in `App.vue`.
Message's lifetime is 5sec.
You can change this from **`ToastMessage.vue > style > .toast-life > animation duration`**, because the `finish` signal is emitted on animation ended.

While we're modifying `ToastMessage.vue`, there's nothing to change in `ToastList.vue`.
It's just a vertical layout for toast message instances.

### [StatItem.vue](../src/components/StatItem.vue)
Props:
- name: String
- value: Number
- unit: String
- autoDataUnit: Boolean

Name is stat's name such as CPU, RAM, Tx, etc.
And stat's value will be displayed with the unit you set.
Like `CPU : 50%` and `RAM : 1.23GB`.
![]()

If you set option `autoDataUnit` to true, this will automatically scale the value and the unit.
Put the value in **Bytes** unit and it'll scale your value to range [0, 1024).
(Only supports up to TerraByte level.)

> ℹ️ To be exact, KiB or MiB is the right notation
because raw values are divided with 1024 in `App.vue`.
But this used the notation that doesn't insert "i" like KB or MB to unify units of the RAM usage and others.

### API
In this section, you'll learn how to request to your server running `docker-stats-api`.\
You can use `fetch()` in JS, `request` moudle in Python to send **GET** request to your server.

> ℹ️ The examples below are written in situation with the following environment:
> - IP : 0.0.0.0
> - PORT : 1202

#### Get specific container stat
> `http://0.0.0.0:1202/{CONTAINER_NAME}`

This will return raw data of `docker.sock`'s response.\
If you want to know how to process these data, check out the links below.
- [function fetchData()](../src/App.vue) in App.vue
- [How to calculate CPU usage with docker.sock data](https://stackoverflow.com/questions/75220768/calculate-cpu-percentage-of-a-docker-container-based-on-cpustats-and-precpustats)

#### Get all container stats
> `http://0.0.0.0:1202/`

To use this API, servers should add `-e ALLOW_FETCH_ALL_CONTAINERS="true"` option when create or run docker image.

This will return stats in **list**.
This means that the raw data of response (_it's JSON_) starts with `[` character.\
This does not contains information about stopped/paused containers.


## Add new features
If you want to do more exciting things, you can modify the API server.
Make new functions, fetch those in `App.vue`, and use them!

### User properties
In `App.vue`, you can find `//user-properties sync` part.\
This is the property listener for Wallpaper Engine.\
Add your own properties option to here and in Wallpaper Engine Editor.\
Do not forget to match the key name. One in the engine, and one in the `App.vue`.

The table below shows the basic keys you need to add to the Wallpaper Engine Editor:
|Key<br/>(WallpaperEngine)|Default|Description|
|:---|:---:|:---|
|address|127.0.0.1|Server's IP address (or url when `apiport=80`)|
|apiport|1202|Opened API port. This does not have any relation with the `docker-stats-api` container's exposed port, but "Port binding" on `docker run` or `docker create`.|
|containername|docker-stats-api|Target container's name. Containers excluded by the user will return "not found" error.|
|pullinterval|5000|Stats data pulling interval. Unit is milliseconds(ms).|
|showtoast|checked|Show the toast when checked, if not, hides all.|
|debugmode|unchecked|Show the debug toast when checked. Works only when `showtoast` is checked.

You can use [project.json](../project.json) to register user properties when making wallpaper.
Modify some values in JSON and copy-paste it to wallpaper project folder. **Overlap it**.

### API Environment Variable
It's quite simple.
In [api.py](../docker-stats-api/api.py), you can find this:

```py
allow_fetch_all_containers_env = os.environ.get("ALLOW_FETCH_ALL_CONTAINERS")

# ...

ALLOW_FETCH_ALL_CONTAINERS = allow_fetch_all_containers_env.lower() == "true" if allow_fetch_all_containers_env else False
```

You can add your own ENV to here with using `os.environ.get(NAME)`.

### Functions
`docker-stats-api` is using **Flask** to implement API server.
You can add additional API request url like this:

```py
@app.route('/api/url/you/want')
def function_name():
    # something you want
```

You can get value from url by routing like this:
```py
@app.route('/<string:name>')
def stat(name):
    # this is the declaration part of the stat function in api.py
```

