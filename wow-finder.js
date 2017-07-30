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
  var CLASSES = {
    1: 'Warrior',
    2: 'Paladin',
    3: 'Hunter',
    4: 'Rogue',
    5: 'Priest',
    6: 'Death Knight',
    7: 'Shaman',
    8: 'Mage',
    9: 'Warlock',
    10: 'Monk',
    11: 'Druid',
    12: 'Demon Hunter'
  };

  var RACES = {
    1: {
      side: "Alliance",
      race: "Human"
    },
    2: {
      side: "Horde",
      race: "Orc"
    },
    3: {
      side: "Alliance",
      race: "Dwarf"
    },
    4: {
      side: "Alliance",
      race: "Night Elf"
    },
    5: {
      side: "Horde",
      race: "Undead"
    },
    6: {
      side: "Horde",
      race: "Tauren"
    },
    7: {
      side: "Alliance",
      race: "Gnome"
    },
    8: {
      side: "Horde",
      race: "Troll"
    },
    9: {
      side: "Horde",
      race: "Goblin"
    },
    10: {
      side: "Horde",
      race: "Blood Elf"
    },
    11: {
      side: "Alliance",
      race: "Draenei"
    },
    22: {
      side: "Alliance",
      race: "Worgen"
    },
    24: {
      side: "Neutral",
      race: "Pandaren"
    },
    25: {
      side: "Alliance",
      race: "Pandaren"
    },
    26: {
      side: "Horde",
      race: "Pandaren"
    }
  };


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


  // Builds the url for the API request
  url = API_URL
    + SERVER
    + '/' + CHARACTER
    + '?locale=' + LOCALE
    + '&apikey=' + API_KEY;


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