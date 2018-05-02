# Development Tooling

## Prerequisites

The tool chain for setting up a wicked development environment has primarily been tested on macOS 10.13, and may have issues on other operating systems. If you run into issues, please feel free to report them, or even file pull requests against this repository.

Still, the following are the current known prerequisites:

* node.js 8
* A `bash` compatible shell
* A recent Docker installation, presumably Docker for Mac or Docker for Windows, or a `docker` installation (with `docker-compose`) on Linux
* `git`
* A good internet connection
* [PM2](http://pm2.keymetrics.io) installed globally: `npm install -g pm2`
* **Important**: Your local machine needs an IPv4 address, such as a `10.x`, a `192.168.x` or similar; this means you cannot develop wicked without being connected to a network of some kind.

## Setting up the environment

### Step 1: Clone all the repositories

To get your wicked development environment up and running as fast as possible, perform the following steps in a new blank directory, which is presumed to be called `wicked` here:

```bash
~/Projects$ mkdir wicked
~/Projects/wicked$ cd wicked
~/Projects/wicked$ git clone https://github.com/apim-haufe-io/wicked.portal-tools
...
~/Projects/wicked$ cd wicked.portal-tools/development
~/Projects/wicked/wicked.portal-tools/development$ ./checkout.sh <branch> --install
```

Please replace `<branch>` with the branch you want to check out. Please note that these scripts will only work as intended for wicked 1.0 and later, and not for the 0.x releases. As soon as wicked 1.0.0 has been released, the usual branch will be `next`, and until then, use

```
~/Projects/wicked/wicked.portal-tools/development$ ./checkout.sh wicked_1_0 --install
```

This will checkout all repositories which are needed to run wicked locally, plus install all the necessary `node_modules`. This may take a while, but it's mostly only the first time.

### Step 2: Build a local Kong image

As wicked adds a couple of minor things to the original Kong docker image, you will need to build your Kong image locally before you can start it:

```
~/Projects/wicked/wicked.portal-tools/development$ ./build-kong.sh
```

This will create a local docker image (on your machine) called `wicked.kong:local`; this image will be referenced to in the next step (in the [`docker-compose.yml`](docker-compose.yml) file).

### Step 3: Start a local Postgres, Redis and Kong instances

Now it's assumed that you have a local `docker` daemon running, and that you have a recent `docker-compose` binary in your path. Then just run:

```bash
~/Projects/wicked/wicked.portal-tools/development$ docker-compose up -d
Creating network "development_default" with the default driver
Creating development_redis_1         ... done
Creating development_kong-database_1 ... done
Creating development_kong_1          ... done
```

**NOTE**: This assumes that the ports 5432 (Postgres), 6379 (Redis), 8000 and 8001 (Kong) are not already used on your local machine.

### Step 4: Use pm2 to start wicked locally

Now you can start wicked using pm2:

```
~/Projects/wicked/wicked.portal-tools/development$ pm2 start wicked-pm2.config.js 
[PM2][WARN] Applications portal-api, portal, portal-kong-adapter, portal-auth not running, starting...
[PM2] App [portal-api] launched (1 instances)
[PM2] App [portal] launched (1 instances)
[PM2] App [portal-kong-adapter] launched (1 instances)
[PM2] App [portal-auth] launched (1 instances)
┌─────────────────────┬────┬──────┬───────┬────────┬─────────┬────────┬─────┬───────────┬─────────┬──────────┐
│ App name            │ id │ mode │ pid   │ status │ restart │ uptime │ cpu │ mem       │ user    │ watching │
├─────────────────────┼────┼──────┼───────┼────────┼─────────┼────────┼─────┼───────────┼─────────┼──────────┤
│ portal              │ 1  │ fork │ 44863 │ online │ 0       │ 0s     │ 23% │ 20.8 MB   │ martind │ disabled │
│ portal-api          │ 0  │ fork │ 44862 │ online │ 0       │ 0s     │ 37% │ 22.9 MB   │ martind │ disabled │
│ portal-auth         │ 3  │ fork │ 44870 │ online │ 0       │ 0s     │ 14% │ 18.3 MB   │ martind │ disabled │
│ portal-kong-adapter │ 2  │ fork │ 44868 │ online │ 0       │ 0s     │ 21% │ 20.4 MB   │ martind │ disabled │
└─────────────────────┴────┴──────┴───────┴────────┴─────────┴────────┴─────┴───────────┴─────────┴──────────┘
```

The API portal will be available at [http://localhost:3000](http://localhost:3000). Note that the wicked portal will immediately redirect to the IP address of your local machine instead of using the `localhost` alias. This has various reasons, the most important one being that Kong must be able to reach the services run via pm2, such as `portal-api:3001`. This is only possible if Kong actually knows the local IP.
