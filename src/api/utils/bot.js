const fs = require('fs');

const TG_ADMIN = parseInt(process.env.TGADMIN, 10);
const OFF = 'Off';
const ON = 'On';

class BotHelper {
  constructor(bot) {
    this.bot = bot;
    let c = {no_puppet: false};
    try {
      c = JSON.parse(`${fs.readFileSync('.conf/config.json')}`);
    } catch (e) {
      //
    }
    this.config = c;
    this.tgAdmin = TG_ADMIN;
  }

  isAdmin(chatId) {
    return chatId === this.tgAdmin;
  }

  botMes(chatId, text, mark = true) {
    let opts = {};
    if (mark) {
      opts = {parse_mode: 'Markdown'};
    }
    return this.bot
      .sendMessage(chatId, text, opts)
      .catch(e => this.sendError(e, `${chatId}${text}`));
  }

  sendAdmin(textParam, chatIdParam = '', t = '') {
    let chatId = chatIdParam;
    let text = textParam;
    if (!chatId) {
      chatId = TG_ADMIN;
    }
    if (`${chatId}` === `${this.tgAdmin}`) {
      text = `service: ${text} ${t}`;
    }
    return this.bot.sendMessage(chatId, text).catch(() => {});
  }

  parseConfig(params) {
    let content;
    let param;
    const c = params.replace(' _content', '_content').split(/\s/);
    if (c.length === 2) {
      [param] = c;
      content = c[1].replace(/~/g, ' ');
    } else {
      [param] = c;
      if (this.config[param] === ON) {
        content = OFF;
      } else {
        content = ON;
      }
    }
    return {param, content};
  }

  toggleConfig(msg) {
    const params = msg.text.replace('/config', '').trim();
    if (!params || !this.isAdmin(msg.chat.id)) {
      return Promise.resolve('no param or forbidden');
    }

    const {param, content} = this.parseConfig(params);
    this.config[param] = content;
    fs.writeFileSync('.conf/config.json', JSON.stringify(this.config));
    return this.botMes(TG_ADMIN, content, false);
  }

  sendError(error, text = '') {
    let e = error;
    if (typeof e === 'object') {
      if (e.response && typeof e.response === 'object') {
        e = e.response.description || 'unknown error';
      }
    } else {
      e = `error: ${JSON.stringify(e)} ${e.toString()} ${text}`;
    }

    return this.sendAdmin(e);
  }

  forward(mid, from, to) {
    return this.bot.forwardMessage(to, from, mid);
  }

  getBot() {
    return this.bot;
  }
}

module.exports = BotHelper;
