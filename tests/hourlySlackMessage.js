const fs = require("fs");
const axios = require("axios");
const webhookURL = process.env.CI_SLACK_WEBHOOK;
const moneyIcon = "https://cdn-icons-png.flaticon.com/512/639/639364.png";
const graphIcon = "https://cdn-icons-png.flaticon.com/512/10466/10466245.png";
const rpcIcon = "https://cdn-icons-png.flaticon.com/512/1349/1349733.png";
const snailIcon = "https://cdn-icons-png.flaticon.com/512/826/826908.png";

let messageToSend = {
  blocks: [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `Cypress hourly test run ${process.env.CI_RUN_NUMBER} has failed`,
        emoji: true,
      },
    },
  ],
};

if (process.argv.length < 3) {
  console.log("Please provide a file path as an argument.");
  process.exit(1);
}

const filePath = process.argv[2];

function addNewSection(text, image) {
  messageToSend.blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: text,
    },
    accessory: {
      type: "image",
      image_url: image,
      alt_text: "why u no work :(",
    },
  });
  messageToSend.blocks.push({
    type: "divider",
  });
}

function addContext() {
  messageToSend.blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `<${process.env.CI_ACTION_URL}|See the Github action here>`,
      },
    ],
  });
}

async function sendSlackMessage() {
  let message = JSON.stringify(messageToSend);
  try {
    const response = await axios.post(webhookURL, message, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error sending Slack message:", error.message);
    console.log(error);
  }
}

async function parseTestResultsAndSendMessage(json) {
  let finalRPCMessage = "";
  let finalGraphMessage = "";
  let faucetMessage = "";
  let finalUIMessage = "";
  let UISectionAdded = false;
  let tests = JSON.parse(json).results[0].suites[0].tests;
  let failingTests = tests.filter((test) => test.fail);
  failingTests.forEach((element) => {
    const regex = /\s*\(example #\d+\)$/;
    const titleWithoutExample = element.title.replace(regex, "");
    const network = titleWithoutExample.split("on ")[1];
    if (element.title.includes("Wrap page")) {
      if (!UISectionAdded) {
        finalUIMessage += `Cypress had trouble choosing the native token in the dashboard on *${network}*`;
        UISectionAdded = true;
      } else {
        finalUIMessage += `, *${network}*`;
      }
    }
    if (element.title.includes("Superfluid RPCS are not behind")) {
      const behindInMinutes = element.err.message
        .split("AssertionError: ")[1]
        .split("\n")[0];
      const lastBlockRegex = /Latest block number: \d+/;
      const lastBlockMessage = element.err.message.match(lastBlockRegex)[0];
      finalRPCMessage += `*${behindInMinutes}*\n ${lastBlockMessage}\n\n`;
    }
    if (element.title.includes("The graph is not behind")) {
      if (
        element.err.message.includes(
          "Cannot read properties of undefined (reading '_meta')"
        )
      ) {
        finalGraphMessage += `*There was an issue getting the graphs metadata of ${network} network*\n\n Please have a look at this ASAP\n\n`;
      } else {
        const behindInMinutes = element.err.message
          .split("AssertionError: ")[1]
          .split("\n")[0];
        const lastBlockRegex = /Last synced block number: \d+/;
        const lastBlockMessage = element.err.message.match(lastBlockRegex)[0];
        finalGraphMessage += `*${behindInMinutes}*\n ${lastBlockMessage}\n\n`;
      }
    }
    if (element.title.includes("Testnet faucet fund check")) {
      faucetMessage +=
        "Faucet has got less than *10 MATIC* left , please add some more to *0x74CDF863b00789c29734F8dFd9F83423Bc55E4cE*";
    }
  });

  if (UISectionAdded) {
    addNewSection(
      `${finalUIMessage} this usually means the graph requests are really slow , or protocol governance has been messed up, please have a look`,
      snailIcon
    );
  }
  if (finalGraphMessage !== "") {
    addNewSection(finalGraphMessage, graphIcon);
  }
  if (finalRPCMessage !== "") {
    addNewSection(finalRPCMessage, rpcIcon);
  }
  if (faucetMessage !== "") {
    addNewSection(faucetMessage, moneyIcon);
  }

  addContext();
  sendSlackMessage();
}

fs.readFile(filePath, "utf8", async (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  parseTestResultsAndSendMessage(data);
});
