import { GetSubscriptionResponse, GetTopicResponse, Message, PubSub, Subscription } from '@google-cloud/pubsub';
import { ClientConfig } from '@google-cloud/pubsub/build/src/pubsub';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as scenarios from '../scenarios.json';
const asciichart = require('asciichart');

const enum RcptCategory {
    First,
    Retry,
    Duplicate
}

const enum TakenAction {
    Pending,
    Acked,
    Nacked
}

interface ReceivedMessageEvent {
    timestamp: number;
    messageId: string;
    ackId: string;
    internalId: number;
    otherInProgressCount: number;
    rcptCategory: RcptCategory;
    takenAction: TakenAction;
}

interface ErrorEvent {
    timestamp: number;
    error: any;
}

interface ScenarioAggs {
    startTimestamp: number;
    receivedMessages: ReceivedMessageEvent[];
    subscriberErrors: ErrorEvent[];
    ackedIdCounts: Map<number, number>;
    nackedIdCounts: Map<number, number>;
    inProgressCount: number;
    unreceivedInternalIds: Set<number>;
    nextInternalId: number;
}

const keyFilename = './key.json';
const data = JSON.parse(fs.readFileSync(keyFilename, 'utf8'));
console.log(`Google Pub/Sub authenticating to project "${data.project_id}" as user "${data.client_email}"`);

let isKilled = false;
const createdTopicPromises: Promise<GetTopicResponse>[] = [];
const createdSubPromises: Promise<GetSubscriptionResponse>[] = [];
const listeningSubscribers: Subscription[] = [];
const scenarioResults = new Map<typeof scenarios[0], ScenarioAggs>();

/*
export function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export function randn_bm(min: number, max: number, skew: number) {
    var u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
}
*/

const minFromMs = (ms: number) => ms / 1000 / 60;
const toMinStr = (ms: number | undefined) => isDef(ms) ? minFromMs(ms).toFixed(2) + ' minutes' : 'N/A';

async function shutdown() {
    console.log(`Shutting down. Deleting topics and subscriptions...`);

    isKilled = true;

    // Force exit if doesn't close cleanly
    const exitTimeout = setTimeout(() => {
        process.exit();
    }, 5000);
    exitTimeout.unref();


    for (const sub of listeningSubscribers) {
        await sub.close();
    }

    /*
    for (const pSub of createdSubPromises) {
        const [sub] = await pSub;
        await sub.delete();
    }

    for (const pTopic of createdTopicPromises) {
        const [topic] = await pTopic;
        await topic.delete();
    }
    */

    console.log(`Done!`);

    const now = Date.now();

    for (const [scenario, aggs] of scenarioResults) {
        const allIdSet = new Set(aggs.receivedMessages.map(msg => msg.internalId));
        const ackedIdSet = new Set(aggs.receivedMessages.filter(msg => msg.takenAction === TakenAction.Acked).map(msg => msg.internalId));

        const withOthersInProgress = aggs.receivedMessages.filter(msg => msg.otherInProgressCount > 0);
        const dupes = aggs.receivedMessages.filter(msg => msg.rcptCategory === RcptCategory.Duplicate);
        const retries = aggs.receivedMessages.filter(msg => msg.rcptCategory === RcptCategory.Retry);
        //const normal = aggs.receivedMessages.filter(msg => msg.rcptCategory !== RcptCategory.Duplicate && msg.takenAction === TakenAction.Acked);

        console.log('\n------------');
        console.log(`Scenario ${scenario.name}:`);
        console.log(`Total duration: ${toMinStr(now - aggs.startTimestamp)}`);
        console.log(`Published messages: ${aggs.nextInternalId}`);
        console.log(`Total received messages: ${aggs.receivedMessages.length}`);
        console.log(`Unique received internal IDs: ${allIdSet.size}`);
        console.log(`Unique acked internal IDs: ${ackedIdSet.size}`);
        console.log(`Duplicate received messages: ${dupes.length}`);
        console.log(`Received messages with others in progress: ${withOthersInProgress.length}`);

        const timeToFirstDupe = dupes.length > 0
            ? dupes[0].timestamp - aggs.startTimestamp
            : undefined;
        console.log(`Time until first duplicate: ${toMinStr(timeToFirstDupe)}`);

        console.log(`Number of errors: ${aggs.subscriberErrors.length}`);
        const timeToFirstError = aggs.subscriberErrors.length > 0
            ? aggs.subscriberErrors[0].timestamp - aggs.startTimestamp
            : undefined;
        console.log(`Time until first error: ${toMinStr(timeToFirstError)}`);

        const timeSinceLastMessage = aggs.receivedMessages.length > 0
            ? now - aggs.receivedMessages[aggs.receivedMessages.length - 1].timestamp
            : undefined;
        console.log(`Time since last message: ${toMinStr(timeSinceLastMessage)}`);

        // Chart all received messages
        if (aggs.receivedMessages.length) {
            const minutes = Math.ceil(minFromMs(now - aggs.startTimestamp));
            const rcvd = new Array(minutes);
            rcvd.fill(0, 0, minutes);
            for (const msg of aggs.receivedMessages) {
                const minute = Math.floor(minFromMs(msg.timestamp - aggs.startTimestamp));
                ++rcvd[minute];
            }
            console.log('Received messages per minute:');
            console.log(asciichart.plot(rcvd));
            console.log('\n')
        }

        // Chart duplicate messages
        if (dupes.length) {
            const minutes = Math.ceil(minFromMs(now - aggs.startTimestamp));
            const rcvd = new Array(minutes);
            rcvd.fill(0, 0, minutes);
            for (const msg of dupes) {
                const minute = Math.floor(minFromMs(msg.timestamp - aggs.startTimestamp));
                ++rcvd[minute];
            }
            console.log('Received duplicate messages per minute:');
            console.log(asciichart.plot(rcvd));
            console.log('\n')
        }

        // Chart duplicate messages
        if (retries.length) {
            const minutes = Math.ceil(minFromMs(now - aggs.startTimestamp));
            const rcvd = new Array(minutes);
            rcvd.fill(0, 0, minutes);
            for (const msg of retries) {
                const minute = Math.floor(minFromMs(msg.timestamp - aggs.startTimestamp));
                ++rcvd[minute];
            }
            console.log('Received retry messages per minute:');
            console.log(asciichart.plot(rcvd));
        }
    }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function isDef<T>(thing: T | undefined): thing is T {
    return typeof thing !== 'undefined';
}

async function createTopicAndSubscription(scenario: typeof scenarios[0], topicName: string, subName: string) {
    const pre = `Scenario ${scenario.name}: `;

    const clientConfig: ClientConfig = {
        projectId: data.project_id,
        keyFilename: keyFilename
    };
    const client = new PubSub(clientConfig);

    console.log(`${pre}Creating topic "${topicName}"...`)
    const pTopic = client.createTopic(topicName);
    createdTopicPromises.push(pTopic);
    await pTopic;
    console.log(`${pre}Done!`);

    if (isKilled) {
        return;
    }

    console.log(`${pre}Creating subscription "${subName}"...`)
    const pSub = client.createSubscription(topicName, subName, {
        ackDeadlineSeconds: scenario.subscriptionAckDeadlineSeconds
    });
    createdSubPromises.push(pSub);
    await pSub;
    console.log(`${pre}Done!`);
}

function subscribe(scenario: typeof scenarios[0], subName: string, aggs: ScenarioAggs) {
    const pre = `Scenario ${scenario.name}: `;

    const clientConfig: ClientConfig = {
        projectId: data.project_id,
        keyFilename: keyFilename
    };

    const client = new PubSub(clientConfig);

    const sub = client.subscription(subName, scenario.subscriberSubscriptionOptions);
    sub.on('error', (err: any) => {
        console.log(`${pre}Subscription error: ${err && err.message}`);
        aggs.subscriberErrors.push({
            timestamp: Date.now(),
            error: err
        });
    });

    // Delay 10 min before subscribing
    setTimeout(() => {
        sub.on('message', async (msg: Message) => {
            const msg2 = JSON.parse(msg.data.toString('utf8'));
            const internalId: number = msg2['id'];

            const alreadyAcked = (aggs.ackedIdCounts.get(internalId) || 0) > 0;
            const retry = (aggs.nackedIdCounts.get(internalId) || 0) > 0;

            const messageEvent: ReceivedMessageEvent = {
                timestamp: Date.now(),
                messageId: msg.id,
                ackId: msg.ackId,
                internalId: internalId,
                otherInProgressCount: aggs.inProgressCount,
                rcptCategory: alreadyAcked
                    ? RcptCategory.Duplicate
                    : (retry ? RcptCategory.Retry : RcptCategory.First),
                takenAction: TakenAction.Pending
            };

            aggs.inProgressCount++;

            aggs.receivedMessages.push(messageEvent);
            aggs.unreceivedInternalIds.delete(internalId);

            const currentCount = aggs.ackedIdCounts.get(internalId);
            aggs.ackedIdCounts.set(internalId, (currentCount || 0) + 1);

            let msTimeout = scenario.processingTimeMilliseconds;
            if (msTimeout > 50000) {
                console.log('msTimeout too big!');
            }

            const timeout = setTimeout(() => {
                if (!isKilled) {
                    /*
                    const doAck = Math.random() > 0.1;
                    if (doAck) {
                        */
                    messageEvent.takenAction = TakenAction.Acked;
                    aggs.ackedIdCounts.set(internalId, (aggs.ackedIdCounts.get(internalId) || 0) + 1);
                    msg.ack();
                    aggs.inProgressCount--;
                    /*
                } else {
                    messageEvent.takenAction = TakenAction.Nacked;
                    aggs.nackedIdCounts.set(internalId, (aggs.nackedIdCounts.get(internalId) || 0) + 1);
                    msg.nack();
                    aggs.inProgressCount--;
                }
                */
                }
            }, msTimeout);
            timeout.unref();
        });

        listeningSubscribers.push(sub);
    }, scenario.subscriberStartDelayMinutes * 60 * 1000);
}

function startPublisher(scenario: typeof scenarios[0], topicName: string, aggs: ScenarioAggs) {
    const pre = `Scenario ${scenario.name}: `;

    const clientConfig: ClientConfig = {
        projectId: data.project_id,
        keyFilename: keyFilename,
        ...scenario.publisherClientOptions
    };

    const client = new PubSub(clientConfig);
    const messageFiller = crypto.randomBytes(scenario.messageBytes / 2).toString('hex');

    const topic = client.topic(topicName, scenario.publisherTopicOptions);

    const publish = () => {
        const internalId = aggs.nextInternalId++;

        topic.publish(Buffer.from(JSON.stringify({
            data: messageFiller,
            id: internalId
        })));

        aggs.unreceivedInternalIds.add(internalId);
    };

    // Publish the initial messages
    for (let i = 0; i < scenario.initialMessageCount; i++) {
        publish();
    }

    // Set up an interval to publish ongoing messages
    const publishInterval = setInterval(() => {
        if (!isKilled) {
            /*
            // Publish a random amount with some randomness
            const toPublish = randn_bm(1, scenario.messagesPerPublishBatch, 0.5);
            for (let i = 0; i < toPublish; i++) {
                setTimeout(() => {
                    publish();
                }, Math.random() * 1000);
            }
            */
            for (let i = 0; i < scenario.messagesPerPublishBatch; i++) {
                publish();
            }
        }
    }, 60 * 1000 / scenario.batchesPerMinute);
    publishInterval.unref();

    const publishTimeout = setTimeout(() => {
        console.log(`${pre}Stopping publishing after ${aggs.nextInternalId} messages`);
        clearInterval(publishInterval);
    }, scenario.publishDurationMinutes * 60 * 1000)
    publishTimeout.unref();
}

async function runScenario(scenario: typeof scenarios[0]) {
    const topicName = 'gps-test-topic-' + crypto.randomBytes(5).toString('hex');
    const subName = 'gps-test-sub-' + crypto.randomBytes(5).toString('hex');

    console.log(`Running scenario "${scenario.name}" against topic [${topicName}] and subscription [${subName}]`)
    await createTopicAndSubscription(scenario, topicName, subName);

    if (isKilled) {
        return;
    }

    const aggs: ScenarioAggs = {
        startTimestamp: Date.now(),
        receivedMessages: [],
        subscriberErrors: [],
        ackedIdCounts: new Map(),
        nackedIdCounts: new Map(),
        inProgressCount: 0,
        unreceivedInternalIds: new Set(),
        nextInternalId: 0
    }

    for (let i = 0; i < scenario.publisherCount; i++) {
        startPublisher(scenario, topicName, aggs);
    }


    for (let i = 0; i < scenario.subscriberCount; i++) {
        subscribe(scenario, subName, aggs);
    }

    scenarioResults.set(scenario, aggs);
}

function run() {
    let maxDurationMinutes = 0;
    for (const scenario of scenarios) {
        maxDurationMinutes = Math.max(scenario.testDurationMinutes, maxDurationMinutes);
        runScenario(scenario);
    }

    const shutdownTimeout = setTimeout(() => {
        shutdown();
    }, maxDurationMinutes * 60 * 1000);
    shutdownTimeout.unref();
}

run();