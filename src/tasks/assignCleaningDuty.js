const _ = require('lodash');
const Bot = require('../models/Bot');

const { pickRandomMessage } = require('../utils/randomMessage');

const GREETING_MESSAGES = [
  'God morgon! :sunny:',
  'Ny vecka, nya möjligheter! :ok_hand:',
  'Hoppas alla haft en bra helg! :sunglasses:',
  'Välkomna tillbaka från helgen! :nerd_face:',
  'Hej på er! :grinning:',
  'Skönt att helgen är slut! :v:',
];

const ASSIGN_MESSAGES = [
  'Städansvariga denna vecka är %1 och %2.',
  'Den här veckan är %1 och %2 städansvariga.',
  '%1 och %2 är städansvariga den här veckan.',
];

const END_MESSAGES = [
  'Säg till mig om dom behöver påminnas!',
  'Lycka till!',
  'Ha det så kul!',
  'Kör hårt!',
];

const CLEANING_SCHEDULE_COOLDOWN_SECONDS = 60 * 60 * 24;

/**
 * Assign cleaning duty task.
 */
const assignCleaningDuty = (bot) => {
  const rdsCli = bot.getRdsCli();

  // Look up when last cleaning duty was assigned
  rdsCli.get('lastCleaningSchedule', (err, reply) => {
    // Only run task if it wasn't done recently
    const cdMilliseconds = CLEANING_SCHEDULE_COOLDOWN_SECONDS * 1000;
    if (reply === null || reply < Date.now() - cdMilliseconds) {
      // OK, we should run this task... get users from redis
      bot
        .getUsers()
        .then((users) => {
          // Sort user list by when they were assigned cleaning duty
          const sortedUsers = _.sortBy(users, ['lastCleaningDuty']);
          const assignedUsers = [];

          // Go through the sorted list
          _.forEach(sortedUsers, (user) => {
            // Parse the cleaning disabled field
            const cleaningDisabledUntil = Date.parse(user.cleaningDisabledUntil);
            if (!Number.isNaN(cleaningDisabledUntil) && cleaningDisabledUntil < Date.now()) {
              // User can be assigned cleaning duty

              if (assignedUsers.length === 0) {
                // This is the first assigned user, just add!
                assignedUsers.push(user);
              } else if (user.partTime === 'true') {
                // The second user is a part time employee...

                if (assignedUsers[0].partTime !== 'true') {
                  // ...only assign and finish if the first user was a full time employee
                  assignedUsers.push(user);
                  return false;
                }
              } else {
                // The second user is a full time employee - just add and finish!
                assignedUsers.push(user);
                return false;
              }
            }
          });

          if (assignedUsers.length === 2) {
            // We found two user that can be assigned
            bot.rdsCli.set('lastCleaningSchedule', Date.now()); // Store when task was run

            // Delete previous assignees
            bot.rdsCli.del('cleaningAssignees', () => {
              let i = 0;
              _.forEach(assignedUsers, (user) => {
                i++; // So the two assignees do not get the same cleaningDuty timestamp
                // Add assignee to redis and update user information
                bot.rdsCli.lpush('cleaningAssignees', `user:${user.id}`);
                bot.rdsCli.hset(`user:${user.id}`, 'lastCleaningDuty', Date.now() + i);
              });

              // Alright, time to create Slack announcement
              let msg = `${pickRandomMessage(GREETING_MESSAGES)} `;

              msg += pickRandomMessage(ASSIGN_MESSAGES)
                .replace('%1', `<@${assignedUsers[0].id}>`)
                .replace('%2', `<@${assignedUsers[1].id}>`);

              msg += ` ${pickRandomMessage(END_MESSAGES)}`;

              // Send the message to Slack
              bot.sendMessage(msg, bot.announcementChannelId);

              // Expire assignee key after a week or so
              bot.rdsCli.expire('cleaningAssignees', 60 * 60 * 24 * 8);

              console.log('Created cleaning schedule...');

              bot.disconnect();
            });
          } else {
            throw new Error('Could not assign two users.');
          }
        })
        .catch((e) => {
          // Log and disconnect on error.
          console.error(e);
          bot.disconnect();
        });
    } else {
      // Recently ran this task...
      console.log('Recently created cleaning schedule, cancelling...');
      bot.disconnect();
    }
  });
};

try {
  // Get env vars
  const { SLACK_TOKEN, ANNOUNCEMENT_CHANNEL_ID, REDIS_URL } = process.env;
  if (!SLACK_TOKEN || !ANNOUNCEMENT_CHANNEL_ID || !REDIS_URL) {
    throw new Error('Required environment vars missing.');
  }

  if (new Date().getDay() === 1) {
    // Only run on Mondays

    console.log("It's Monday, assign cleaning duty...");

    // Create bot instance and pass task to be run after it is initialized
    const bot = new Bot(SLACK_TOKEN, ANNOUNCEMENT_CHANNEL_ID, assignCleaningDuty); // eslint-disable-line
  } else {
    console.log('Not Monday... maybe tomorrow?');
  }
} catch (e) {
  console.error(e);
}
