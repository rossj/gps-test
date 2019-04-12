## Summary

This scenario started with publishing 10 batches of 1000 messages, waited 5 minutes, and then started acking at about 4 per second (0.1s processing time, but overhead).

Note that the "received rate" graph below uses the Node client's internal queuing / management to deliver 1 message a time. Subscriber actually received periodic batches of ~315 messages.

After about 35 minutes of subscribing, near the end of the 10000 messages, the subscriber received numerous batches of duplicate messages with duplicate ack ids. All of these duplicate messages then started giving "expired" response to acking. The batches of ~315 cycled between being duplicate and non-duplicate until all messages were succesfuly ackd.

## Scenario

```JSON
    {
        "name": "10000, 0.1 fast ack",
        "publisherClientOptions": {
            "grpc.http2.lookahead_bytes": 4096,
            "grpc.http2.bdp_probe": 0
        },
        "publisherTopicOptions": {
            "batching": {
                "maxMessages": 1000,
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
        "processingTimeMilliseconds": 100,
        "subscriberCount": 1,
        "subscriberStartDelayMinutes": 5,
        "messageBytes": 50,
        "publisherCount": 1,
        "initialMessageCount": 10000,
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
Scenario 10000, 0.1 fast ack:
Total duration: 59.95 minutes
Published messages: 10000
Total received messages: 13102
Unique received internal IDs: 10000
Unique acked internal IDs: 10000
Duplicate received messages: 3102
Received messages with others in progress: 0
Time until first duplicate: 43.88 minutes
Number of errors: 0
Time until first error: N/A
Time since last message: 4.04 minutes
Received messages per minute:
     259.00 ┼                 ╭╮╭╮          ╭╮    ╭╮          ╭╮╭╮
     258.00 ┤      ╭─╮╭─╮╭─╮  │││╰╮╭─╮ ╭───╮││╭─╮ ││╭╮╭╮ ╭╮╭──╯││╰─╮
     257.00 ┤      │ ╰╯ ││ ╰╮╭╯╰╯ ╰╯ ╰─╯   ╰╯╰╯ ╰╮│╰╯╰╯╰─╯││   ╰╯  │
     256.00 ┤      │    ╰╯  ╰╯                   ╰╯       ╰╯       │
     255.00 ┤      │                                               │
     254.00 ┤      │                                               │
     253.00 ┤     ╭╯                                               │
     252.00 ┤     │                                                │
     251.00 ┤     │                                                │
     250.00 ┤     │                                                │
     249.00 ┤     │                                                │
     248.00 ┤    ╭╯                                                │
     247.00 ┤    │                                                 │
     246.00 ┤    │                                                 │
     245.00 ┤    │                                                 │
     244.00 ┤    │                                                 │
     243.00 ┤    │                                                 │
     242.00 ┤    │                                                 │
     241.00 ┤    │                                                 │
     240.00 ┤    │                                                 │
     239.00 ┤    │                                                 │
     238.00 ┤    │                                                 │
     237.00 ┤    │                                                 │
     236.00 ┤    │                                                 │
     235.00 ┤    │                                                 │
     234.00 ┤    │                                                 ╰╮
     233.00 ┤    │                                                  │
     232.00 ┤    │                                                  │
     231.00 ┤    │                                                  │
     230.00 ┤    │                                                  │
     229.00 ┤    │                                                  │
     228.00 ┤    │                                                  │
     227.00 ┤    │                                                  │
     226.00 ┤    │                                                  │
     225.00 ┤    │                                                  │
     224.00 ┤    │                                                  │
     223.00 ┤    │                                                  │
     222.00 ┤    │                                                  │
     221.00 ┤    │                                                  │
     220.00 ┤    │                                                  │
     219.00 ┤    │                                                  │
     218.00 ┤    │                                                  │
     217.00 ┤    │                                                  │
     216.00 ┤    │                                                  │
     215.00 ┤    │                                                  │
     214.00 ┤    │                                                  │
     213.00 ┤    │                                                  │
     212.00 ┤    │                                                  │
     211.00 ┤    │                                                  │
     210.00 ┤    │                                                  │
     209.00 ┤    │                                                  │
     208.00 ┤    │                                                  │
     207.00 ┤    │                                                  │
     206.00 ┤    │                                                  │
     205.00 ┤    │                                                  │
     204.00 ┤    │                                                  │
     203.00 ┤    │                                                  │
     202.00 ┤    │                                                  │
     201.00 ┤    │                                                  │
     200.00 ┤    │                                                  │
     199.00 ┤    │                                                  │
     198.00 ┤    │                                                  │
     197.00 ┤    │                                                  │
     196.00 ┤    │                                                  │
     195.00 ┤    │                                                  │
     194.00 ┤    │                                                  │
     193.00 ┤    │                                                  │
     192.00 ┤    │                                                  │
     191.00 ┤    │                                                  │
     190.00 ┤    │                                                  │
     189.00 ┤    │                                                  │
     188.00 ┤    │                                                  │
     187.00 ┤    │                                                  │
     186.00 ┤    │                                                  │
     185.00 ┤    │                                                  │
     184.00 ┤    │                                                  │
     183.00 ┤    │                                                  │
     182.00 ┤    │                                                  │
     181.00 ┤    │                                                  │
     180.00 ┤    │                                                  │
     179.00 ┤    │                                                  │
     178.00 ┤    │                                                  │
     177.00 ┤    │                                                  │
     176.00 ┤    │                                                  │
     175.00 ┤    │                                                  │
     174.00 ┤    │                                                  │
     173.00 ┤    │                                                  │
     172.00 ┤    │                                                  │
     171.00 ┤    │                                                  │
     170.00 ┤    │                                                  │
     169.00 ┤    │                                                  │
     168.00 ┤    │                                                  │
     167.00 ┤    │                                                  │
     166.00 ┤    │                                                  │
     165.00 ┤    │                                                  │
     164.00 ┤    │                                                  │
     163.00 ┤    │                                                  │
     162.00 ┤    │                                                  │
     161.00 ┤    │                                                  │
     160.00 ┤    │                                                  │
     159.00 ┤    │                                                  │
     158.00 ┤    │                                                  │
     157.00 ┤    │                                                  │
     156.00 ┤    │                                                  │
     155.00 ┤    │                                                  │
     154.00 ┤    │                                                  │
     153.00 ┤    │                                                  │
     152.00 ┤    │                                                  │
     151.00 ┤    │                                                  │
     150.00 ┤    │                                                  │
     149.00 ┤    │                                                  │
     148.00 ┤    │                                                  │
     147.00 ┤    │                                                  │
     146.00 ┤    │                                                  │
     145.00 ┤    │                                                  │
     144.00 ┤    │                                                  │
     143.00 ┤    │                                                  │
     142.00 ┤    │                                                  │
     141.00 ┤    │                                                  │
     140.00 ┤    │                                                  │
     139.00 ┤    │                                                  │
     138.00 ┤    │                                                  │
     137.00 ┤    │                                                  │
     136.00 ┤    │                                                  │
     135.00 ┤    │                                                  │
     134.00 ┤    │                                                  │
     133.00 ┤    │                                                  │
     132.00 ┤    │                                                  │
     131.00 ┤    │                                                  │
     130.00 ┤    │                                                  │
     129.00 ┤    │                                                  │
     128.00 ┤    │                                                  │
     127.00 ┤    │                                                  │
     126.00 ┤    │                                                  │
     125.00 ┤    │                                                  │
     124.00 ┤    │                                                  │
     123.00 ┤    │                                                  │
     122.00 ┤    │                                                  │
     121.00 ┤    │                                                  │
     120.00 ┤    │                                                  │
     119.00 ┤    │                                                  │
     118.00 ┤    │                                                  │
     117.00 ┤    │                                                  │
     116.00 ┤    │                                                  │
     115.00 ┤    │                                                  │
     114.00 ┤    │                                                  │
     113.00 ┤    │                                                  │
     112.00 ┤    │                                                  │
     111.00 ┤    │                                                  │
     110.00 ┤    │                                                  │
     109.00 ┤    │                                                  │
     108.00 ┤    │                                                  │
     107.00 ┤    │                                                  │
     106.00 ┤    │                                                  │
     105.00 ┤    │                                                  │
     104.00 ┤    │                                                  │
     103.00 ┤    │                                                  │
     102.00 ┤    │                                                  │
     101.00 ┤    │                                                  │
     100.00 ┤    │                                                  │
      99.00 ┤    │                                                  │
      98.00 ┤    │                                                  │
      97.00 ┤    │                                                  │
      96.00 ┤    │                                                  │
      95.00 ┤    │                                                  │
      94.00 ┤    │                                                  │
      93.00 ┤    │                                                  │
      92.00 ┤    │                                                  │
      91.00 ┤    │                                                  │
      90.00 ┤    │                                                  │
      89.00 ┤    │                                                  │
      88.00 ┤    │                                                  │
      87.00 ┤    │                                                  │
      86.00 ┤    │                                                  │
      85.00 ┤    │                                                  │
      84.00 ┤    │                                                  │
      83.00 ┤    │                                                  │
      82.00 ┤    │                                                  │
      81.00 ┤    │                                                  │
      80.00 ┤    │                                                  │
      79.00 ┤    │                                                  │
      78.00 ┤    │                                                  │
      77.00 ┤    │                                                  │
      76.00 ┤    │                                                  │
      75.00 ┤    │                                                  │
      74.00 ┤    │                                                  │
      73.00 ┤    │                                                  │
      72.00 ┤    │                                                  │
      71.00 ┤    │                                                  │
      70.00 ┤    │                                                  │
      69.00 ┤    │                                                  │
      68.00 ┤    │                                                  │
      67.00 ┤    │                                                  │
      66.00 ┤    │                                                  │
      65.00 ┤    │                                                  │
      64.00 ┤    │                                                  │
      63.00 ┤    │                                                  │
      62.00 ┤    │                                                  │
      61.00 ┤    │                                                  │
      60.00 ┤    │                                                  │
      59.00 ┤    │                                                  │
      58.00 ┤    │                                                  │
      57.00 ┤    │                                                  │
      56.00 ┤    │                                                  │
      55.00 ┤    │                                                  │
      54.00 ┤    │                                                  │
      53.00 ┤    │                                                  │
      52.00 ┤    │                                                  │
      51.00 ┤    │                                                  │
      50.00 ┤    │                                                  │
      49.00 ┤    │                                                  │
      48.00 ┤    │                                                  │
      47.00 ┤    │                                                  │
      46.00 ┤    │                                                  │
      45.00 ┤    │                                                  │
      44.00 ┤    │                                                  │
      43.00 ┤    │                                                  │
      42.00 ┤    │                                                  │
      41.00 ┤    │                                                  │
      40.00 ┤    │                                                  │
      39.00 ┤    │                                                  │
      38.00 ┤    │                                                  │
      37.00 ┤    │                                                  │
      36.00 ┤    │                                                  │
      35.00 ┤    │                                                  │
      34.00 ┤    │                                                  │
      33.00 ┤    │                                                  │
      32.00 ┤    │                                                  │
      31.00 ┤    │                                                  │
      30.00 ┤    │                                                  │
      29.00 ┤    │                                                  │
      28.00 ┤    │                                                  │
      27.00 ┤    │                                                  │
      26.00 ┤    │                                                  │
      25.00 ┤    │                                                  │
      24.00 ┤    │                                                  │
      23.00 ┤    │                                                  │
      22.00 ┤    │                                                  │
      21.00 ┤    │                                                  │
      20.00 ┤    │                                                  │
      19.00 ┤    │                                                  │
      18.00 ┤    │                                                  │
      17.00 ┤    │                                                  │
      16.00 ┤    │                                                  │
      15.00 ┤    │                                                  │
      14.00 ┤    │                                                  │
      13.00 ┤    │                                                  │
      12.00 ┤    │                                                  │
      11.00 ┤    │                                                  │
      10.00 ┤    │                                                  │
       9.00 ┤    │                                                  │
       8.00 ┤    │                                                  │
       7.00 ┤    │                                                  │
       6.00 ┤    │                                                  │
       5.00 ┤    │                                                  │
       4.00 ┤    │                                                  │
       3.00 ┤    │                                                  │
       2.00 ┤    │                                                  │
       1.00 ┤    │                                                  │
       0.00 ┼────╯                                                  ╰───


Received duplicate messages per minute:
     259.00 ┼                                                 ╭╮╭╮
     258.00 ┤                                            ╭╮╭──╯││╰─╮
     257.00 ┤                                           ╭╯││   ╰╯  │
     256.00 ┤                                           │ ╰╯       │
     255.00 ┤                                           │          │
     254.00 ┤                                           │          │
     253.00 ┤                                           │          │
     252.00 ┤                                           │          │
     251.00 ┤                                           │          │
     250.00 ┤                                           │          │
     249.00 ┤                                           │          │
     248.00 ┤                                           │          │
     247.00 ┤                                           │          │
     246.00 ┤                                           │          │
     245.00 ┤                                           │          │
     244.00 ┤                                           │          │
     243.00 ┤                                           │          │
     242.00 ┤                                           │          │
     241.00 ┤                                           │          │
     240.00 ┤                                           │          │
     239.00 ┤                                           │          │
     238.00 ┤                                           │          │
     237.00 ┤                                           │          │
     236.00 ┤                                           │          │
     235.00 ┤                                           │          │
     234.00 ┤                                           │          ╰╮
     233.00 ┤                                           │           │
     232.00 ┤                                           │           │
     231.00 ┤                                           │           │
     230.00 ┤                                           │           │
     229.00 ┤                                           │           │
     228.00 ┤                                           │           │
     227.00 ┤                                           │           │
     226.00 ┤                                           │           │
     225.00 ┤                                           │           │
     224.00 ┤                                           │           │
     223.00 ┤                                           │           │
     222.00 ┤                                           │           │
     221.00 ┤                                           │           │
     220.00 ┤                                           │           │
     219.00 ┤                                           │           │
     218.00 ┤                                           │           │
     217.00 ┤                                           │           │
     216.00 ┤                                           │           │
     215.00 ┤                                           │           │
     214.00 ┤                                           │           │
     213.00 ┤                                           │           │
     212.00 ┤                                           │           │
     211.00 ┤                                           │           │
     210.00 ┤                                           │           │
     209.00 ┤                                           │           │
     208.00 ┤                                           │           │
     207.00 ┤                                           │           │
     206.00 ┤                                           │           │
     205.00 ┤                                           │           │
     204.00 ┤                                           │           │
     203.00 ┤                                           │           │
     202.00 ┤                                           │           │
     201.00 ┤                                           │           │
     200.00 ┤                                           │           │
     199.00 ┤                                           │           │
     198.00 ┤                                           │           │
     197.00 ┤                                           │           │
     196.00 ┤                                           │           │
     195.00 ┤                                           │           │
     194.00 ┤                                           │           │
     193.00 ┤                                           │           │
     192.00 ┤                                           │           │
     191.00 ┤                                           │           │
     190.00 ┤                                           │           │
     189.00 ┤                                           │           │
     188.00 ┤                                           │           │
     187.00 ┤                                           │           │
     186.00 ┤                                           │           │
     185.00 ┤                                           │           │
     184.00 ┤                                           │           │
     183.00 ┤                                           │           │
     182.00 ┤                                           │           │
     181.00 ┤                                           │           │
     180.00 ┤                                           │           │
     179.00 ┤                                           │           │
     178.00 ┤                                           │           │
     177.00 ┤                                           │           │
     176.00 ┤                                           │           │
     175.00 ┤                                           │           │
     174.00 ┤                                           │           │
     173.00 ┤                                           │           │
     172.00 ┤                                           │           │
     171.00 ┤                                           │           │
     170.00 ┤                                           │           │
     169.00 ┤                                           │           │
     168.00 ┤                                           │           │
     167.00 ┤                                           │           │
     166.00 ┤                                           │           │
     165.00 ┤                                           │           │
     164.00 ┤                                           │           │
     163.00 ┤                                           │           │
     162.00 ┤                                           │           │
     161.00 ┤                                           │           │
     160.00 ┤                                           │           │
     159.00 ┤                                           │           │
     158.00 ┤                                           │           │
     157.00 ┤                                           │           │
     156.00 ┤                                           │           │
     155.00 ┤                                           │           │
     154.00 ┤                                           │           │
     153.00 ┤                                           │           │
     152.00 ┤                                           │           │
     151.00 ┤                                           │           │
     150.00 ┤                                           │           │
     149.00 ┤                                           │           │
     148.00 ┤                                           │           │
     147.00 ┤                                           │           │
     146.00 ┤                                           │           │
     145.00 ┤                                           │           │
     144.00 ┤                                           │           │
     143.00 ┤                                           │           │
     142.00 ┤                                           │           │
     141.00 ┤                                           │           │
     140.00 ┤                                           │           │
     139.00 ┤                                           │           │
     138.00 ┤                                           │           │
     137.00 ┤                                           │           │
     136.00 ┤                                           │           │
     135.00 ┤                                           │           │
     134.00 ┤                                           │           │
     133.00 ┤                                           │           │
     132.00 ┤                                           │           │
     131.00 ┤                                           │           │
     130.00 ┤                                           │           │
     129.00 ┤                                           │           │
     128.00 ┤                                           │           │
     127.00 ┤                                           │           │
     126.00 ┤                                           │           │
     125.00 ┤                                           │           │
     124.00 ┤                                           │           │
     123.00 ┤                                           │           │
     122.00 ┤                                           │           │
     121.00 ┤                                           │           │
     120.00 ┤                                           │           │
     119.00 ┤                                           │           │
     118.00 ┤                                           │           │
     117.00 ┤                                           │           │
     116.00 ┤                                           │           │
     115.00 ┤                                           │           │
     114.00 ┤                                           │           │
     113.00 ┤                                           │           │
     112.00 ┤                                           │           │
     111.00 ┤                                           │           │
     110.00 ┤                                           │           │
     109.00 ┤                                           │           │
     108.00 ┤                                           │           │
     107.00 ┤                                           │           │
     106.00 ┤                                           │           │
     105.00 ┤                                           │           │
     104.00 ┤                                           │           │
     103.00 ┤                                           │           │
     102.00 ┤                                           │           │
     101.00 ┤                                           │           │
     100.00 ┤                                           │           │
      99.00 ┤                                           │           │
      98.00 ┤                                           │           │
      97.00 ┤                                           │           │
      96.00 ┤                                           │           │
      95.00 ┤                                           │           │
      94.00 ┤                                           │           │
      93.00 ┤                                           │           │
      92.00 ┤                                           │           │
      91.00 ┤                                           │           │
      90.00 ┤                                           │           │
      89.00 ┤                                           │           │
      88.00 ┤                                           │           │
      87.00 ┤                                           │           │
      86.00 ┤                                           │           │
      85.00 ┤                                           │           │
      84.00 ┤                                           │           │
      83.00 ┤                                           │           │
      82.00 ┤                                           │           │
      81.00 ┤                                           │           │
      80.00 ┤                                           │           │
      79.00 ┤                                           │           │
      78.00 ┤                                           │           │
      77.00 ┤                                           │           │
      76.00 ┤                                           │           │
      75.00 ┤                                           │           │
      74.00 ┤                                           │           │
      73.00 ┤                                           │           │
      72.00 ┤                                           │           │
      71.00 ┤                                           │           │
      70.00 ┤                                           │           │
      69.00 ┤                                           │           │
      68.00 ┤                                           │           │
      67.00 ┤                                           │           │
      66.00 ┤                                           │           │
      65.00 ┤                                           │           │
      64.00 ┤                                           │           │
      63.00 ┤                                           │           │
      62.00 ┤                                           │           │
      61.00 ┤                                           │           │
      60.00 ┤                                           │           │
      59.00 ┤                                           │           │
      58.00 ┤                                           │           │
      57.00 ┤                                           │           │
      56.00 ┤                                           │           │
      55.00 ┤                                           │           │
      54.00 ┤                                           │           │
      53.00 ┤                                           │           │
      52.00 ┤                                           │           │
      51.00 ┤                                           │           │
      50.00 ┤                                           │           │
      49.00 ┤                                           │           │
      48.00 ┤                                           │           │
      47.00 ┤                                           │           │
      46.00 ┤                                           │           │
      45.00 ┤                                           │           │
      44.00 ┤                                           │           │
      43.00 ┤                                           │           │
      42.00 ┤                                           │           │
      41.00 ┤                                           │           │
      40.00 ┤                                           │           │
      39.00 ┤                                           │           │
      38.00 ┤                                           │           │
      37.00 ┤                                           │           │
      36.00 ┤                                           │           │
      35.00 ┤                                           │           │
      34.00 ┤                                           │           │
      33.00 ┤                                           │           │
      32.00 ┤                                          ╭╯           │
      31.00 ┤                                          │            │
      30.00 ┤                                          │            │
      29.00 ┤                                          │            │
      28.00 ┤                                          │            │
      27.00 ┤                                          │            │
      26.00 ┤                                          │            │
      25.00 ┤                                          │            │
      24.00 ┤                                          │            │
      23.00 ┤                                          │            │
      22.00 ┤                                          │            │
      21.00 ┤                                          │            │
      20.00 ┤                                          │            │
      19.00 ┤                                          │            │
      18.00 ┤                                          │            │
      17.00 ┤                                          │            │
      16.00 ┤                                          │            │
      15.00 ┤                                          │            │
      14.00 ┤                                          │            │
      13.00 ┤                                          │            │
      12.00 ┤                                          │            │
      11.00 ┤                                          │            │
      10.00 ┤                                          │            │
       9.00 ┤                                          │            │
       8.00 ┤                                          │            │
       7.00 ┤                                          │            │
       6.00 ┤                                          │            │
       5.00 ┤                                          │            │
       4.00 ┤                                          │            │
       3.00 ┤                                          │            │
       2.00 ┤                                          │            │
       1.00 ┤                                          │            │
       0.00 ┼──────────────────────────────────────────╯            ╰───