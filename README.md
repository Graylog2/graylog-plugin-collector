# Collector Plugin for Graylog

[![Build Status](https://travis-ci.org/Graylog2/graylog-plugin-collector.svg?branch=master)](https://travis-ci.org/Graylog2/graylog-plugin-collector)

Graylog Collector is a lightweight Java application that allows you to forward data from log files to a Graylog cluster. The collector can read local log files and also Windows Events natively, it then can forward the log messages over the network using the [GELF format](https://docs.graylog.org/en/2.5/pages/gelf.html).


> :warning: The Graylog Collector Sidecar is deprecated and can be replaced with [Graylog Sidecar](https://docs.graylog.org/en/latest/pages/sidecar.html)


**Required Graylog version:** 2.0 and later

Installation
------------

[Download the plugin](https://github.com/Graylog2/graylog-plugin-collector/releases)
and place the `.jar` file in your Graylog plugin directory. The plugin directory
is the `plugins/` folder relative from your `graylog-server` directory by default
and can be configured in your `graylog.conf` file.

Restart `graylog-server` and you are done.

Development
-----------

You can improve your development experience for the web interface part of your plugin
dramatically by making use of hot reloading. To do this, do the following:

* `git clone https://github.com/Graylog2/graylog2-server.git`
* `cd graylog2-server/graylog2-web-interface`
* `ln -s $YOURPLUGIN plugin/`
* `npm install && npm start`

Usage
-----

Please refer to the [Documentation](https://docs.graylog.org/en/2.5/pages/collector.html).


Getting started
---------------

This project is using Maven 3 and requires Java 7 or higher.

* Clone this repository.
* Run `mvn package` to build a JAR file.
* Optional: Run `mvn jdeb:jdeb` and `mvn rpm:rpm` to create a DEB and RPM package respectively.
* Copy generated JAR file in target directory to your Graylog plugin directory.
* Restart the Graylog.

Plugin Release
--------------

We are using the maven release plugin:

```
$ mvn release:prepare
[...]
$ mvn release:perform
```

This sets the version numbers, creates a tag and pushes to GitHub. Travis CI will build the release artifacts and upload to GitHub automatically.
