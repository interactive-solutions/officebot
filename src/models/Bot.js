const {
  RtmClient, WebClient, RTM_EVENTS, CLIENT_EVENTS,
} = require('@slack/client');
const _ = require('lodash');
const redis = require('redis');
const axios = require('axios');

const Message = require('./Message');
const messageTriggers = require('../triggers');
const { pickRandomMessage } = require('../utils/randomMessage');

// How often the same Youtrack link can be posted in a channel
const YOUTRACK_LINK_COOLDOWN_SECONDS = 60 * 60 * 4;

class Bot {
  constructor(token, task = null) {
    // Throw error if required vars are missing
    if (!token || !process.env.YOUTRACK_TOKEN || !process.env.ANNOUNCEMENT_CHANNEL_ID) {
      throw new Error('Missing required env vars.');
    }

    // Set props
    this.rtm = new RtmClient(token, { logLevel: 'error', dataStore: false });
    this.botId = null;
    this.announcementChannelId = process.env.ANNOUNCEMENT_CHANNEL_ID;
    this.slackUsers = null;
    this.task = task;
    this.rdsCli = redis.createClient(6379, 'redis');

    // Start web client if bot is running a task
    // if (this.task) {
    this.web = new WebClient(token);
    // }

    // Set listeners and start
    this._setListeners();
    this.rtm.start();
  }

  /**
   * Returns a list of all users stored in redis
   */
  getUsers() {
    const users = [];
    return new Promise((resolve, reject) => {
      // Scan for keys starting with user:
      this.rdsCli.scan(0, 'MATCH', 'user:*', 'COUNT', 100, (err, reply) => {
        if (err) {
          reject();
        }

        const totalUsers = reply[1].length;
        let i = 0; // Counter

        // Loop through and get data for each user
        _.forEach(reply[1], (user) => {
          this.rdsCli.hgetall(user, (err, reply) => {
            i++;
            users.push(reply); // Add to array

            // Resolve promise when finished
            if (i === totalUsers) {
              resolve(users);
            }
          });
        });
      });
    });
  }

  /**
   * Returns the redis client
   */
  getRdsCli() {
    return this.rdsCli;
  }

  /**
   * Sends a message to the specified channel via the RTM client.
   */
  sendMessage(message, channel, showTyping = true) {
    if (showTyping) {
      // Show that bot is typing before sending
      this.rtm.sendTyping(channel);
      setTimeout(() => {
        this.rtm.sendMessage(message, channel);
      }, Math.random() * 2000);
    } else {
      // Send without typing
      this.rtm.sendMessage(message, channel);
    }
  }

  /**
   * Sends a message to the specified channel via the web client.
   */
  sendWebMessage(message, channel, opts = {}) {
    if (this.web) {
      this.web.chat.postMessage(channel, message, {
        ...opts,
        as_user: true,
        unfurl_links: false,
        unfurl_media: false,
      });
    }
  }

  /**
   * Send an IM to the specified Slack user id.
   */
  sendIM(message, slackId, opts = {}) {
    if (message && slackId && this.web) {
      try {
        this.web.im.open(slackId, (err, data) => {
          if (data.ok && data.channel) {
            this.sendWebMessage(message, data.channel.id, opts);
          }
        });
      } catch (e) {
        console.log(e);
      }
    }
  }

  /**
   * Returns Slack user id from Youtrack user id by matching on email.
   */
  getSlackIdFromYoutrackId(youtrackId) {
    // Try to find slack user with email that starts with youtrack id
    let slackUser = _.find(
      this.slackUsers,
      user => _.startsWith(user.profile.email, `${youtrackId}@`) && !user.deleted,
    );

    // If not found, also try to find email with only first name
    if (!slackUser) {
      slackUser = _.find(
        this.slackUsers,
        user => _.startsWith(user.profile.email, `${youtrackId.split('.')[0]}@`) && !user.deleted,
      );
    }

    if (slackUser) {
      return slackUser.id;
    }

    return null;
  }

  /**
   * Disconnect RTM socket and exit node process.
   */
  disconnect() {
    console.log('Disconnecting...');

    // Wait a few seconds so potential messages can be sent before socket is closed
    setTimeout(() => {
      this.rtm.disconnect();
    }, 7000);
  }

  /**
   * Initializes RTM socket listeners
   */
  _setListeners() {
    this.rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (data) => {
      // Remember our own id and workspace users when signed in
      this.botId = data.self.id;
      this.slackUsers = data.users;
    });

    this.rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
      // Update our saved user list when RTM connection is opened.
      this._updateUsers()
        .then(() => {
          // Run task if there is one
          if (this.task && typeof this.task === 'function') {
            this.task(this);
          }
        })
        .catch(() => {});
    });

    // If this bot is not performing a task, it should start listening to messages
    if (!this.task) {
      this._setMessageListener();
    }
  }

  /**
   * Sets RTM message event listener.
   */
  _setMessageListener() {
    this.rtm.on(RTM_EVENTS.MESSAGE, (message) => {
      this._processMessage(message);
    });
  }

  /**
   * Updates our stored user list.
   */
  _updateUsers() {
    const users = this.slackUsers;
    return new Promise((resolve, reject) => {
      let i = 0; // Counter

      // Loop through the user list from Slack
      _.forEach(users, (user) => {
        i++;

        // Check if we should store this user (not a bot, not deleted)
        if (!user.is_bot && user.id !== 'USLACKBOT' && user.name !== 'jetbrains' && !user.deleted) {
          // Look up if this user is already stored
          this.rdsCli.hget(`user:${user.id}`, 'id', (err, reply) => {
            if (err) {
              reject();
            }

            if (reply === null) {
              // User is not in redis - we should add it
              const newUser = {
                id: user.id,
                name: user.name,
                partTime: false, // Assume it is a full time employee as default
                cleaningDisabledUntil: '2099-01-01', // Cleaning duty disabled as default
                lastCleaningDuty: 0,
              };

              // Add user
              this.rdsCli.hmset(`user:${user.id}`, newUser, () => {
                console.log(`${user.name} added!`);

                // Resolve promise if this was the last user in the Slack user list
                if (i === users.length) {
                  resolve();
                }
              });
            } else if (i === users.length) {
              // User already stored
              // Resolve promise if this was the last user in the Slack user list
              resolve();
            }
          });
        }
      });
    });
  }

  /**
   * Processes new messages
   */
  _processMessage(slackMessage) {
    const message = new Message(slackMessage, this.botId);

    // Check if this is a message sent to us
    if (message.isForUs()) {
      let hasTrigger = false;

      // Go through all triggers and try to find a reply
      _.forEach(messageTriggers, (trigger) => {
        if (trigger.trigger(message, this)) {
          // Found a trigger!
          hasTrigger = true;
          return false; // Don't look any further
        }
      });

      if (!hasTrigger) {
        // No trigger found, reply that we don't understand!
        this._sendDontComprehendMessage(message.getChannel());

        // Also, log this message so we can create better trigger words in the future
        this._logNonComprehensibleMessage(message.getText());
      }
    } else if (message.hasIssueNumber()) {
      // This is not a message for us, but someone mentioned an issue number in a channel
      this._handleMessageWithIssueNumber(message);
    }
  }

  /**
   * Sends a don't comprehend message to a specified channel.
   */
  _sendDontComprehendMessage(channel) {
    const REPLIES = [
      'Jag förstår inte riktigt.',
      'Det där är utanför min kompetens.',
      'Jag har inte betalt för att svara på det.',
      'Hmm, jag vet inte riktigt vad du menar?',
      'Du säger säkert något viktigt, men jag förstår inte.',
      'Jag är ledsen, men du får ta det där med någon annan.',
    ];

    const msg = `
      ${pickRandomMessage(REPLIES)} Skriv !help i ett DM om du vill veta vad du kan fråga mig.
    `;
    this.sendMessage(msg, channel);
  }

  _logNonComprehensibleMessage(messageText) {
    this.rdsCli.lpush('nonComprehensibleMessages', messageText);
  }

  /**
   * Handles a message with an issue number.
   */
  _handleMessageWithIssueNumber(message) {
    // Only run if YouTrack token is available
    if (process.env.YOUTRACK_TOKEN && process.env.YOUTRACK_URL) {
      const issueNumber = message.getIssueNumber();

      // Check if we already posted a link in channel recently
      const cacheKey = `youtrack:${message.getChannel()}:${issueNumber}`;
      this.rdsCli.get(cacheKey, (err, reply) => {
        if (!reply) {
          // We haven't posted this - store that we are doing it now
          this.rdsCli.set(cacheKey, 1, 'EX', YOUTRACK_LINK_COOLDOWN_SECONDS);

          // Lookup issue number in YouTrack api
          axios
            .get(`${process.env.YOUTRACK_URL}/rest/issue/${issueNumber}`, {
              headers: {
                Authorization: `Bearer ${process.env.YOUTRACK_TOKEN}`,
                Accept: 'application/json',
              },
            })
            .then(({ data }) => {
              const name = _.get(_.find(data.field, { name: 'summary' }), 'value');

              const description = _.truncate(
                _.replace(_.get(_.find(data.field, { name: 'description' }), 'value'), /\n/g, ''),
                { length: 170 },
              );

              const assignees = _.chain(data.field)
                .find({ name: 'Assignee' })
                .get('value')
                .map(assignee => assignee.fullName)
                .join(', ')
                .value();

              const state = _.find(data.field, { name: 'State' });
              let stateName = _.head(_.get(state, 'value'));
              const stateColor = _.get(_.get(state, 'color'), 'fg');

              const creator = _.get(_.find(data.field, { name: 'reporterFullName' }), 'value');
              const created = _.get(_.find(data.field, { name: 'created' }), 'value') / 1000;
              const resolvedAt = _.get(_.find(data.field, { name: 'resolved' }), 'value');
              const url = `${process.env.YOUTRACK_URL}/issue/${issueNumber}`; // Create issue link
              const title = `${issueNumber}: ${name}`;
              // const color = '#6900ff';

              if (resolvedAt) {
                stateName = `:white_check_mark: ${stateName}`;
              }

              const fields = [
                { title: 'State', value: stateName, short: true },
                { title: 'Assignees', value: assignees || 'Unnassigned', short: true },
              ];

              const opts = {
                attachments: [
                  {
                    title_link: url,
                    title: `:youtrack: ${title}`,
                    fallback: title,
                    text: description,
                    color: stateColor,
                    footer: creator,
                    ts: created,
                    fields,
                  },
                ],
              };

              // Post response in channel
              this.sendWebMessage('', message.getChannel(), opts);
            })
            .catch(() => {
              // Api did not return a valid issue - do nothing!
            });
        }
      });
    }
  }
}

module.exports = Bot;
