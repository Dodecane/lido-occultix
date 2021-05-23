# Occultix Protocol

The Occultix protocol enables the tokenization of the future yield of Lido stETH tokens.

It provides highly flexible instant loans on stETH that repay themselves over time. The synthetic protocol token ocstETH is backed by future stETH yield. There are no liquidations, and the only debt is time.
- Deposit stETH to mint ocstETH, a synthetic stETH-backed token that tokenizes future stETH yield
- Yield earned on stETH collateral automatically repays the loan over time.
- Transmute ocstETH back into stETH one-to-one by staking it in the Transmuter contract or trading it on incentivized Curve eth/stETH/ocstETH pools

## Contract interactions overview
![occultix flowchart](https://i.imgur.com/B9rF6iA.png)

## Run demo

 1. Install [node.js](https://nodejs.org/)
 2. Install [Docker Desktop](https://www.docker.com/get-started) (If you are using Windows, follow [this guide](https://docs.docker.com/docker-for-windows/wsl/) to install the WSL 2 backend. The `hardhat-vyper` plugin doesn't work on Windows)
 3. Clone this repository
 4. Install dependencies:
```
npm install
```
5. Compile contracts:
```
npm run compile
```
6. Start Hardhat Network:
```
npm run network
```
7. Open a new terminal (keep previous terminal open)
8. Run demo:
```
npm run demo
```

## Deployment

 1. Follow steps 1-7 above
 2. Update the addresses in `./scripts/deployOnly.js`:
```
const governance_address = "0x....";
const rewards_address = "0x....";
const stETH_address = "0x....";
const stakingRewardsToken_address = "0x....";
```
3. Deploy contracts:
```
npm run deploy
```
