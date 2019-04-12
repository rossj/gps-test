## Summary

This scenario started with publishing 20 batches of 100 messages, waited 5 minutes, and then started acking at about 1 per second.

Note that the "received rate" graph below uses the Node client's internal queuing / management to deliver 1 message a time. Subscriber actually received periodic batches of ~100 messages.

After about 38 minutes of subscribing, near the end of the 2000 messages, the subscriber received a batch of 100 duplicate messages with duplicate ack ids. All of these duplicate messages then started giving "expired" response to acking. The batches of 100 cycled between being duplicate and non-duplicate until all messages were succesfuly ackd.

## Scenario

```JSON
{
    "name": "20x100 publish batch",
    "publisherClientOptions": {
        "grpc.http2.lookahead_bytes": 4096,
        "grpc.http2.bdp_probe": 0
    },
    "publisherTopicOptions": {
        "batching": {
            "maxMessages": 100,
            "maxMilliseconds": 100
        }
    },
    "subscriberSubscriptionOptions": {
        "ackDeadline": 30,
        "flowControl": {
            "maxMessages": 1,
            "allowExcessMessages": false
        },
        "streamingOptions": {
            "maxStreams": 1
        }
    },
    "subscriptionAckDeadlineSeconds": 10,
    "processingTimeMilliseconds": 1000,
    "subscriberCount": 1,
    "subscriberStartDelayMinutes": 5,
    "messageBytes": 50,
    "publisherCount": 1,
    "initialMessageCount": 2000,
    "messagesPerPublishBatch": 0,
    "batchesPerMinute": 0.5,
    "publishDurationMinutes": 0,
    "testDurationMinutes": 60
}
```

## Graphs

- Topic: `gps-test-topic-e4e4c72c50`
- Subscription: `gps-test-sub-d8f673dbfa`

![Acknowledge Requests](Acknowledge Requests.png)

![StreamingPull Operations](StreamingPull Operations.png)

![Undelivered Messages](Undelivered Messages.png)

![Oldest Unacknowledged Message](Oldest Unacknowledged Message.png)

## Output

```
Scenario constant time:
Total duration: 59.95 minutes
Published messages: 2000
Total received messages: 2200
Unique received internal IDs: 2000
Unique acked internal IDs: 2000
Duplicate received messages: 200
Time until first duplicate: 39.25 minutes
Number of errors: 0
Time until first error: N/A
Time since last message: 13.11 minutes
Received messages per minute:
      53.00 ┼     ╭─╮╭─╮╭╮╭╮╭─╮╭╮╭─╮╭╮╭╮╭─╮╭╮╭─╮╭╮╭╮╭─╮╭─╮
      52.00 ┤     │ ╰╯ ╰╯╰╯╰╯ ╰╯╰╯ ╰╯╰╯╰╯ ╰╯╰╯ ╰╯╰╯╰╯ ╰╯ ╰╮
      51.00 ┤    ╭╯                                       │
      50.00 ┤    │                                        │
      49.00 ┤    │                                        │
      48.00 ┤    │                                        │
      47.00 ┤    │                                        │
      46.00 ┤    │                                        │
      45.00 ┤    │                                        ╰╮
      44.00 ┤    │                                         │
      43.00 ┤    │                                         │
      42.00 ┤    │                                         │
      41.00 ┤    │                                         │
      40.00 ┤    │                                         │
      39.00 ┤    │                                         │
      38.00 ┤    │                                         │
      37.00 ┤    │                                         │
      36.00 ┤    │                                         │
      35.00 ┤    │                                         │
      34.00 ┤    │                                         │
      33.00 ┤    │                                         │
      32.00 ┤    │                                         │
      31.00 ┤    │                                         │
      30.00 ┤    │                                         │
      29.00 ┤    │                                         │
      28.00 ┤    │                                         │
      27.00 ┤    │                                         │
      26.00 ┤    │                                         │
      25.00 ┤    │                                         │
      24.00 ┤    │                                         │
      23.00 ┤    │                                         │
      22.00 ┤    │                                         │
      21.00 ┤    │                                         │
      20.00 ┤    │                                         │
      19.00 ┤    │                                         │
      18.00 ┤    │                                         │
      17.00 ┤    │                                         │
      16.00 ┤    │                                         │
      15.00 ┤    │                                         │
      14.00 ┤    │                                         │
      13.00 ┤    │                                         │
      12.00 ┤    │                                         │
      11.00 ┤    │                                         │
      10.00 ┤    │                                         │
       9.00 ┤    │                                         │
       8.00 ┤    │                                         │
       7.00 ┤    │                                         │
       6.00 ┤    │                                         │
       5.00 ┤    │                                         │
       4.00 ┤    │                                         │
       3.00 ┤    │                                         │
       2.00 ┤    │                                         │
       1.00 ┤    │                                         │
       0.00 ┼────╯                                         ╰────────────


Received duplicate messages per minute:
      53.00 ┼                                       ╭╮
      52.00 ┤                                       ││
      51.00 ┤                                       ││
      50.00 ┤                                       ││ ╭─╮
      49.00 ┤                                       ││ │ │
      48.00 ┤                                       ││ │ │
      47.00 ┤                                       ││ │ │
      46.00 ┤                                       ││ │ │
      45.00 ┤                                       ││ │ │
      44.00 ┤                                       ││ │ │
      43.00 ┤                                       ││ │ │
      42.00 ┤                                       ││ │ │
      41.00 ┤                                       ││ │ │
      40.00 ┤                                       ││ │ │
      39.00 ┤                                      ╭╯│ │ │
      38.00 ┤                                      │ │ │ │
      37.00 ┤                                      │ │ │ │
      36.00 ┤                                      │ │ │ │
      35.00 ┤                                      │ │ │ │
      34.00 ┤                                      │ │ │ │
      33.00 ┤                                      │ │ │ │
      32.00 ┤                                      │ │ │ │
      31.00 ┤                                      │ │ │ │
      30.00 ┤                                      │ │ │ │
      29.00 ┤                                      │ │ │ │
      28.00 ┤                                      │ │ │ │
      27.00 ┤                                      │ │ │ │
      26.00 ┤                                      │ │ │ │
      25.00 ┤                                      │ │ │ │
      24.00 ┤                                      │ │ │ │
      23.00 ┤                                      │ │ │ │
      22.00 ┤                                      │ │ │ │
      21.00 ┤                                      │ │ │ │
      20.00 ┤                                      │ │ │ │
      19.00 ┤                                      │ │ │ │
      18.00 ┤                                      │ │ │ │
      17.00 ┤                                      │ │ │ │
      16.00 ┤                                      │ │ │ │
      15.00 ┤                                      │ │ │ │
      14.00 ┤                                      │ │ │ │
      13.00 ┤                                      │ │ │ │
      12.00 ┤                                      │ │ │ │
      11.00 ┤                                      │ │ │ │
      10.00 ┤                                      │ │ │ │
       9.00 ┤                                      │ │ │ │
       8.00 ┤                                      │ ╰╮│ │
       7.00 ┤                                      │  ││ │
       6.00 ┤                                      │  ││ │
       5.00 ┤                                      │  ││ │
       4.00 ┤                                      │  ││ │
       3.00 ┤                                      │  ││ │
       2.00 ┤                                      │  ││ │
       1.00 ┤                                      │  ││ │
       0.00 ┼──────────────────────────────────────╯  ╰╯ ╰──────────────
```