# Dashboard kiosk (Raspberry Pi)

This folder holds the configuration-as-code for the **Raspberry Pi that shows
the dashboard on a TV**. It uses [Ansible] wrapped in a convenient [suitcase],
called [`dashboardsible`](./dashboardsible).

It does **not** deploy the dashboard application itself: the app runs on
OpenShift at <https://dash.fsd.epfl.ch> and is deployed separately. The Pi is
only a kiosk that opens that URL full-screen.

```
OpenShift (dash.fsd.epfl.ch) ──HTTPS──▶ Raspberry Pi (FullPageOS, Chromium kiosk) ──HDMI──▶ TV
```

A smart switch (Sonoff) powers the TV and the Pi on and off on a weekday
schedule. It is configured from the eWeLink app, not from this playbook.


## Prerequisites

* A Raspberry Pi running **[FullPageOS]**: a Raspberry Pi OS image that boots
  straight into Chromium in kiosk mode on a single URL.
  Install it by following the [FullPageOS README][FullPageOS]: flash the image
  to the SD card (e.g. with [Raspberry Pi Imager]), and enable SSH and set the
  `pi` user while flashing.
* SSH access to the Pi as `pi`, from the EPFL network or VPN.
* The Pi's current IP address in [`inventory/prod.yml`](./inventory/prod.yml).
  The Pi gets its address by DHCP, so it can change: check it before each run.


## TL;DR

```sh
./dashboardsible -i
```

The first run downloads Ansible into `ansible-deps-cache/`.


## What `-i` (`--install`) configures

[`roles/Dashboard/tasks/setupOs.yml`](./roles/Dashboard/tasks/setupOs.yml):

* sets the timezone to `Europe/Zurich` and the locale to `fr_CH.UTF-8`;
* stops and disables `lighttpd`, the local web server FullPageOS ships with;
* writes `https://dash.fsd.epfl.ch` to `/boot/firmware/fullpageos.txt`.
  **This file is the only place that decides which page the TV shows.**

Reboot the Pi afterwards (`ssh pi@<ip> sudo reboot`) for Chromium to pick up
the URL.


## Other options (legacy)

These date from when the app ran on the Pi in Docker. They do not match the
current setup; do not use them:

* no flag, or `-a` / `--all`: runs `setup.yml`, which installs a
  `dashboard.service` starting a local docker-compose.
* `-rb` / `--relaunchbrowser`: kills Chromium and reopens it on
  `http://localhost:3000`, which no longer serves anything.


[Ansible]: https://www.ansible.com
[suitcase]: https://github.com/epfl-si/ansible.suitcase
[FullPageOS]: https://github.com/guysoft/FullPageOS
[Raspberry Pi Imager]: https://www.raspberrypi.com/software/
