require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-vyper");

module.exports = {
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 999999,
      },
    },
  },
  vyper: {
    version: "0.2.12",
  },
};
