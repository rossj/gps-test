# gps-test

This project runs test schenarios against Google Cloud Pub/Sub, in an effort to isolate and reproduce issues relating to duplicate messages and message ack requests that fail.

I've placed some scenario results in `./results`

# Usage
First, to install dependencies, run

```
> npm install
```

Then, edit one or more test run configurations in `scenarios.json`.

You will need to place a Google Cloud key in `key.json`. This account should have Pub/Sub `admin` privileges in order to create a test Topic and Subscription.

When ready, run
```
> tsc
```
followed by
```
> node .\dist\src\index.js
```

After an hour, the test run should complete and you can check the resultant graphs in Stackdriver.