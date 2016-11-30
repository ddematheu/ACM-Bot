let builder = require('botbuilder');
let yw = require('weather-yahoo');
// Create bot and bind to console
// Create chat bot
let connector = new builder.ConsoleConnector().listen();
let bot = new builder.UniversalBot(connector);

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
let model = 'https://api.projectoxford.ai/luis/v1/application?id=aa0a5f1e-92fa-45b0-bd39-a3fe28f0243e&subscription-key=65e55319652340d5ad04b2fe7267236d&q=';
let recognizer = new builder.LuisRecognizer(model);
let dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

//=========================================================
// LUIS
//=========================================================
dialog.onBegin(
    function (session, args, next) {
        session.beginDialog('/ensureProfile', session.userData.profile);
    }
);
dialog.matches('weather_today', [
    function (session, args, next) {
        if (!builder.EntityRecognizer.findEntity(args.entities, 'town')) {
            //no town given, assume hometown
            next({ response:  session.userData.profile.town });
        } else {
            let town = builder.EntityRecognizer.findEntity(args.entities, 'town');
            next({ response: town.entity});
        }
    },
    function (session, results) {
        yw.getSimpleWeather(results.response).then(function(res){
          session.send('Weather for (%f,%f)', res.location.lat,res.location.long);
          session.send(res.date);
          session.send(res.weather.temperature.value + ' ' + res.weather.temperature.units);
        });
    }
]);
dialog.matches('weather_condtion', [
    function (session, args, next) {
        if (!builder.EntityRecognizer.findEntity(args.entities, 'town')) {
            //no town given, assume hometown
            next({ response:  session.userData.profile.town });
        } else {
            let town = builder.EntityRecognizer.findEntity(args.entities, 'town');
            next({ response: town.entity});
        }
    },
    function (session, results) {
        yw.getSimpleWeather(results.response).then(function(res){
             session.send(results.response);
             session.send(res.date);
             session.send(res.weather.condition);
        });
    }
]);
dialog.matches('weather_tomorrow', [
    function (session, args, next) {
        if (!builder.EntityRecognizer.findEntity(args.entities, 'town')) {
            //no town given, assume hometown
            next({ response:  session.userData.profile.town });
        } else {
            let town = builder.EntityRecognizer.findEntity(args.entities, 'town');
            next({ response: town.entity});
        }
    },
    function (session, results) {
        yw.getSimpleWeather(results.response).then(function(res){
             session.send(results.response);
             session.send(res.forecast[0].date);
             session.send('High: ' + res.forecast[0].high + 'F');
             session.send('Low: ' + res.forecast[0].low + 'F');
        });
    }
]);
dialog.matches('rain_today', [
    function (session, args, next) {
        if (!builder.EntityRecognizer.findEntity(args.entities, 'town')) {
            //no town given, assume hometown
            next({ response:  session.userData.profile.town });
        } else {
            let town = builder.EntityRecognizer.findEntity(args.entities, 'town');
            next({ response: town.entity});
        }
    },
    function (session, results) {
            yw.getSimpleWeather(results.response).then(function(res){
                
                if(res.weather.condition == 'Rain')
                {
                    session.send("It is raining today!")
                }
                else
                {
                    session.send("It is not raining!")
                }
        });
    }
]);
dialog.onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."));

//=========================================================
// Bots Dialogs
//=========================================================
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
