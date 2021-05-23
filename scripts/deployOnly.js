async function main() {
  const governance_address = "";
  const rewards_address = "";
  const stETH_address = "";
  const stakingRewardsToken_address = "";

  const OcToken = await ethers.getContractFactory("OcToken");
  const _OcToken = await OcToken.deploy();
  await _OcToken.deployed();
  console.log("OcToken deployed to:", _OcToken.address);

  const Occultist = await ethers.getContractFactory("Occultist");
  const _Occultist = await Occultist.deploy(
    stETH_address,
    _OcToken.address,
    governance_address,
    governance_address
  );
  await _Occultist.deployed();
  console.log("Occultist deployed to:", _Occultist.address);

  const LidoVault = await ethers.getContractFactory("LidoVault");
  const _LidoVault = await LidoVault.deploy(stETH_address);
  await _LidoVault.deployed();
  console.log("LidoVault deployed to:", _LidoVault.address);

  const LidoVaultAdapter = await ethers.getContractFactory("LidoVaultAdapter");
  const _LidoVaultAdapter = await LidoVaultAdapter.deploy(
    _LidoVault.address,
    _Occultist.address
  );
  await _LidoVaultAdapter.deployed();
  console.log("LidoVaultAdapter deployed to:", _LidoVaultAdapter.address);

  const Transmuter = await ethers.getContractFactory("Transmuter");
  const _Transmuter = await Transmuter.deploy(
    _OcToken.address,
    stETH_address,
    governance_address
  );
  await _Transmuter.deployed();
  console.log("Transmuter deployed to:", _Transmuter.address);

  const StakingPools = await ethers.getContractFactory("StakingPools");
  const _StakingPools = await StakingPools.deploy(
    stakingRewardsToken_address,
    governance_address
  );
  await _StakingPools.deployed();
  console.log("StakingPools deployed to:", _StakingPools.address);

  const occultist = await Occultist.attach(_Occultist.address);
  await occultist.setTransmuter(_Transmuter.address);
  console.log("Occultist: transmuter address set to Transmuter");
  await occultist.setRewards(rewards_address);
  console.log("Occultist: rewards wallet set to rewards_address");
  await occultist.initialize(_LidoVaultAdapter.address);
  console.log("Occultist: initialized with LidoVaultAdapter");

  const ocToken = await OcToken.attach(_OcToken.address);
  await ocToken.setWhitelist(_Occultist.address, true);
  console.log("OcToken: whitelisted Occultist");
  await ocToken.setCeiling(_Occultist.address, ethers.constants.MaxUint256);
  console.log("OcToken: set Occultist minting ceiling to MaxUint256");

  const transmuter = await Transmuter.attach(_Transmuter.address);
  await transmuter.setWhitelist(_Occultist.address, true);
  console.log("Transmuter: whitelisted Occultist");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
