const fetch = require("node-fetch");
const fs = require("fs");

function parseJson(json, fp) {
  pico_users = json.OnlineUses.filter((obj) => obj.Device === "Pico Neo 3");
  pico_users = pico_users.map((user) => {
    user.ELO = Number(user.ELO);
    user.Id = Number(user.Id);
    return user;
  });
  pico_users = pico_users.sort((user1, user2) => {
    return user2.ELO - user1.ELO;
  });

  let highest = pico_users[0];
  highest.Time = new Date().toISOString();
  console.log(pico_users[0]);

  fs.appendFileSync("log.txt", JSON.stringify(pico_users[0], null, 2) + "\n");
}

function loadAndParse() {
  try {
    let url =
      "http://elevenlogcollector-env.js6z6tixhb.us-west-2.elasticbeanstalk.com/ElevenServerLiteSnapshot";
    let settings = { method: "Get" };
    fetch(url, settings)
      .then((res) => res.json())
      .then((json) => {
        parseJson(json);
      });
  } catch (error) {
    console.error(error);
  }
}
loadAndParse();
let minutes = 10;
setInterval(loadAndParse, 1000 * 60 * minutes);
// const fs=require('fs');
// let json=JSON.parse(fs.readFileSync('example.json'));
// parseJson(json);
