let builder = require('botbuilder');
let yw = require('weather-yahoo');
// Create bot and bind to console
// Create chat bot
let connector = new builder.ConsoleConnector().listen();
//bot instance
let bot = new builder.UniversalBot(connector);

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
let model = 'PUT YOUR OWN LUIS URL';
//format for model URL https://api.projectoxford.ai/luis/v1/application?id=<ID>&subscription-key=<Subscription Key>&q=
let recognizer = new builder.LuisRecognizer(model);
//dialog is a LUIS dialog
let dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

//=========================================================
// LUIS
//=========================================================
//Dialog to start with
dialog.onBegin(
    function (session, args, next) {
        session.beginDialog('/ensureProfile', session.userData.profile);
    }
);
//Dialog to match intents
dialog.matches('weather_today', [
    //Lets fill it up!
]);
//Dialog that runs when no intent is matched
dialog.onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."));

//=========================================================
// Bots Dialogs
//=========================================================
//Profile Builder
bot.dialog('/ensureProfile', [
    function (session, args, next) {
        session.dialogData.profile = args || {};
        if (!session.dialogData.profile.name) {
            session.send('Welcome to WeatherBot!');
            builder.Prompts.text(session, "What's your name?");
        } else {
            next();
        }
    },
    function (session, results, next) {
        if (results.response) {
            session.dialogData.profile.name = results.response;
        }
        if (!session.dialogData.profile.town) {
            builder.Prompts.text(session, "What is your hometown?");
        } else {
            next();
        }
    },
    function (session, results) {
        if (results.response) {
            session.dialogData.profile.town = results.response;
        }
        session.userData.profile = session.dialogData.profile;
        session.send('Welcome to WeatherBot %(name)s!', session.userData.profile);
        session.endDialogWithResult(results);
    }
]);