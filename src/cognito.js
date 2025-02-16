const axios = require('axios');

exports.preSignUp = async (event) => {
    const telegramToken = event.request.userAttributes['telegramToken'];
    const telegramApiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`;

    try {
        const response = await axios.get(telegramApiUrl);
        const telegramUser = response.data.result;

        event.response.autoConfirmUser = true;
        event.response.autoVerifyEmail = true;

        event.request.userAttributes['telegramId'] = telegramUser.id.toString();

        return event;
    } catch (error) {
        console.error('Error authenticating with Telegram:', error);
        throw new Error('Failed to authenticate with Telegram');
    }
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

