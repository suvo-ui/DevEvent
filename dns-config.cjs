const dns = require("node:dns");

dns.setServers(["8.8.8.8"]);

console.log("Node DNS servers:", dns.getServers());
