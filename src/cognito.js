const crypto = require('crypto');


exports.preSignUp = async (event) => {
  const authData = event.request.userAttributes;
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

  const checkHash = authData.hash;
  delete authData.hash;

  const dataCheckArr = Object.keys(authData)
    .map(key => `${key}=${authData[key]}`)
    .sort();
  const dataCheckString = dataCheckArr.join("\n");

  const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (hash !== checkHash) {
    throw new Error('Data is NOT from Telegram');
  }

  if (Math.floor(Date.now() / 1000) - authData.auth_date > 86400) {
    throw new Error('Data is outdated');
  }

  event.response.autoConfirmUser = true; // auto confirm user
  event.response.autoVerifyEmail = true; // auto verify email

  event.request.userAttributes.telegramId = authData.id;

  return event;
};


exports.postConf = async (event) => {
    console.log('User successfully confirmed:', event);

    // Optional: Send a Telegram message to the user after sign-up
    const message = 'Welcome to our GamerTag!';
    const telegramApiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        await axios.post(telegramApiUrl, {
            chat_id: event.request.userAttributes['telegramId'],
            text: message
        });

        return event;
    } catch (error) {
        console.error('Error sending message to Telegram:', error);
        throw new Error('Failed to send Telegram message');
    }
};

