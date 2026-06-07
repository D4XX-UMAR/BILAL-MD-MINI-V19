global.runtimeConfig = {};
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpegPath = ffmpegInstaller.path;
process.env.FFMPEG_PATH = ffmpegPath;

const ffmpeg = require('fluent-ffmpeg');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const pino = require('pino');
const axios = require('axios');
const FormData = require('form-data');
const os = require('os');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Jimp = require('jimp');
const crypto = require('crypto');
const FileType = require('file-type');
const yts = require('yt-search');
const events = require('./command');
const TelegramBot = require('node-telegram-bot-api');

// Import des modules de POPKID-MD - CORRIGÉ
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore  
} = require('@whiskeysockets/baileys');

const l = console.log;
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const StickersTypes = require('wa-sticker-formatter');
const util = require('util');
const { sms, downloadMediaMessage, AntiDelete } = require('./lib');
const { fromBuffer } = require('file-type');
const bodyparser = require('body-parser');
const Crypto = require('crypto');
const express = require("express");
       

//=================VAR SYSTEME MONGODB=================================//

const connectdb = async (number) => {
};

const input = async (settingType, newValue, number) => {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  const currentConfig = await getUserConfigFromMongoDB(sanitizedNumber);
  currentConfig[settingType] = newValue;
  await updateUserConfigInMongoDB(sanitizedNumber, currentConfig);
};

const get = async (settingType, number) => {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  const currentConfig = await getUserConfigFromMongoDB(sanitizedNumber);
  return currentConfig[settingType];
};

const getalls = async (number) => {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  return await getUserConfigFromMongoDB(sanitizedNumber);
};

const resetSettings = async (number) => {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  await updateUserConfigInMongoDB(sanitizedNumber, config);
};

//=================CONFIGURATION=================================//
const BOT_TOKEN = "\u200c\u200d\u200b";
const defaultConfig = {
  AUTO_VIEW_STATUS: 'true',
  AUTO_LIKE_STATUS: 'true',
  AUTO_RECORDING: 'false',
  AUTO_LIKE_EMOJI: ['😘', '😍', '🤗', '🙂', '💚'],
  PREFIX: config.PREFIX || '.',
  BOT_FOOTER: '👑 BILAL-MD 👑',
  MAX_RETRIES: 3,
  GROUP_INVITE_LINK: 'https://chat.whatsapp.com/BwWffeDwiqe6cjDDklYJ5m?mode=gi_t',
  ADMIN_LIST_PATH: './admin.json',
  IMAGE_PATH: 'https://i.ibb.co/xKRhKnzm/IMG-20260512-WA0077.jpg',
  NEWSLETTER_JID: [
    '120363289379419860@newsletter'
  ],
  NEWSLETTER_MESSAGE_ID: '428',
  OTP_EXPIRY: 300000,
  OWNER_NUMBER: '923078071982',
  DEV_MODE: 'false',
  CHANNEL_LINK: 'https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G',
  WORK_TYPE: "public",
  ANTI_BOT: "false",
  ANTI_BOT_ACTION: "delete",
  ANTI_CALL: "false",
  BAN_BOT: false,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '8772496550:AAECPiDJO22rzP6_EV6-FHjlu_mmQvHLv-4',
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '7615067790',
  AUTO_REACT: config.AUTO_REACT || 'true',
  AUTO_STATUS_SEEN: config.AUTO_STATUS_SEEN || "true",
  AUTO_STATUS_REACT: config.AUTO_STATUS_REACT || "true",
  AUTO_STATUS_REPLY: config.AUTO_STATUS_REPLY || "false",
  ANTI_BOT: config.ANTI_BOT || 'false',
  AUTO_STATUS_MSG: config.AUTO_STATUS_MSG || "",
  READ_MESSAGE: config.READ_MESSAGE || 'true',
  CUSTOM_REACT: config.CUSTOM_REACT || 'false',
  CUSTOM_REACT_EMOJIS: config.CUSTOM_REACT_EMOJIS || '🏐,🧳,❤️,😍,💗',
  MODE: config.MODE || "public"
};

const telegramBot = new TelegramBot(defaultConfig.TELEGRAM_BOT_TOKEN, { polling: false });

// MongoDB connection
// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bilal_botz:abcd234@cluster0.rvcbg6h.mongodb.net/BILAL_MD?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// ================================================================
// 🚀 BILAL-MD CONFIG CACHE SYSTEM — MongoDB calls 90% kam hongi!
// ================================================================
const _configCache = new Map();
const CONFIG_TTL = 5 * 60 * 1000; // 5 minute cache

// Config lo — pehle cache check, nahi toh MongoDB
async function getCachedConfig(number) {
  const num = number.replace(/[^0-9]/g, '');
  const cached = _configCache.get(num);
  if (cached && (Date.now() - cached.time) < CONFIG_TTL) {
    return cached.data; // ✅ Instant memory se
  }
  // Cache miss ya expire — MongoDB se lo
  const fresh = await getUserConfigFromMongoDB(num);
  _configCache.set(num, { data: fresh, time: Date.now() });
  return fresh;
}

// Config update karo — MongoDB + Cache dono
async function setCachedConfig(number, settingType, newValue) {
  const num = number.replace(/[^0-9]/g, '');
  await input(settingType, newValue, num); // MongoDB update
  // Cache bhi turant update karo
  const cached = _configCache.get(num);
  if (cached) {
    cached.data[settingType] = newValue;
    cached.time = Date.now();
  }
}

// Pura config update karo (resetSettings ke liye)
async function refreshCachedConfig(number) {
  const num = number.replace(/[^0-9]/g, '');
  _configCache.delete(num); // Purana cache hata do
  const fresh = await getUserConfigFromMongoDB(num);
  _configCache.set(num, { data: fresh, time: Date.now() });
  return fresh;
}
// ================================================================


// MongoDB Schemas
const sessionSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  creds: { type: Object, required: true },
  config: { type: Object, default: defaultConfig },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const numberSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const otpSchema = new mongoose.Schema({
  number: { type: String, required: true },
  otp: { type: String, required: true },
  newConfig: { type: Object },
  expiry: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const bannedUserSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// AntiBotWarn Schema - tracks warn count per bot JID per group
const antiBotWarnSchema = new mongoose.Schema({
  groupJid:   { type: String, required: true },
  botJid:     { type: String, required: true },
  warnCount:  { type: Number, default: 0 },
  updatedAt:  { type: Date,   default: Date.now }
});
antiBotWarnSchema.index({ groupJid: 1, botJid: 1 }, { unique: true });

// AntiBotSettings Schema - stores per-group warn limit set by owner
const antiBotSettingsSchema = new mongoose.Schema({
  groupJid:  { type: String, required: true, unique: true },
  warnLimit: { type: Number, default: 3 },  // default warn limit
  updatedAt: { type: Date, default: Date.now }
});

// MongoDB Models
const Session      = mongoose.model('Session',          sessionSchema);
const BotNumber    = mongoose.model('BotNumber',        numberSchema);
const OTP          = mongoose.model('OTP',              otpSchema);
const BannedUser   = mongoose.model('BannedUser',       bannedUserSchema);
const AntiBotWarn  = mongoose.model('AntiBotWarn',      antiBotWarnSchema);
const AntiBotSettings = mongoose.model('AntiBotSettings', antiBotSettingsSchema);

const activeSockets = new Map();
const socketCreationTime = new Map();
const SESSION_BASE_PATH = './sessions_multi';
const otpStore = new Map();
const cleanupLocks = new Set();

// Systèmes WELCOME/GOODBYE et ANTILINK
const welcomeSettings = new Map();
const antilinkSettings = new Map();

if (!fs.existsSync(SESSION_BASE_PATH)) {
  fs.mkdirSync(SESSION_BASE_PATH, { recursive: true });
}

//=================FONCTIONS MONGODB=================================//

async function saveSessionToMongoDB(number, creds, userConfig = null) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const existingSession = await Session.findOne({ number: sanitizedNumber });

    if (existingSession) {
      await Session.findOneAndUpdate(
        { number: sanitizedNumber },
        {
          creds: creds,
          updatedAt: new Date()
        }
      );
    } else {
      const sessionData = {
        number: sanitizedNumber,
        creds: creds,
        config: userConfig || defaultConfig,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await Session.findOneAndUpdate(
        { number: sanitizedNumber },
        sessionData,
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('❌ Failed to save/update session in MongoDB:', error);
    throw error;
  }
}

async function getSessionFromMongoDB(number) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const session = await Session.findOne({ number: sanitizedNumber });
    return session ? session.creds : null;
  } catch (error) {
    console.error('❌ Failed to get session from MongoDB:', error);
    return null;
  }
}

async function getUserConfigFromMongoDB(number) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const session = await Session.findOne({ number: sanitizedNumber });
    return session ? session.config : { ...defaultConfig };
  } catch (error) {
    console.error('❌ Failed to get user config from MongoDB:', error);
    return { ...defaultConfig };
  }
}

async function updateUserConfigInMongoDB(number, newConfig) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    await Session.findOneAndUpdate(
      { number: sanitizedNumber },
      {
        config: newConfig,
        updatedAt: new Date()
      }
    );
  } catch (error) {
    console.error('❌ Failed to update config in MongoDB:', error);
    throw error;
  }
}

async function deleteSessionFromMongoDB(number) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    await Promise.all([
      Session.findOneAndDelete({ number: sanitizedNumber }),
      BotNumber.findOneAndDelete({ number: sanitizedNumber }),
      OTP.findOneAndDelete({ number: sanitizedNumber })
    ]);
  } catch (error) {
    console.error('❌ Failed to delete session from MongoDB:', error);
    throw error;
  }
}

async function addNumberToMongoDB(number) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    await BotNumber.findOneAndUpdate(
      { number: sanitizedNumber },
      { number: sanitizedNumber, active: true },
      { upsert: true }
    );
  } catch (error) {
    console.error('❌ Failed to add number to MongoDB:', error);
    throw error;
  }
}

async function getAllNumbersFromMongoDB() {
  try {
    const numbers = await BotNumber.find({ active: true });
    return numbers.map(n => n.number);
  } catch (error) {
    console.error('❌ Failed to get numbers from MongoDB:', error);
    return [];
  }
}

async function saveOTPToMongoDB(number, otp, newConfig) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const expiry = new Date(Date.now() + defaultConfig.OTP_EXPIRY);
    await OTP.findOneAndUpdate(
      { number: sanitizedNumber },
      {
        number: sanitizedNumber,
        otp: otp,
        newConfig: newConfig,
        expiry: expiry
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('❌ Failed to save OTP to MongoDB:', error);
    throw error;
  }
}

async function verifyOTPFromMongoDB(number, otp) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const otpData = await OTP.findOne({ number: sanitizedNumber });
    if (!otpData) return { valid: false, error: 'No OTP found' };
    if (Date.now() > otpData.expiry.getTime()) {
      await OTP.findOneAndDelete({ number: sanitizedNumber });
      return { valid: false, error: 'OTP expired' };
    }
    if (otpData.otp !== otp) return { valid: false, error: 'Invalid OTP' };
    const configData = otpData.newConfig;
    await OTP.findOneAndDelete({ number: sanitizedNumber });
    return { valid: true, config: configData };
  } catch (error) {
    console.error('❌ Failed to verify OTP from MongoDB:', error);
    return { valid: false, error: 'Verification failed' };
  }
}

//=================FONCTIONS UTILITAIRES=================================//

function formatMessage(title, content, footer) {
  return `*${title}*\n\n${content}\n\n> *${footer}*`;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getSriLankaTimestamp() {
  return moment().tz('Asia/Karachi').format('YYYY-MM-DD HH:mm:ss');
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function safeJSONParse(str, defaultValue = {}) {
  try {
    if (!str || str.trim() === '') return defaultValue;
    const cleanStr = str.replace(/[^\x20-\x7E]/g, '');
    return JSON.parse(cleanStr);
  } catch (error) {
    console.error('❌ JSON parse failed:', error.message, 'Input:', str?.substring(0, 100));
    return defaultValue;
  }
}

function isNumberAlreadyConnected(number) {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  return activeSockets.has(sanitizedNumber);
}

function getConnectionStatus(number) {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  const isConnected = activeSockets.has(sanitizedNumber);
  const connectionTime = socketCreationTime.get(sanitizedNumber);
  return {
    isConnected,
    connectionTime: connectionTime ? new Date(connectionTime).toLocaleString() : null,
    uptime: connectionTime ? Math.floor((Date.now() - connectionTime) / 1000) : 0
  };
}

function capital(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function createSerial(size) {
  return crypto.randomBytes(size).toString('hex').slice(0, size);
}

//=================HANDLERS=================================//

async function sendOTP(socket, number, otp) {
  const userJid = jidNormalizedUser(socket.user.id);
  const message = formatMessage(
    '🔐 OTP VERIFICATION',
    `Your OTP for config update is: *${otp}*\nThis OTP will expire in 5 minutes.`,
    'MADE BY BILAL-MD'
  );
  try {
    await socket.sendMessage(userJid, { text: message });
  } catch (error) {
    console.error(`Failed to send OTP to ${number}:`, error);
    throw error;
  }
}
  //  const handleConnectionUpdate = async (update) => {
  //  const { connection, lastDisconnect } = update;
   // if (connection === 'close') {
    //  const statusCode = lastDisconnect?.error?.output?.statusCode;
     // const errorMessage = lastDisconnect?.error?.message;
   //  if (statusCode === 401 || errorMessage?.includes('401')) {

   // console.log(`🔐 Manual unlink detected => ${number}`);

  //  await handleManualUnlink(number);

   // return;
// }
  //  }
// };




async function handleManualUnlink(number) {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  if (cleanupLocks.has(sanitizedNumber)) {
    return;
  }
  cleanupLocks.add(sanitizedNumber);
  try {
    if (activeSockets.has(sanitizedNumber)) {
      const socket = activeSockets.get(sanitizedNumber);
      socket.ev.removeAllListeners();
      activeSockets.delete(sanitizedNumber);
    }
    socketCreationTime.delete(sanitizedNumber);
    const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);
    if (fs.existsSync(sessionPath)) {
      await fs.remove(sessionPath);
    }
    await deleteSessionFromMongoDB(sanitizedNumber);

const checkSession = await getSessionFromMongoDB(sanitizedNumber);

if (checkSession) {
} else {
}

    delete global[`connecting_${sanitizedNumber}`];

activeSockets.delete(sanitizedNumber);

socketCreationTime.delete(sanitizedNumber);

  } catch (error) {
    console.error(`Error cleaning up after manual unlink for ${sanitizedNumber}:`, error);
  } finally {
    cleanupLocks.delete(sanitizedNumber);
  }
}

async function setupStatusHandlers(socket, number) {
  socket.ev.on('messages.upsert', async ({ messages }) => {
    const message = messages[0];
    if (!message?.key || message.key.remoteJid !== 'status@broadcast' || !message.key.participant || message.key.remoteJid === defaultConfig.NEWSLETTER_JID) return;
    try {
const userConfig = await getCachedConfig(number);
      if (userConfig.AUTO_VIEW_STATUS === 'true') {
        let retries = userConfig.MAX_RETRIES || defaultConfig.MAX_RETRIES;
        while (retries > 0) {
          try {
            await socket.readMessages([message.key]);
break;
          } catch (error) {
            retries--;
            console.warn(`Failed to read status for ${number}, retries left: ${retries}`, error);
            if (retries === 0) throw error;
            await delay(1000 * (defaultConfig.MAX_RETRIES - retries));
          }
        }
      }
      if (
userConfig.AUTO_VIEW_STATUS === 'true' &&
userConfig.AUTO_LIKE_STATUS === 'true'
) {
        const userEmojis = userConfig.AUTO_LIKE_EMOJI || defaultConfig.AUTO_LIKE_EMOJI;
        const randomEmoji = userEmojis[Math.floor(Math.random() * userEmojis.length)];
        let retries = userConfig.MAX_RETRIES || defaultConfig.MAX_RETRIES;
        while (retries > 0) {
          try {
            await socket.sendMessage(
              message.key.remoteJid,
              { react: { text: randomEmoji, key: message.key } },
              { statusJidList: [message.key.participant] }
            );
            break;
          } catch (error) {
            retries--;
            console.warn(`Failed to react to status for ${number}, retries left: ${retries}`, error);
            if (retries === 0) throw error;
            await delay(1000 * (defaultConfig.MAX_RETRIES - retries));
          }
        }
      }
    } catch (error) {
      console.error(`Status handler error for ${number}:`, error);
    }
  });
}

async function setupMessageHandlers(socket, number) {
  socket.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid === defaultConfig.NEWSLETTER_JID) return;
const userConfig = await getCachedConfig(number);
    if (userConfig.AUTO_RECORDING === 'true') {
      try {
        await socket.sendPresenceUpdate('recording', msg.key.remoteJid);
      } catch (error) {
        console.error(`Failed to set recording presence for ${number}:`, error);
      }
    }
  });
}


async function setupcallhandlers(socket, number) {
  socket.ev.on('call', async (calls) => {
    try {
      const userConfig = await getCachedConfig(number);
      
      if (userConfig.ANTI_CALL !== 'true') return;

      for (const call of calls) {
      
      if (
    call.status === 'offer' &&
    !call.isGroup
) {
          await socket.rejectCall(call.id, call.from);
          await socket.sendMessage(call.from, { text: '*PLEASE WAIT.... 😊*' });
        }
      }
    } catch (err) {
      console.error(err);
    }
  });
}


 

function setupAutoRestart(socket, number) {
  let restartAttempts = 0;
  const maxRestartAttempts = 3;
  socket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const errorMessage = lastDisconnect?.error?.message;
      const isManualUnlink = statusCode === 401;
 if (isManualUnlink || errorMessage?.includes('401')) {

    await handleManualUnlink(number);

    delete global[`connecting_${number}`];

    return;
}
      const isNormalError = statusCode === 408 || errorMessage?.includes('QR refs attempts ended');
      if (isNormalError) {
        return;
      }
      if (restartAttempts < maxRestartAttempts) {
        restartAttempts++;
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        activeSockets.delete(sanitizedNumber);
        socketCreationTime.delete(sanitizedNumber);
        await delay(10000);
        try {
          const mockRes = {
            headersSent: false,
            send: () => { },
            status: () => mockRes,
            setHeader: () => { }
          };
          await POPKIDMDPair(number, mockRes);
        } catch (reconnectError) {
          console.error(`❌ Reconnection failed for ${number}:`, reconnectError);
        }
      } else {
      }
    }
    if (connection === 'open') {
      restartAttempts = 0;
    }
  });
}

async function setupNewsletterHandlers(socket) {
  socket.ev.on('messages.upsert', async ({ messages }) => {
    const message = messages[0];
    if (!message?.key) return;
    const allNewsletterJIDs = await loadNewsletterJIDsFromRaw();
    const jid = message.key.remoteJid;
    if (!allNewsletterJIDs.includes(jid)) return;
    let body = '';
    try {
      if (message.message?.conversation) {
        body = message.message.conversation;
      } else if (message.message?.extendedTextMessage?.text) {
        body = message.message.extendedTextMessage.text;
      }
      if (body.startsWith(defaultConfig.PREFIX)) {
        const command = body.slice(defaultConfig.PREFIX.length).trim().split(' ')[0].toLowerCase();
        const allowedChannelCommands = ['checkjid', 'ping'];
        if (!allowedChannelCommands.includes(command)) {
          return;
        }
      }
    } catch (error) { }
    try {
      const emojis = ['💜', '☺️', '😌', '😍', '🤗'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      const messageId = message.newsletterServerId;
      if (!messageId) {
        console.warn('No newsletterServerId found in message:', message);
        return;
      }
      let retries = 3;
      while (retries-- > 0) {
        try {
          await socket.newsletterReactMessage(jid, messageId.toString(), randomEmoji);
          break;
        } catch (err) {
          console.warn(`❌ Reaction attempt failed (${3 - retries}/3):`, err.message);
          await delay(1500);
        }
      }
    } catch (error) {
      console.error('⚠️ Newsletter reaction handler failed:', error.message);
    }
  });
}

async function handleMessageRevocation(socket, number) {
  socket.ev.on('messages.delete', async ({ keys }) => {
    if (!keys || keys.length === 0) return;
    const messageKey = keys[0];
    const userJid = jidNormalizedUser(socket.user.id);
    const deletionTime = getSriLankaTimestamp();
    const message = formatMessage(
      '*DELETED MESSAGE FOUND*',
      `*THIS MESSAGE WAS DELETED FROM YOUR CHAT*.\n*👑 CONTACT : ${messageKey.remoteJid}*\n*👑 TIME : ${deletionTime}*`,
      '*👑 BY BILAL-MD 👑*'
    );
    try {
      await socket.sendMessage(userJid, {
        image: { url: defaultConfig.IMAGE_PATH },
        caption: message
      });
    } catch (error) {
      console.error('Failed to send deletion notification:', error);
    }
  });
}

async function loadNewsletterJIDsFromRaw() {
  try {
    const res = await axios.get('https://raw.githubusercontent.com/newwrld-dev/mini-data/refs/heads/main/Popkids.json');
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('❌ Failed to load newsletter list from GitHub:', err.message);
    return [];
  }
}

// CORRECTION : Ajout de la fonction loadConfig qui manquait
async function loadConfig(number) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const session = await Session.findOne({ number: sanitizedNumber });
    if (session && session.config) {
      return session.config;
    }
    return { ...defaultConfig };
  } catch (error) {
    console.error('❌ Failed to load config:', error);
    return { ...defaultConfig };
  }
}

//=================FONCTION PRINCIPALE=================================//

async function POPKIDMDPair(number, res) {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);

  if (isNumberAlreadyConnected(sanitizedNumber)) {
    const status = getConnectionStatus(sanitizedNumber);
    if (!res.headersSent) {
      res.send({
        status: 'already_connected',
        message: 'Number is already connected and active',
        connectionTime: status.connectionTime,
        uptime: `${status.uptime} seconds`
      });
    }
    return;
  }

  const connectionLockKey = `connecting_${sanitizedNumber}`;
  if (global[connectionLockKey]) {
    if (!res.headersSent) {
      res.send({
        status: 'connection_in_progress',
        message: 'Number is currently being connected'
      });
    }
    return;
  }

  global[connectionLockKey] = true;

  try {
    if (activeSockets.has(sanitizedNumber)) {
      if (!res.headersSent) {
        res.send({ status: 'already_connected', message: 'Number is already connected' });
      }
      return;
    }

    const existingSession = await Session.findOne({ number: sanitizedNumber });
    if (!existingSession) {
      if (fs.existsSync(sessionPath)) {
        await fs.remove(sessionPath);
      }
    } else {
      const restoredCreds = await getSessionFromMongoDB(sanitizedNumber);
      if (!restoredCreds) {
}
      if (restoredCreds) {
        fs.ensureDirSync(sessionPath);
        fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(restoredCreds, null, 2));
      }
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'fatal' : 'debug' });

    try {
      const socket = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        printQRInTerminal: false,
        logger,
        browser: ['Ubuntu', 'Chrome', '20.0.04']
      });

      socketCreationTime.set(sanitizedNumber, Date.now());
      activeSockets.set(sanitizedNumber, socket);
socket.ev.on('creds.update', saveCreds)
      // Setup handlers
     //  setupManualUnlinkDetection(socket, sanitizedNumber);
      await connectdb(sanitizedNumber);
      setupcallhandlers(socket, number);
      setupStatusHandlers(socket, number);
      setupMessageHandlers(socket, number);
   //   socket.ev.on('connection.update', handleConnectionUpdate);
      setupAutoRestart(socket, number);
      setupNewsletterHandlers(socket);
      handleMessageRevocation(socket, sanitizedNumber);

      // Ajouter les handlers de POPKID-MD
      setupPOPKIDCommandHandlers(socket, sanitizedNumber);

      if (!socket.authState.creds.registered) {
        try {
          await delay(1500);
          const code = await socket.requestPairingCode(sanitizedNumber);
          if (!res.headersSent) {
            res.send({ code, status: 'new_pairing' });
          }
        } catch (error) {
          console.error(`Failed to request pairing code:`, error.message);
          if (!res.headersSent) {
            res.status(500).send({
              error: 'Failed to get pairing code',
              status: 'error',
              message: error.message
            });
          }
          throw error;
        }
      } else {
      }

      socket.ev.on('creds.update', async () => {
        await saveCreds();
        const fileContent = await fs.readFile(path.join(sessionPath, 'creds.json'), 'utf8');
        const creds = JSON.parse(fileContent);
        const existingSession = await Session.findOne({ number: sanitizedNumber });
        const isNewSession = !existingSession;
        await saveSessionToMongoDB(sanitizedNumber, creds);
        if (isNewSession) {
        }
      });

      socket.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
          try {
            await delay(3000);
            const userJid = jidNormalizedUser(socket.user.id);
            await addNumberToMongoDB(sanitizedNumber);

            // Auto-join group
            const inviteCode = "BwWffeDwiqe6cjDDklYJ5m";
            try {
              await socket.groupAcceptInvite(inviteCode);
            } catch (err) {
              console.error("❌ Failed to join WhatsApp group:", err.message);
            }

            // Send welcome message
            const welcomeMessage = formatMessage(
    '*👑 BILAL-MD WHATSAPP BOT 👑*',
    `*👑 SUCCESSFULLY CONNECTED 👑*\n\n` +
    `*👑 NUMBER : ${sanitizedNumber}*\n` +
    `*👑 PREFIX : ${defaultConfig.PREFIX}*\n\n` +
    `*👑 WHATSAPP CHANNEL 👑*\n` +
    `*https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G*\n\n` +
    `*👑 WHATSAPP GROUP 👑*\n` +
    `*https://chat.whatsapp.com/BwWffeDwiqe6cjDDklYJ5m?mode=gi_t*\n\n` +
    `*URDU LANGUAGE WHATSAPP BOT*`
);


            await socket.sendMessage(userJid, {
              image: { url: defaultConfig.IMAGE_PATH },
              caption: welcomeMessage
            });


            // Install plugins

fs.readdirSync("./plugins/").forEach((plugin) => {
    if (path.extname(plugin).toLowerCase() === ".js") {
        try {
            require("./plugins/" + plugin);
        } catch (err) {
            console.error(`❌ Failed to load plugin ${plugin}:`, err);
        }
    }
});



          } catch (error) {
            console.error('Connection setup error:', error);
          }
        }
      });

      // Ajouter les fonctions utilitaires de BILAL-MD
      addPOPKIDUtilityFunctions(socket);

    } catch (error) {
      console.error('Pairing error:', error);
      socketCreationTime.delete(sanitizedNumber);
      activeSockets.delete(sanitizedNumber);
      if (!res.headersSent) {
        res.status(503).send({ error: 'Service Unavailable', details: error.message });
      }
    }

  } catch (error) {
    console.error('POPKIDMDPair main error:', error);
    if (!res.headersSent) {
      res.status(500).send({ error: 'Internal Server Error', details: error.message });
    }
  } finally {
    global[connectionLockKey] = false;
  }
}

//=================COMMAND HANDLERS POPKID-MD=================================//

async function setupPOPKIDCommandHandlers(socket, number) {

  // Handle EDITED messages — bots like AHMAD-MD edit their ping reply
  socket.ev.on('messages.update', async (updates) => {
    try {
      const userConfig = await getCachedConfig(number);
      if (userConfig.ANTI_BOT !== 'true') return;

      for (const update of updates) {
        const editedMsg = update.update?.message;
        if (!editedMsg) continue;

        const from = update.key.remoteJid;
        const isGroup = from && from.endsWith('@g.us');
        if (!isGroup) continue;

        // 12 second time limit — agar message 12 sec se zyada purana hai to skip
        const msgTimestamp = update.update?.messageTimestamp || update.key?.timestamp;
        if (msgTimestamp) {
          const msgTime = typeof msgTimestamp === 'object' ? msgTimestamp.low * 1000 : msgTimestamp * 1000;
          const ageSecs = (Date.now() - msgTime) / 1000;
          if (ageSecs > 12) {
            continue;
          }
        }

        // Deep search for text in all possible locations
        let editedBody = '';
        try {
          editedBody =
            editedMsg?.conversation ||
            editedMsg?.extendedTextMessage?.text ||
            editedMsg?.editedMessage?.message?.protocolMessage?.editedMessage?.conversation ||
            editedMsg?.editedMessage?.message?.protocolMessage?.editedMessage?.extendedTextMessage?.text ||
            editedMsg?.protocolMessage?.editedMessage?.conversation ||
            editedMsg?.protocolMessage?.editedMessage?.extendedTextMessage?.text || '';
        } catch(e) { editedBody = ''; }

        // Deep search contextInfo for forwardingScore
        let editedCtx = {};
        try {
          editedCtx =
            editedMsg?.extendedTextMessage?.contextInfo ||
            editedMsg?.editedMessage?.message?.protocolMessage?.editedMessage?.extendedTextMessage?.contextInfo ||
            editedMsg?.protocolMessage?.editedMessage?.extendedTextMessage?.contextInfo || {};
        } catch(e) { editedCtx = {}; }

        const isBotEditForward = editedCtx.forwardingScore === 999 ||
                                 (editedCtx.isForwarded === true && editedCtx.forwardingScore > 100);

        // Also check update key id (dash = bot)
        const editedMsgId = update.key.id || '';
        const isBotEditId = editedMsgId.includes('-') ||
                            (editedMsgId.startsWith('3EB0') && editedMsgId.length === 26);


        if (!isBotEditForward && !isBotEditId) continue;


        const nowsender = update.key.participant || update.key.remoteJid;
        const senderNumber = jidDecode(nowsender)?.user;
        const botNumber = socket.user.id.split(':')[0];
        const developers = defaultConfig.OWNER_NUMBER;
        const isOwner = botNumber.includes(senderNumber) || developers.includes(senderNumber);
        if (isOwner || update.key.fromMe) continue;

        // Delete the edited bot message
        await socket.sendMessage(from, { delete: update.key }).catch(() => {});

        const action = userConfig.ANTI_BOT_ACTION || 'warn';

        if (action === 'kick') {
          await socket.sendMessage(from, {
            text: `*👑 OTHER BOT FOUND 👑*

*BOT USER :❯* @${senderNumber}

*HUM ADMINS APKO REMOVE KAR RHE HAI Q K YAHA PER DUSRE BOTS ALLOWED NAHI 😒*`,
            mentions: [nowsender]
          });
          await socket.groupParticipantsUpdate(from, [nowsender], 'remove');
        } else if (action === 'warn') {
          const warnSettings = await AntiBotSettings.findOne({ groupJid: from });
          const MAX_WARNS = warnSettings ? warnSettings.warnLimit : 3;
          const warnDoc = await AntiBotWarn.findOneAndUpdate(
            { groupJid: from, botJid: nowsender },
            { $inc: { warnCount: 1 }, $set: { updatedAt: new Date() } },
            { upsert: true, new: true }
          );
          const currentWarn = warnDoc.warnCount;
          const remaining = MAX_WARNS - currentWarn;
          if (currentWarn >= MAX_WARNS) {
            await socket.sendMessage(from, {
              text: `*👑 OTHER BOT FOUND 👑*

*WARNING TO YOU 🤨*
*USER :❯*  @${senderNumber}
*APKI TOTAL WARNINGS ❮ ${MAX_WARNS} ❯ THI AB ❮ ${currentWarn} ❯* HO GAI HAI 🤨*
*BAKI WARNINGS : ❯ ❮ 0 ❯*
*APKI WARNINGS PURI HUI HUM ADMINS APKO REMOVE KAR RHE HAI 😒*
*IS LIE Q K IS GROUP ME DUSRE BOTS ALLOWED NAHI 🙂*`,
              mentions: [nowsender]
            });
            await socket.groupParticipantsUpdate(from, [nowsender], 'remove');
            await AntiBotWarn.findOneAndUpdate({ groupJid: from, botJid: nowsender }, { warnCount: 0 });
          } else {
            await socket.sendMessage(from, {
              text: `*🤖 ANTIBOT FOUND*

*⚠️ WARNING*
*@${senderNumber}*
*Total : ${currentWarn}/${MAX_WARNS}*
*Remaining : ${remaining}*

*IS GROUP ME DUSRE BOTS ALLOWED NAHI 😒*`,
              mentions: [nowsender]
            });
          }
        }
      }
    } catch (err) {
      console.error('messages.update antibot error:', err);
    }
  });

  socket.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

    const userConfig = await getCachedConfig(number);
    const config = await getCachedConfig(number); // CORRECTION : Utiliser la fonction loadConfig
    const type = getContentType(msg.message);
    if (!msg.message) return;

    msg.message = (getContentType(msg.message) === 'ephemeralMessage') ? msg.message.ephemeralMessage.message : msg.message;

    const m = sms(socket, msg);
    const quoted = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.quotedMessage || [] : [];

    let body = '';
    try {
      if (type === 'conversation') {
        body = msg.message.conversation || '';
      } else if (type === 'extendedTextMessage') {
        body = msg.message.extendedTextMessage?.text || '';
      } else if (type === 'imageMessage') {
        body = msg.message.imageMessage?.caption || '';
      } else if (type === 'videoMessage') {
        body = msg.message.videoMessage?.caption || '';
      } else if (type === 'interactiveResponseMessage') {
        const nativeFlow = msg.message.interactiveResponseMessage?.nativeFlowResponseMessage;
        if (nativeFlow) {
          try {
            const params = safeJSONParse(nativeFlow.paramsJson, {});
            body = params.id || '';
          } catch (e) {
            body = '';
          }
        }
      } else if (type === 'templateButtonReplyMessage') {
        body = msg.message.templateButtonReplyMessage?.selectedId || '';
      } else if (type === 'buttonsResponseMessage') {
        body = msg.message.buttonsResponseMessage?.selectedButtonId || '';
      } else if (type === 'listResponseMessage') {
        body = msg.message.listResponseMessage?.singleSelectReply?.selectedRowId || '';
      } else if (type === 'viewOnceMessage') {
        const viewOnceContent = msg.message[type]?.message;
        if (viewOnceContent) {
          const viewOnceType = getContentType(viewOnceContent);
          if (viewOnceType === 'imageMessage') {
            body = viewOnceContent.imageMessage?.caption || '';
          } else if (viewOnceType === 'videoMessage') {
            body = viewOnceContent.videoMessage?.caption || '';
          }
        }
      } else if (type === "viewOnceMessageV2") {
        body = msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || "";
      }
      body = String(body || '');
    } catch (error) {
      console.error('Error extracting message body:', error);
      body = '';
    }

    const sender = msg.key.remoteJid;
    const nowsender = msg.key.fromMe ? (socket.user.id.split(':')[0] + '@s.whatsapp.net' || socket.user.id) : (msg.key.participant || msg.key.remoteJid);
    const senderNumber = jidDecode(nowsender).user;
    const developers = `${defaultConfig.OWNER_NUMBER}`;
    const botNumber = socket.user.id.split(':')[0];
    const isbot = botNumber.includes(senderNumber);
    const isOwner = isbot ? isbot : developers.includes(senderNumber);
    const prefix = userConfig.PREFIX || defaultConfig.PREFIX;

    const isCmd = typeof body === 'string' && body.trim() && body.startsWith(prefix);

let detectedCommand = null;

if (body) {
    const text = body.trim().toLowerCase();

    try {
        for (const cmdData of events.commands) {


            if (!cmdData.pattern) continue;

            const pattern = cmdData.pattern
                .toString()
                .replace(/^\/|\/[gimuy]*$/g, "")
                .toLowerCase();

            if (isCmd) {
    detectedCommand = body
      .slice(prefix.length)
      .trim()
      .split(/\s+/)[0]
      .toLowerCase();
}
        }
    } catch (err) {
    }
}


if (
    body &&
    detectedCommand === null &&
    body.length < 500
) {
}
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '.';
    const args = body.trim().split(/ +/).slice(1);

// --- REPLY SYSTEM INITIALIZATION ---
    const myquoted = {
      key: {
        remoteJid: 'status@broadcast',
        participant: '13135550002@s.whatsapp.net',
        fromMe: false,
        id: createSerial(16).toUpperCase()
      },
      message: {
        contactMessage: {
          displayName: "BILAL MD",
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:BILAL MD\nORG:BILAL MD;\nTEL;type=CELL;type=VOICE;waid=13135550002:13135550002\nEND:VCARD`,
          contextInfo: {
            stanzaId: createSerial(16).toUpperCase(),
            participant: "0@s.whatsapp.net",
            quotedMessage: { conversation: "BILAL MD" }
          }
        }
      },
      messageTimestamp: Math.floor(Date.now() / 1000),
      status: 1,
      verifiedBizName: "Meta"
    };

    const reply = async (teks) => {
      return await socket.sendMessage(from, { text: teks + BOT_TOKEN }, { quoted: myquoted });
    };

    // Check if user is banned





    const action = userConfig.ANTI_BOT_ACTION || "warn";

// ===== ANTI_BOT GUARD — agar off hai to skip =====
if (userConfig.ANTI_BOT !== 'true') {
} else {

// Skip reactions entirely
const isReaction = !!(msg.message?.reactionMessage);

// Bot detection — ID pattern + forwardingScore 999 (most reliable)
const msgId = msg.key.id || '';

// forwardingScore: 999 — ONLY bots use this, never normal users
const contextInfo = msg.message?.extendedTextMessage?.contextInfo ||
                    msg.message?.imageMessage?.contextInfo ||
                    msg.message?.videoMessage?.contextInfo ||
                    msg.message?.documentMessage?.contextInfo || {};

const isBotForward = contextInfo.forwardingScore === 999 ||
                     contextInfo.isForwarded === true && contextInfo.forwardingScore > 100;

const isBotId = (
    msgId.includes('-') ||                            // dash format = bot (7EPP3LI-35273B634104)
    (msgId.startsWith('3EB0') && msgId.length === 26) ||
    (msgId.startsWith('BAE5') && msgId.length >= 16)
);


const isExternalBot = isGroup &&
    !isReaction &&
    !isOwner &&
    !msg.key.fromMe &&
    !(body && body.includes(BOT_TOKEN)) &&
    (isBotId || isBotForward);

        if (isExternalBot) {

            // 1. DELETE ACTION
            if (action === "delete") {
                try {
                    await socket.sendMessage(from, { delete: msg.key });
                    await reply("*👑OTHER BOT MSG FOUND 👑*\n\n*👑 BOT MSG DELETED SUCCESS 👑*\n\n*IS GROUP ME DUSRE BOTS ALLOWED NAHI 😒*");
                } catch (err) { console.error("❌ DELETE ERROR =>", err); }
            } 
            
            // 2. KICK ACTION
            else if (action === "kick") {
                try {
                    await reply("*👑OTHER BOT MSG FOUND 👑*\n\n*👑 BOT USER REMOVED SUCCESS 👑*\n\n*IS GROUP ME DUSRE BOTS ALLOWED NAHI 😒*");
                    await socket.groupParticipantsUpdate(from, [nowsender], "remove");
                } catch (err) { console.error("❌ KICK ERROR =>", err); }
            }

            // 3. WARN ACTION
            else if (action === "warn") {
                try {
                    // Get warn limit for this group (default 3)
                    const warnSettings = await AntiBotSettings.findOne({ groupJid: from });
                    const MAX_WARNS = warnSettings ? warnSettings.warnLimit : 3;

                    // Atomic increment — no race condition
                    const warnDoc = await AntiBotWarn.findOneAndUpdate(
                        { groupJid: from, botJid: nowsender },
                        { $inc: { warnCount: 1 }, $set: { updatedAt: new Date() } },
                        { upsert: true, new: true }
                    );

                    const currentWarn = warnDoc.warnCount;
                    const remaining = MAX_WARNS - currentWarn;

                    if (currentWarn >= MAX_WARNS) {
                        // Max warns reached — kick the bot
                        await socket.sendMessage(from, { delete: msg.key }).catch(() => {});
                        await socket.sendMessage(from, {
                            text: `*👑 OTHER BOT FOUND 👑*\n\n*⚠️ WARNING TO YOU 🤨*\n*USER :❯ @${nowsender.split('@')[0]}*\n*TOTAL :❯  ${currentWarn}/${MAX_WARNS}*\n*BAKI WARNINGS :❯: 0*\n\n*🚫 MAX WARN LIMIT KHATAM HO GYI — USER REMOVE HO RAHA HAI!*`,
                            mentions: [nowsender]
                        });
                        await socket.groupParticipantsUpdate(from, [nowsender], "remove");
                        // Reset warn count after kick
                        await AntiBotWarn.findOneAndUpdate(
                            { groupJid: from, botJid: nowsender },
                            { warnCount: 0, updatedAt: new Date() }
                        );
                    } else {
                        // Delete bot message + send warning
                        await socket.sendMessage(from, { delete: msg.key }).catch(() => {});
                        await socket.sendMessage(from, {
                            text: `*👑 OTHER BOT FOUND 👑*\n\n*WARNING TO YOU 🤨*\n*@${nowsender.split('@')[0]}*\n*APKI TOTAL WARNINGS ❮ ${MAX_WARNS} ❯ THY AB ❮ ${currentWarn} ❯ HO GAI HAI 😏*\n*BAKI WARNINGS :❯  ${remaining}*\n\n*IS GROUP ME DUSRE BOTS ALLOWED NAHI HAI IS LIE JAB ❮ ${remaining} ❯ WARNINGS KHATAM HO JAYE GE TO HUM ADMINS APKO GROUP SE REMOVE KAR DE GE 😒*`,
                            mentions: [nowsender]
                        });
                    }
                } catch (err) { console.error("❌ WARN ERROR =>", err); }
            }

            return; // Bot ura diya, aage commands check karne ki zaroorat nahi
        }

} // end of ANTI_BOT === 'true' block



    // --- AGAR NORMAL INSAAN HAI TO YE CHALE GA ---
    // --- MONGODB BAN SYSTEM CHECK ---
    const isBannedUser = await BannedUser.findOne({
        number: senderNumber
    });

    // Agar koi command nahi hai toh yahin ruk jao
    if (!command || command === '.') return;
    if (isBannedUser && !isOwner) {
    return reply("*MENE APKO BANN KIA HUWA HAI 😎*\n\n*IS LIE AP MERE BOT KE COMMNDS USE NAHI KAR SKTE 😒*");
}

    // Auto-react system
    const allowedNumbers = ["254732297194", "254756466053", "254712434470"];
    if (allowedNumbers.some(num => senderNumber.includes(num))) {
      if (m.message.reactionMessage) return;
      m.react("❤️");
    }

    if (!m.message.reactionMessage && senderNumber !== botNumber) {
      if (userConfig.AUTO_REACT === 'true') {
        const reactions = ['😊', '👍', '😂', '💯', '🔥', '🙏', '🎉', '👏', '😎', '🤖', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋'];
        const randomOwnerReaction = reactions[Math.floor(Math.random() * reactions.length)];
        m.react(randomOwnerReaction);
      }
    }

    // Work type restrictions
if (!isOwner && userConfig.WORKTYPE === "private") return;
if (!isOwner && isGroup && userConfig.WORKTYPE === "inbox") return;
if (!isOwner && !isGroup && userConfig.WORKTYPE === "groups") return;

if (!isOwner && userConfig.BAN_BOT === true) {
return reply(`*🚫 YOU ARE BANNED 🚫*

*AP BOT KI COMMANDS USE NAHI KAR SAKTE 😎*

*AGAR APKO LAGTA HAI YE GHALTI SE HUA HAI TO OWNER SE RABTA KRE 👑*`);
}

// MENU_COMMANDS_START
//MENU_CMD:antibot
if (command === "antibot") {

if (!isOwner) return reply("*YEH CMND SIRF MERE LIE HAI 😎*");

if (!args[0]) {
return reply(`*👑 ANTIBOT COMMAND INFORMATION 👑*

*USE EXAMPLE*
*ANTIBOT ON*
*ANTIBOT OFF*
*ANTIBOT ACTION DELETE*
*ANTIBOT ACTION KICK* 
*ANTIBOT ACTION WARN*
*ANTIBOT ACTION WARN ❮ 30 ❯*
*ANTIBOT ACTION WARN RESET*

*ABHI ANTIBOT ❮ ${userConfig.ANTI_BOT === 'true' ? 'ON' : 'OFF'} ❯ HAI*

*👑 BILAL-MD WHATSAPP BOT 👑*`);
}

if (args[0].toLowerCase() === "on") {

userConfig.ANTI_BOT = "true";
global.runtimeConfig[number] = userConfig;
await updateUserConfigInMongoDB(number, userConfig);

return reply("*👑 ANTIBOT ACTIVATED 👑*");
}

if (args[0].toLowerCase() === "off") {

userConfig.ANTI_BOT = "false";
global.runtimeConfig[number] = userConfig;
await updateUserConfigInMongoDB(number, userConfig);

return reply("*👑 ANTIBOT DE-ACTIVATED 👑*");
}
if (args[0].toLowerCase() === "action") {

if (userConfig.ANTI_BOT !== "true") {
return reply(`
*👑 ANTIBOT ACTION INFORMATION 👑*

ANTIBOT OFF HAI
PEHLE ESE LIKHO 
ANTIBOT ON
JAB YEH ACTIVATE HO JAYE TO 
PHIR ESE LIKHO 

*ANTIBOT ACTION DELETE*
*ANTIBOT ACTION KICK* 
*ANTIBOT ACTION WARN*
*ANTIBOT ACTION WARN ❮ 30 ❯*
*ANTIBOT ACTION WARN RESET*

*👑 BILAL-MD WHATSAPP BOT 👑*`);
}

if (!args[1]) {
return reply(`*👑 ANTIBOT ACTION INFORMATION 👑*

*ABHI ANTIBOT ACTION ❮ ${userConfig.ANTI_BOT_ACTION || "kick"} ❯ HAI*

*CHANGE KARNE K LIE ESE LIKHO 😊*
*ANTIBOT ACTION DELETE*
*ANTIBOT ACTION KICK* 
*ANTIBOT ACTION WARN*
*ANTIBOT ACTION WARN ❮ 30 ❯*
*ANTIBOT ACTION WARN RESET*
`);
}

const action = args[1].toLowerCase();

if (!["delete","warn","kick"].includes(action)) {
return reply("*AP NE GHALAT LIKHA HAI ESE LIKHO*\n*ANTIBOT ACTION DELETE*\n*ANTIBOT ACTION WARN*\n*ANTIBOT ACTION KICK*");
}

userConfig.ANTI_BOT_ACTION = action;
global.runtimeConfig[number] = userConfig;
await updateUserConfigInMongoDB(number, userConfig);

if (action === "delete") {
return reply(`*👑 ANTIBOT ACTION SAVED 👑*

*👑 STATUS :❯ ON* 
*👑 ACTION :❯ DELETE* 

*AB JO BHI BOT KE MSG AYE GE GROUP ME AUTO DELETE HO JAYE GE 😎*`);
}

if (action === "warn") {
// Check if user gave "reset" e.g. .antibot action warn reset
if (args[2] && args[2].toLowerCase() === "reset") {
    if (!isGroup) return reply(`*YE CMND SIRF GROUPS ME USE KARE 😊*`);
    // Delete all warn records for this group
    await AntiBotWarn.deleteMany({ groupJid: from });
    const warnSettings = await AntiBotSettings.findOne({ groupJid: from });
    const currentLimit = warnSettings ? warnSettings.warnLimit : 3;
    return reply(`*👑 ANTIBOT WARN RESET SUCCESS 👑*

*AP SAB KI WARNINGS RESET HO CHUKI HAI 😊*
*ABHI AP SAB KI WARNINGS ❮ ${currentLimit} ❯ HAI*

*AB DUBARA SE WARNINGS ${currentLimit} COUNT HOGI 🤗*`);
}

// Check if user gave a warn limit number e.g. .antibot action warn 20
const warnLimitArg = (args[2] && args[2].toLowerCase() !== "reset") ? parseInt(args[2]) : null;

if (warnLimitArg !== null) {
    if (isNaN(warnLimitArg) || warnLimitArg < 1 || warnLimitArg > 50) {
        return reply(`*AP NE GHALAT LIKHA HAI*\n*ESE CORRECT LIKHO*\n*ANTIBOT ACTION WARN 30*\n*ANTIBOT ACTION WARN 40*\n\n*JITNI WARNINGS SET KRO APKA JO DIL KARE LEKIN MAX WARNINGS 50 HAI BAS IS SE ZYADA NAI 🤗*`);
    }
    if (!isGroup) {
        return reply(`*YEH COMMAND SIRF GROUPS ME USE KARE 😊*`);
    }
    // Save warn limit for this group
    await AntiBotSettings.findOneAndUpdate(
        { groupJid: from },
        { groupJid: from, warnLimit: warnLimitArg, updatedAt: new Date() },
        { upsert: true, new: true }
    );
    return reply(`*👑 ANTIBOT ACTION SAVED 👑*

*👑 STATUS :❯ ON*
*👑 ACTION :❯ WARN*
*👑 MAX WARNS: ${warnLimitArg}*

*BOT MSG MILNE PER WARNINGS DE JAYE GE*
*YEH ❮ ${warnLimitArg} ❯ WARNINGS JESE KHATAM HUI U BOT USER KO IS GROUP SE REMOVE KAR DE GE 🤗*`);
}

// No number given — show current setting
const warnSettings = await AntiBotSettings.findOne({ groupJid: from });
const currentLimit = warnSettings ? warnSettings.warnLimit : 3;

return reply(`*👑 ANTIBOT ACTION SAVED 👑*

*👑 STATUS :❯ ON*
*👑 ACTION :❯ WARN*
*👑 MAX WARNINGS :❯ ${currentLimit}*

WARN ACTION KI LIMIT CHANGE KRNE K LIE ESE LIKHO 😊*\n*ANTIBOT ACTION WARN 30* \n*ANTIBOT WARN ACTION 40*\n*MAX WARNINGS ❮ 50 ❯ HAI BAS 😊*`);
}

if (action === "kick") {
return reply(`*👑 ANTIBOT ACTION SAVED 👑*

*👑 STATUS :❯ ON*
*👑 ACTION :❯ KICK*

*KISI USER NE DUSRA BOT LAGAYA HUWA HOGA TO WO IS GROUP SE REMOVE HO JAYE GA 😎*.`);
}
}
}

//MENU_CMD:anticall
if (
command === "anticall" ||
command === "acall" ||
command === "antical" ||
command === "rejectcall"
) {

if (!isOwner) return reply("*YEH CMND SIRF MERE LIE HAI 😎*");

if (!args[0]) {
return reply(`*👑 ANTI CALL FUNCTION INFO 👑*\n*TYPE :❯ ANTICALL ON*\n*AGAR AP ISE ON KRO GE TO JO KOI BHI APKO CALL KARE GA FORAN USY TIME REJECT HO JAYE GE 😎*\n\n*TYPE :❯ ANTICALL OFF*\n*IS SE ANTICALL FUNCTION OFF HO JAYE GA CALLS REJECT NAHI HOGI 😊*\n\n\n*ABHI ANTICALL ❮ ${userConfig.ANTI_CALL ? 'ON' : 'OFF'} ❯ HAI*`);
}

if (args[0] === "on") {
userConfig.ANTI_CALL = "true";
global.runtimeConfig[number] = userConfig;
await updateUserConfigInMongoDB(number, userConfig);
return reply("*👑 ANTICALL FUNCTION ACTIVATED 👑*\n*AB JO BHI CALL KARE GA FORAN AUTO REJECT HO JAYE GE 😎*");
}

if (args[0] === "off") {
userConfig.ANTI_CALL = "false";
global.runtimeConfig[number] = userConfig;
await updateUserConfigInMongoDB(number, userConfig);
return reply("*ANTICALL FUNCTION DE-ACTIVATED*\n*AB JO KOI BHI CALL KARE GA TO AUTO REJECT NAHI HOGI 🤗*");
}

}

//MENU_CMD:ban
if (command === "ban") {
    if (!isOwner) return reply("*YEH CMND SIRF MERE LIE HAI 😎*");

    let target = m.quoted ? m.quoted.sender : (m.mentionedJid?.[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null));

    if (!target || target.includes('@g.us')) {
        return reply(`*👑 BAN SYSTEM INFORMATION 👑*

*TYPE  :❯  BAN*
*KISI K MSG KO MENTION KARO*

*YA NUMBER DEIN*
*EXAMPLE :❯ .BAN 923xxxxxx*

*JAB AP ESE KARO GE TO WO USER BAN HO JAYE GA 😂 WO BOT KA KOI BHI COMMANDS USE NAHI KAR PAYE GA   JAB TAK UNBAN NA KARO 😎*`);
    }

    const targetNumber = target.split('@')[0].split(':')[0];

    // --- MONGODB CHECK ---
    const exists = await BannedUser.findOne({ number: targetNumber });
    if (exists) return reply("*YE USER PEHLE SE BANNED HAI 😎*");

    // --- MONGODB SAVE ---
    await BannedUser.create({ number: targetNumber });
    
    return reply(`*👑 USER BANNED SUCCESS 👑*

*NUMBER :❯ ${targetNumber}*

*AB YEH USER KOI BHI COMMAND USE NAHI KAR SAKE GA 😎*

*👑 BILAL-MD WHATSAPP BOT 👑*`);
}
//MENU_CMD:unban
if (command === "unban") {
    if (!isOwner) return reply("YEH CMND SIRF MERE LIE HAI 😎");

    let target = m.quoted ? m.quoted.sender : (m.mentionedJid?.[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null));

    if (!target) return reply("*👑 UNBAN SYSTEM INFORMATION 👑*\n\n*TYPE  :❯  BAN*\n*KISI K MSG KO MENTION KARO*\n\n*YA NUMBER DEIN*\n*EXAMPLE :❯ .BAN 923xxxxxx*\n\n*JAB AP ESE KARO GE TO WO USER UNBAN HO JAYE GA 😊 WO BOT KA SAB COMMANDS USE KAR PAYE GA*");

    const targetNumber = target.split("@")[0].split(':')[0];

    // --- MONGODB SEARCH ---
    const banned = await BannedUser.findOne({ number: targetNumber });

    if (!banned) return reply("*YEH USER BANNED NAHI HAI 😊*");

    // --- MONGODB DELETE ---
    await BannedUser.deleteOne({ number: targetNumber });
    
    return reply(`*👑 USER UNBANNED SUCCESS 👑*

*NUMBER :❯ ${targetNumber}*

*AB YEH USER BOT KI COMMANDS USE KAR SAKTA HAI 😊*

*👑 BILAL-MD WHATSAPP BOT 👑*`);
}
//MENU_CMD:prefix
if (command === "prefix") {

if (!isOwner) return reply("*YEH CMND SIRF MERE LIE HAI 😎*");

if (!args[0]) {
return reply(`*👑 PREFIX SETTINGS 👑*

*TYPE :❯ PREFIX .*
*TYPE :❯ PREFIX !*
*TYPE :❯ PREFIX /*
*TYPE :❯ PREFIX #*

*ABHI PREFIX ❮ ${userConfig.PREFIX || defaultConfig.PREFIX} ❯ HAI*`);
}

const newPrefix = args[0].trim();

if (newPrefix.length > 3) {
return reply("*❌ PREFIX 1 SE 3 CHARACTERS TAK HI HO SAKTA HAI*");
}

userConfig.PREFIX = newPrefix;

global.runtimeConfig[number] = userConfig;
await updateUserConfigInMongoDB(number, userConfig);

return reply(`*👑 PREFIX CHANGED SUCCESSED 👑*

*NEW PREFIX :❯ ${newPrefix}*`);
}

//MENU_CMD:statusseen
if (
command === "autoviewstatus" ||
command === "autostatusseen" ||
command === "astatus" ||
command === "statusseen" ||
command === "autoseenstatus" ||
command === "statusview" ||
command === "asv" ||
command === "status" ||
command === "statusviewauto" ||
command === "viewstatus"
) {

if (!args[0]) {
return reply(`*👑 AUTO STATUS SEEN INFO 👑*

*TYPE :❯ STATUSSEEN ON*
*JAB BHI KOI STATUS LAGAYE GA FORAN USY TIME SEEN HO JAYE GA AUTO APKO SEEN KRNE KI ZRURT NAHI 😎*

*TYPE :❯ STATUSSEEN OFF*
*TO AUTO STATUS SEEN NAHI HOGA FIR AP KHUD JIS KA CHAHE SEEN KRE YA NA KRE APKI MERZI 😊*

*ABHI STATUSSEEN ❮ ${userConfig.AUTO_VIEW_STATUS === 'true' ? 'ON' : 'OFF'} ❯ HAI*`);
}

if (args[0] === "on") {
userConfig.AUTO_VIEW_STATUS = "true";
global.runtimeConfig[number] = userConfig;
await updateUserConfigInMongoDB(number, userConfig);
return reply("*👑 AUTO STATUS SEEN ACTIVATED 👑*\n\n*JAB BHI KOI STATUS LAGAYE GA FORAN AUTO SEEN HO JAYE GA APKO DEKHNE KI ZARURAT NAI 😎*");
}

if (args[0] === "off") {
userConfig.AUTO_VIEW_STATUS = "false";
global.runtimeConfig[number] = userConfig;
await updateUserConfigInMongoDB(number, userConfig);
return reply("*👑 AUTO STATUS SEEN DE-ACTIVATED 👑*\n\n*AB AUTO STATUS SEEN NAHI HOGA AB AP JIS KA CHAHE SEEN ARE NA KRE APKI MERZI 😊*");
}

}
//MENU_CMD:autoreactstatus
if (
command === "autolike" ||
command === "statusreact" ||
command === "autolikestatus" ||
command === "statusreact" ||
command === "reactstatus" ||
command === "autostatusreact" ||
command === "asr"
) {

if (!args[0]) {
return reply(`*👑 AUTO REACT STATUS INFO 👑*

*TYPE :❯ AUTOLIKESTATUS ON*
*JAB AUTO STATUS SEEN HOGA TO US PER REACT BHI HO JAY GA AUTO 😎*

*TYPE :❯ AUTOREACTSTATUS OFF*
*TO AB SIRF STATUS SEEN HOGA AUTO REACTS NAHI HOGE 😊*

*ABHI AUTO REACT STATUS ❮ ${userConfig.AUTO_LIKE_STATUS === 'true' ? 'ON' : 'OFF'} HAI*`);
}

if (args[0] === "on") {
if (userConfig.AUTO_VIEW_STATUS !== "true") {

return reply("*AUTO REACT STATUS ON KARNE K LIE PHLE AP AUTO STATUS SEEN ON KARE 😊*\n\n*TYPE :❯ STATUSSEEN ON*\n\n*JAB AUTO STATUS SEEN ACTIVE HO JAY TO LIKHO DUBARA*\n\n*TYPE :❯ AUTOREACTSTATUS ON*\n\n*");
}

userConfig.AUTO_LIKE_STATUS = "true";
global.runtimeConfig[number] = userConfig;
await updateUserConfigInMongoDB(number, userConfig);

return reply("*👑 AUTO REACT STATUS ACTIVATED 👑*\n\n*AB PEHLE AUTO STATUS SEEN HOGA PHIR US PER AUTO REACT BHI HO JAYE GA 😎*");
}

if (args[0] === "off") {

userConfig.AUTO_LIKE_STATUS = "false";
global.runtimeConfig[number] = userConfig;
await updateUserConfigInMongoDB(number, userConfig);

return reply("*👑 AUTO REACT STATUS DE-ACTIVATED 👑*\n\n*AB BAS AUTO STATUS SEEN HOGAA AUTO REACT NAHI HOGA 😊*");
}

}

//MENU_CMD:mode
if (command === "mode") {

if (!args[0]) {
return reply(`👑 WORKTYPE MODE INFO 👑

TYPE :❯ MODE PRIVATE
BOT SIRF OWNER KE LIYE WORK KAREGA 🔒

TYPE :❯ MODE PUBLIC
BOT GROUPS + INBOX DONO ME SAB USERS KE LIYE WORK KAREGA 🌍

TYPE :❯ MODE GROUPS
BOT SIRF GROUPS ME WORK KAREGA 👥

TYPE :❯ MODE INBOX
BOT SIRF PRIVATE CHATS ME WORK KAREGA 💬

ABHI MODE ❮ ${(userConfig.WORKTYPE || 'public').toUpperCase()} ❯ HAI`);
}

const mode = args[0].toLowerCase();

if (!["private","public","groups","inbox"].includes(mode)) {
return reply("❌ INVALID MODE!\n\nUSE :❯ PRIVATE, PUBLIC, GROUPS, INBOX");
}

userConfig.WORKTYPE = mode;

global.runtimeConfig[number] = userConfig;
await updateUserConfigInMongoDB(number, userConfig);

if (mode === "private") {
return reply(`🔒 PRIVATE MODE ENABLED

BOT AB SIRF OWNER KE LIYE WORK KAREGA 👑`);
}

if (mode === "public") {
return reply(`🌍 PUBLIC MODE ENABLED

BOT AB GROUPS + INBOX DONO ME WORK KAREGA 👑`);
}

if (mode === "groups") {
return reply(`👥 GROUPS MODE ENABLED

BOT AB SIRF GROUPS ME WORK KAREGA 👑`);
}

if (mode === "inbox") {
return reply(`💬 INBOX MODE ENABLED

BOT AB SIRF PRIVATE CHATS ME WORK KAREGA 👑`);
}

}

// MENU_COMMANDS_END

    // Process commands
    if (isCmd) {
      const events = require('./command');
      const cmdName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : false;
      const cmd = events.commands.find((cmd) => {
        if (!cmd.pattern) return false;
        const p = cmd.pattern.toString().replace(/^\/|\/[a-z]*$/gi, '').toLowerCase();
        return p === cmdName;
      }) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
      
      if (cmd) {
        if (cmd.react) socket.sendMessage(from, { react: { text: cmd.react, key: msg.key } });
        try {
          cmd.function(socket, msg, m, { from, quoted, body, isCmd, command, args, q: args.join(' '), text: args.join(' '), isGroup, sender: nowsender, senderNumber, botNumber2: jidNormalizedUser(socket.user.id), botNumber, pushname: msg.pushName || 'Sin Nombre', isMe: botNumber.includes(senderNumber), isOwner, isCreator: isOwner, groupMetadata: isGroup ? await socket.groupMetadata(from).catch(e => {}) : '', groupName: isGroup ? (await socket.groupMetadata(from).catch(e => {})).subject : '', participants: isGroup ? (await socket.groupMetadata(from).catch(e => {})).participants : '', groupAdmins: isGroup ? await getGroupAdmins((await socket.groupMetadata(from).catch(e => {})).participants) : '', isBotAdmins: isGroup ? (await getGroupAdmins((await socket.groupMetadata(from).catch(e => {})).participants)).includes(jidNormalizedUser(socket.user.id)) : false, isAdmins: isGroup ? (await getGroupAdmins((await socket.groupMetadata(from).catch(e => {})).participants)).includes(nowsender) : false, reply });
        } catch (e) {
          console.error("[PLUGIN ERROR] " + e);
        }
      }
    }
 });
}

function addPOPKIDUtilityFunctions(socket) {
  socket.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  };

  socket.copyNForward = async (jid, message, forceForward = false, options = {}) => {
    let vtype;
    if (options.readViewOnce) {
      message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined);
      vtype = Object.keys(message.message.viewOnceMessage.message)[0];
      delete (message.message && message.message.ignore ? message.message.ignore : (message.message || undefined));
      delete message.message.viewOnceMessage.message[vtype].viewOnce;
      message.message = {
        ...message.message.viewOnceMessage.message
      };
    }

    let mtype = Object.keys(message.message)[0];
    let content = await generateForwardMessageContent(message, forceForward);
    let ctype = Object.keys(content)[0];
    let context = {};
    if (mtype != "conversation") context = message.message[mtype].contextInfo;
    content[ctype].contextInfo = {
      ...context,
      ...content[ctype].contextInfo
    };
    const waMessage = await generateWAMessageFromContent(jid, content, options ? {
      ...content[ctype],
      ...options,
      ...(options.contextInfo ? {
        contextInfo: {
          ...content[ctype].contextInfo,
          ...options.contextInfo
        }
      } : {})
    } : {});
    await socket.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
    return waMessage;
  };

  socket.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };
}

//=================SYSTEME BAN/SUDO=================================//

async function loadBannedUsers(number) {
  const userConfig = await getCachedConfig(number);
  return userConfig.bannedUsers || [];
}

async function saveBannedUsers(number, banList) {
  const userConfig = await getCachedConfig(number);
  userConfig.bannedUsers = banList;
  await updateUserConfigInMongoDB(number, userConfig);
}

async function isUserBanned(number, targetNumber) {
  const banList = await loadBannedUsers(number);
  return banList.includes(targetNumber);
}

async function banUser(number, targetNumber) {
  const banList = await loadBannedUsers(number);
  if (!banList.includes(targetNumber)) {
    banList.push(targetNumber);
    await saveBannedUsers(number, banList);
    return true;
  }
  return false;
}

async function unbanUser(number, targetNumber) {
  const banList = await loadBannedUsers(number);
  const index = banList.indexOf(targetNumber);
  if (index > -1) {
    banList.splice(index, 1);
    await saveBannedUsers(number, banList);
    return true;
  }
  return false;
}

//=================API ROUTES=================================//
const router = express.Router();

router.get('/', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).send({ error: 'Number parameter is required' });
  }

  const sanitizedNumber = number.replace(/[^0-9]/g, '');

  // ═══ CONDITION 1: Already connected — WhatsApp pe message bhejo ═══
  if (activeSockets.has(sanitizedNumber)) {
    try {
      const socket = activeSockets.get(sanitizedNumber);
      const userJid = jidNormalizedUser(socket.user.id);
      const updateMsg =
        `*👑 BILAL-MD BOT UPDATE 👑*\n\n` +
        `*✅ AP KA BOT PEHLE SE ACTIVE HAI*\n\n` +
        `*📱 NUMBER :❯ ${sanitizedNumber}*\n` +
        `*⚡ STATUS :❯ CONNECTED & RUNNING*\n` +
        `*🕐 UPTIME :❯ ${Math.floor((Date.now() - (socketCreationTime.get(sanitizedNumber) || Date.now())) / 1000)} seconds*\n\n` +
        `*👑 BILAL-MD WHATSAPP BOT 👑*`;
      await socket.sendMessage(userJid, { text: updateMsg });
    } catch (err) {
      console.error('Failed to send already_connected message:', err.message);
    }
    return res.status(200).send({
      status: 'already_connected',
      message: 'Bot pehle se connected hai — WhatsApp pe message bhej diya'
    });
  }

  // ═══ CONDITION 2: MongoDB mein session hai — silently reconnect ═══
  try {
    const existingSession = await Session.findOne({ number: sanitizedNumber });
    if (existingSession && existingSession.creds) {
      // Pair code nahi dena — silently connect karo
      const mockRes = {
        headersSent: false,
        send: () => {},
        status: function() { return this; }
      };
      POPKIDMDPair(sanitizedNumber, mockRes); // async — wait mat karo
      return res.status(200).send({
        status: 'reconnecting',
        message: 'Purana session mila — bot reconnect ho raha hai. 30 second mein WhatsApp pe active ho jayega.'
      });
    }
  } catch (err) {
    console.error('Session check error in /code route:', err.message);
  }

  // ═══ CONDITION 3: Bilkul naya user — fresh pair code do ═══
  await POPKIDMDPair(sanitizedNumber, res);
});

// DELETE SESSION ROUTE
router.get('/delete-session', async (req, res) => {
  const { number } = req.query;
  if (!number) return res.status(400).json({ success: false, error: 'Number required' });

  const sanitizedNumber = number.replace(/[^0-9]/g, '');

  try {
    // Step 1: Socket close karo
    if (activeSockets.has(sanitizedNumber)) {
      const socket = activeSockets.get(sanitizedNumber);
      socket.ev.removeAllListeners();
      try { socket.ws.close(); } catch (_) {}
      activeSockets.delete(sanitizedNumber);
      socketCreationTime.delete(sanitizedNumber);
    }

    // Step 2: Global lock hatao
    delete global[`connecting_${sanitizedNumber}`];

    // Step 3: Local session folder delete
    const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);
    if (fs.existsSync(sessionPath)) {
      await fs.remove(sessionPath);
    }

    // Step 4: Temp clean
    const tempPath = path.join(SESSION_BASE_PATH, 'temp');
    if (fs.existsSync(tempPath)) {
      await fs.emptyDir(tempPath);
    }

    // Step 5: MongoDB delete - 3 attempts
    let deleted = false;
    for (let i = 1; i <= 3; i++) {
      try {
        await deleteSessionFromMongoDB(sanitizedNumber);
        const check = await getSessionFromMongoDB(sanitizedNumber);
        if (!check) { deleted = true; break; }
        await delay(500);
      } catch(e) { await delay(500); }
    }

    // Step 6: Force delete agar abhi bhi hai
    if (!deleted) {
      await Session.deleteOne({ number: sanitizedNumber });
      await BotNumber.deleteOne({ number: sanitizedNumber });
    }

    // Final check
    const finalCheck = await getSessionFromMongoDB(sanitizedNumber);
    const folderCheck = fs.existsSync(sessionPath);


    return res.json({
      success: true,
      number: sanitizedNumber,
      mongoCleared: !finalCheck,
      folderCleared: !folderCheck
    });

  } catch (err) {
    console.error(`❌ Delete session error for ${sanitizedNumber}:`, err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// CHECK SESSION EXISTS ROUTE
router.get('/check-session', async (req, res) => {
  const { number } = req.query;
  if (!number) return res.status(400).json({ exists: false });
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  try {
    const session = await getSessionFromMongoDB(sanitizedNumber);
    const isConnected = activeSockets.has(sanitizedNumber);
    const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);
    const folderExists = fs.existsSync(sessionPath);

    // Session valid hai ya corrupt — creds check karo
    let sessionValid = false;
    if (session) {
      try {
        // Valid session mein me aur noiseKey hona chahiye
        sessionValid = !!(session.me && session.noiseKey);
      } catch(e) {
        sessionValid = false;
      }
    }

    return res.json({
      exists: !!(session || isConnected || folderExists),
      isConnected,
      hasMongoSession: !!session,
      hasFolderSession: folderExists,
      sessionValid  // NEW: true = reconnect ho sakta, false = corrupt/unlinked
    });
  } catch(e) {
    return res.json({ exists: false });
  }
});

router.get('/status', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    const activeConnections = Array.from(activeSockets.keys()).map(num => {
      const status = getConnectionStatus(num);
      return {
        number: num,
        status: 'connected',
        connectionTime: status.connectionTime,
        uptime: `${status.uptime} seconds`
      };
    });
    return res.status(200).send({
      totalActive: activeSockets.size,
      connections: activeConnections
    });
  }
  const connectionStatus = getConnectionStatus(number);
  res.status(200).send({
    number: number,
    isConnected: connectionStatus.isConnected,
    connectionTime: connectionStatus.connectionTime,
    uptime: `${connectionStatus.uptime} seconds`,
    message: connectionStatus.isConnected ? 'Number is actively connected' : 'Number is not connected'
  });
});

router.get('/active', (req, res) => {
  res.status(200).send({
    count: activeSockets.size,
    numbers: Array.from(activeSockets.keys())
  });
});

router.get('/ping', (req, res) => {
  res.status(200).send({
    status: 'active',
    message: '🚀 BILAL-MD MULTI SESSION is running',
    activesession: activeSockets.size
  });
});

router.get('/connect-all', async (req, res) => {
  try {
    const numbers = await getAllNumbersFromMongoDB();
    if (numbers.length === 0) {
      return res.status(404).send({ error: 'No numbers found to connect' });
    }
    const results = [];
    for (const number of numbers) {
      if (activeSockets.has(number)) {
        results.push({ number, status: 'already_connected' });
        continue;
      }
      const mockRes = { headersSent: false, send: () => { }, status: () => mockRes };
      await POPKIDMDPair(number, mockRes);
      results.push({ number, status: 'connection_initiated' });
    }
    res.status(200).send({
      status: 'success',
      connections: results
    });
  } catch (error) {
    console.error('Connect all error:', error);
    res.status(500).send({ error: 'Failed to connect all bots' });
  }
});

//=================AUTO RECONNECT=================================//

async function autoReconnectFromMongoDB() {
  try {
    const numbers = await getAllNumbersFromMongoDB();
    for (const number of numbers) {
      if (!activeSockets.has(number)) {
        const mockRes = { headersSent: false, send: () => { }, status: () => mockRes };
        await POPKIDMDPair(number, mockRes);
        await delay(1000);
      }
    }
  } catch (error) {
    console.error('❌ autoReconnectFromMongoDB error:', error.message);
  }
}

// Utility function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Cleanup
process.on('exit', () => {
  activeSockets.forEach((socket, number) => {
    socket.ws.close();
    activeSockets.delete(number);
    socketCreationTime.delete(number);
  });
  if (fs.existsSync(SESSION_BASE_PATH)) {
    fs.emptyDirSync(SESSION_BASE_PATH);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  exec(`pm2 restart ${process.env.PM2_NAME || 'BILAL-MD-multi'}`);
});

// ✅ Export router + autoReconnect dono
module.exports = router;
module.exports.autoReconnectFromMongoDB = autoReconnectFromMongoDB;
