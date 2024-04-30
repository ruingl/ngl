import axios from 'axios';
import path from 'path';
import chalk from 'chalk';
import figlet from 'figlet';
import fs from 'fs-extra';

const cwd = process.cwd();
let sendedMessages = 0;
let errors = 0;

(async () => {
  try {
    const config = await fs.readJSON(path.join(
      cwd, 'json', 'config.json'
    )); 
    const proxies = await fs.readJSON(path.join(
      cwd, 'json', 'proxies.json'
    ));

    async function randomProxy() {
      const randomIndex = Math.floor(Math.random() * proxies.length);
      return proxies[randomIndex];
    }

    async function sendMessage() {
      const url = 'https://ngl.link/api/submit';
      const payload = { username: config.options.username, question: config.options.question, deviceId: "" };
      const headers = { 'Content-Type': 'application/json' };

      try {
        let proxyConfig = {};
        if (config.PROXY) {
          const proxy = await randomProxy();
          proxyConfig = {
            proxy: {
              host: proxy.ip,
              port: proxy.port
            }
          };
        }

        const response = await axios.post(url, payload, { headers: headers, ...proxyConfig });

        if (response.status === 200) {
          console.log(chalk.green(`[ ${sendedMessages++} ] Sent message to user successfully!`));
        };
      } catch (error) {
        console.error(chalk.red(`[ ${errors++} ] Error while sending message to user: ${error.message}`));
      }
    }

    figlet.text('NGLSpam', (err, data) => {
      console.log(chalk.blue(data));
      console.log(chalk.blue(' by Rui'));
      console.log();

      setInterval(() => {
        sendMessage();
      }, parseInt(config.PING_INTERVAL));
    });
  } catch (error) {
    console.error(chalk.red('Error occurred while reading JSON files:', error));
  }
})();