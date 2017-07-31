var request = require('request');

var wowFinder = function(context, cb){
  var API_KEY = context.secrets.API_KEY;
  var API_URL = 'https://us.api.battle.net/wow/character/';
  var IMAGE_URL = 'https://render-us.worldofwarcraft.com/character/';
  var LOCALE = 'en_US';
  var SERVER;
  var CHARACTER;
  var url;

  // I queried both the CLASSES and RACES data already from the battle.net api so as to not have 3 API requests.
  // Since it is unlikely these will change often, it makes more sense to store them than to waste
  // time and resources making additional api calls.
  context.storage.get(function(err, data){
    if(err){
      cb(null, 'wowFinder error. Could not access class and race data.');
      return;
    } else {
      CLASSES = data.classes;
      RACES = data.races;
    }
  });


  // As this is designed to be a Slack webhook, it is expecting the body.text parameters.
  if(context.body && context.body.text){
    var arr = context.body.text.split(' ');

    // wowFinder is expecting 3 parameters from the string
    //  [0] Whatever slack tag invoked the webhook
    //  [1] Server name
    //  [2] Character name
    if(arr.length === 3){
      SERVER = arr[1].toLowerCase();
      CHARACTER = arr[2].toLowerCase();
    } else {
      cb(null, { text: 'Format is: slackTag serverName characterName'});
      return;
    }
  }


  url = API_URL
    + SERVER
    + '/'
    + CHARACTER
    + '?locale='
    + LOCALE
    + '&apikey='
    + API_KEY;


  request.get(url, {}, function(err, res, body){
    var result = JSON.parse(body);

    if(result && result.hasOwnProperty('thumbnail')){
      // The api call returns a very small avatar picture, but profilemain is a much larger version
      var profileImage = result.thumbnail.replace('avatar', 'profilemain');
      var name = result.name;
      var level = result.level;
      var className = CLASSES[result.class];
      var race = RACES[result.race].race;
      var side = RACES[result.race].side;

      cb(null, { text: name
        + ', Level ' + level
        + ' ' + race
        + ' ' + className
        + ' (' + side + ')'
        + '\n' +  IMAGE_URL + profileImage });
    } else {
      cb(null, { text: 'No Character Found' });
    }


  });
};



module.exports = wowFinder;