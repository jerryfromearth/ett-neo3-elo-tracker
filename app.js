const fetch = require("node-fetch");
const nconf = require("nconf");

let dbFile = "db.json";
function parseJson(json) {
  pico_users = json.OnlineUses.filter((obj) => obj.Device === "Pico Neo 3");
  pico_users = pico_users.map((user) => {
    user.ELO = Number(user.ELO);
    user.Id = Number(user.Id);
    user.Time = new Date().toISOString();
    return user;
  });

  pico_users = pico_users.filter((user) => user.ELO >= 2000);

  console.log(new Date().toISOString(), pico_users);
  return pico_users;
}

async function loadAndParse() {
  // Parse users from json
  nconf.file(dbFile);
  let users = nconf.get("users") ?? [];
  console.log("Users:", JSON.stringify(users));

  // Fetch new_users
  let new_users = [];
  try {
    let url =
      "http://elevenlogcollector-env.js6z6tixhb.us-west-2.elasticbeanstalk.com/ElevenServerLiteSnapshot";
    let settings = { method: "Get" };
    let res = await fetch(url, settings);
    let json = await res.json();
    new_users = parseJson(json);
  } catch (error) {
    console.error(error);
    return;
  }
  console.log("New Users:", JSON.stringify(new_users));

  // Merge new_users into users
  new_users.forEach((new_user) => {
    let existing_users = users.filter((user) => user.Id === new_user.Id);
    if (existing_users.length === 0) {
      users.push(new_user);
    } else {
      let existing_user = existing_users[0];
      if (new_user.ELO >= existing_user.ELO) {
        Object.assign(existing_user, new_user);
      }
    }
  });

  users = users.sort((user1, user2) => {
    return user2.ELO - user1.ELO;
  });
  console.log("Merged&sorted users:", JSON.stringify(users));

  nconf.set("users", users);
  nconf.save();
}

loadAndParse();
let minutes = 1;
setInterval(loadAndParse, 1000 * 60 * minutes);
