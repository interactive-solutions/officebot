const _ = require('lodash');

/**
 * Respresents a message sent from Slack.
 */
class Message {
  constructor(message, botId) {
    this.message = message;
    this.botId = botId;
  }

  /**
   * @return {string} Message text
   */
  getText() {
    return this.message.text;
  }

  /**
   * @return {string} Slack channel ID
   */
  getChannel() {
    return this.message.channel;
  }

  /**
   * @return {bool} If message is intended for us
   */
  isForUs() {
    return this.message.user !== this.botId && this.isValid() && (this.isMention() || this.isDM());
  }

  /**
   * @return {bool} If message is valid and is not a slackbot link or thread
   */
  isValid() {
    return (
      this.message.type === 'message' &&
      this.message.text &&
      !this.message.subtype &&
      !this.message.thread_ts
    );
  }

  /**
   * @return {boolean} If we are mentioned
   */
  isMention() {
    return this.botId && this.message.text.includes(`<@${this.botId}>`);
  }

  /**
   * @return {boolean} If message is a DM
   */
  isDM() {
    return this.message.channel.substr(0, 1) === 'D';
  }

  isEmpty() {
    const messageWithoutSelfTag = this.message.text.replace(this.botId, '');
    return messageWithoutSelfTag === '<@>';
  }

  /**
   * @return {string|boolean} Extracted issue number OR false if there was none.
   */
  getIssueNumber() {
    const issueRegEx = /(?:^|\s)([A-Z]{2,12}-[0-9]{1,5}\b)/i;
    const issueMatch = this.message.text.match(issueRegEx);
    if (issueMatch !== null) {
      return issueMatch[1].toUpperCase();
    }
    return false;
  }

  /**
   * @return {boolean} If message has issue number
   */
  hasIssueNumber() {
    return this.message.user !== this.botId && this.isValid() && this.getIssueNumber();
  }

  /**
   * @param  {string}  word Word to search for.
   * @return {boolean}      If message text contains the word.
   */
  hasWord(word) {
    return this.message.text.toLowerCase().includes(word);
  }

  /**
   * @param  {string}  words Multiple words to search for.
   * @return {boolean}       If message text contains any of the words.
   */
  hasAnyWord(words) {
    const wordList = words.split(' ');
    let found = false;
    _.forEach(wordList, (word) => {
      if (this.message.text.toLowerCase().includes(word)) {
        found = true;
        return false;
      }
    });

    return found;
  }

  /**
   * @param  {string}  words Multiple words to search for.
   * @return {boolean}       If message text contains all of the words.
   */
  hasAllWords(words) {
    const wordList = words.split(' ');
    let missing = false;
    _.forEach(wordList, (word) => {
      if (!this.message.text.toLowerCase().includes(word)) {
        missing = true;
        return false;
      }
    });

    return !missing;
  }

  /**
   * @return {string|boolean} Slack ID of the first tagged user, or false if there was none.
   */
  getTaggedUser() {
    const userRegEx = /<@((U|W)[A-Z0-9]{5,10})>/;
    const messageWithoutSelfTag = this.message.text.replace(this.botId, '');
    const userMatch = messageWithoutSelfTag.match(userRegEx);
    if (userMatch !== null) {
      return userMatch[1];
    }
    return false;
  }

  /**
   * @return {string|boolean} Date in format YYYY-MM-DD, or false if there was none.
   */
  getDate() {
    const dateRegEx = /(\d{4})-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])/;
    const dateMatch = this.message.text.match(dateRegEx);
    if (dateMatch !== null) {
      const testDate = Date.parse(dateMatch[0]);
      if (!Number.isNaN(testDate)) {
        return dateMatch[0];
      }
    }
    return false;
  }
}

module.exports = Message;
