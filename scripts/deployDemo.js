async function main() {
  console.log("================================");
  console.log("Preparing demo...");
  console.log("================================");

  const accounts = await ethers.provider.listAccounts();
  const owner_address = accounts[0];
  const rewards_address = accounts[1];

  const StETHMock = await ethers.getContractFactory("StETHMock");
  const _StETHMock = await StETHMock.deploy();
  await _StETHMock.deployed();
  console.log("StETHMock deployed to:", _StETHMock.address);

  const OcToken = await ethers.getContractFactory("OcToken");
  const _OcToken = await OcToken.deploy();
  await _OcToken.deployed();
  console.log("OcToken deployed to:", _OcToken.address);

  const Occultist = await ethers.getContractFactory("Occultist");
  const _Occultist = await Occultist.deploy(
    _StETHMock.address,
    _OcToken.address,
    owner_address,
    owner_address
  );
  await _Occultist.deployed();
  console.log("Occultist deployed to:", _Occultist.address);

  const LidoVault = await ethers.getContractFactory("LidoVault");
  const _LidoVault = await LidoVault.deploy(_StETHMock.address);
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
    _StETHMock.address,
    owner_address
  );
  await _Transmuter.deployed();
  console.log("Transmuter deployed to:", _Transmuter.address);

  const LDOMock = await ethers.getContractFactory("LDOMock");
  const _LDOMock = await LDOMock.deploy();
  await _LDOMock.deployed();
  console.log("LDOMock deployed to:", _LDOMock.address);

  const StakingPools = await ethers.getContractFactory("StakingPools");
  const _StakingPools = await StakingPools.deploy(
    _LDOMock.address,
    owner_address
  );
  await _StakingPools.deployed();
  console.log("StakingPools deployed to:", _StakingPools.address);

  const occultist = await Occultist.attach(_Occultist.address);
  await occultist.setTransmuter(_Transmuter.address);
  console.log("Occultist: transmuter address set to Transmuter");
  await occultist.setRewards(rewards_address);
  console.log("Occultist: rewards wallet set to rewards_address");
  await occultist.setHarvestFee(1000);
  console.log("Occultist: fee set to 10%");
  await occultist.initialize(_LidoVaultAdapter.address);
  console.log("Occultist: initialized with LidoVaultAdapter");

  const ocToken = await OcToken.attach(_OcToken.address);
  await ocToken.setWhitelist(_Occultist.address, true);
  console.log("OcToken: whitelisted Occultist");
  await ocToken.setCeiling(
    _Occultist.address,
    ethers.utils.parseUnits("1000000000000", 18)
  );
  console.log("OcToken: set Occultist minting ceiling to 1000000000000");

  const transmuter = await Transmuter.attach(_Transmuter.address);
  await transmuter.setWhitelist(_Occultist.address, true);
  console.log("Transmuter: whitelisted Occultist");

  const ldoMock = await LDOMock.attach(_LDOMock.address);
  await ldoMock.grantRole(
    "0xf0887ba65ee2024ea881d91b74c2450ef19e1557f03bed3ea9f16b037cbe2dc9",
    _StakingPools.address
  );
  console.log("LDOMock: assigned minter role to StakingPools");

  const stakingPools = await StakingPools.attach(_StakingPools.address);
  await stakingPools.createPool(_LDOMock.address);
  console.log("StakingPools: created pool for LDO");
  await stakingPools.createPool(_OcToken.address);
  console.log("StakingPools: created pool for ocstETH");
  await stakingPools.setRewardWeights([1, 1]);
  console.log("StakingPools: set equal reward weights for both pools");
  await stakingPools.setRewardRate(ethers.utils.parseUnits("2", 18));
  console.log("StakingPools: set reward rate to 2 LDO per second");

  const stETHMock = await StETHMock.attach(_StETHMock.address);
  await stETHMock.mint(
    _LidoVault.address,
    ethers.utils.parseUnits("1000000000000", 18)
  );
  console.log(
    "StETHMock: minted stETH to LidoVault (mock stETH not fully functional)"
  );
  await stETHMock.setTotalShares(ethers.utils.parseUnits("10000", 18));
  console.log(
    "StETHMock: set total shares to 10000 (mock stETH not fully functional)"
  );
  await stETHMock.setTotalPooledEther(ethers.utils.parseUnits("10000", 18));
  console.log(
    "StETHMock: set total pooled ether to 10000 (mock stETH not fully functional)"
  );

  console.log("================================");
  console.log("Starting demo...");
  console.log("================================");
  console.log("--------------------------------");
  console.log("Basic Occultist and Transmuter functionality demo");
  console.log("--------------------------------");

  async function loadBalance() {
    console.log(
      "-stETH balance: " +
        ethers.utils.formatUnits(
          (await stETHMock.balanceOf(owner_address)).toString(),
          18
        )
    );
    console.log(
      "-ocstETH balance: " +
        ethers.utils.formatUnits(
          (await ocToken.balanceOf(owner_address)).toString(),
          18
        )
    );
  }

  console.log("Approve Occultist to use stETH");
  await stETHMock.approve(
    _Occultist.address,
    ethers.utils.parseUnits("1000000000000", 18)
  );
  console.log("Approve Occultist to use ocstETH");
  await ocToken.approve(
    _Occultist.address,
    ethers.utils.parseUnits("1000000000000", 18)
  );
  console.log("Approve Transmuter to use ocstETH");
  await ocToken.approve(
    _Transmuter.address,
    ethers.utils.parseUnits("1000000000000", 18)
  );
  console.log("Mint owner_address 10000 stETH");
  await stETHMock.mint(owner_address, ethers.utils.parseUnits("10000", 18));
  await loadBalance();
  console.log(
    "Deposit 10000 stETH into Occultist as collateral (0 stETH loan : 10000 stETH collateral)"
  );
  await occultist.deposit(ethers.utils.parseUnits("10000", 18));
  await loadBalance();
  console.log(
    "Mint 5000 ocstETH at 50% LTV (5000 stETH loan : 10000 stETH collateral)"
  );
  await occultist.mint(ethers.utils.parseUnits("5000", 18));
  await loadBalance();
  console.log(
    "Repay loan with 2500 ocstETH (2500 stETH loan : 10000 stETH collateral)"
  );
  await occultist.repay(0, ethers.utils.parseUnits("2500", 18));
  await loadBalance();
  console.log(
    "Withdraw 5000 stETH from Occultist (2500 stETH loan : 5000 stETH collateral)"
  );
  await occultist.withdraw(ethers.utils.parseUnits("5000", 18));
  await loadBalance();
  console.log("Stake 2500 ocstETH in Transmuter");
  await transmuter.stake(ethers.utils.parseUnits("2500", 18));
  await loadBalance();
  console.log(
    "Repay loan with 1250 stETH (1250 stETH loan : 5000 stETH collateral)"
  );
  await occultist.repay(ethers.utils.parseUnits("1250", 18), 0);
  await loadBalance();
  console.log(
    "Withdraw stETH from Transmuter (1250 ocstETH transmuted to stETH)"
  );
  await transmuter.transmuteAndClaim();
  await loadBalance();
  console.log(
    "Liquidate 1250 stETH to repay loan (0 stETH loan : 3750 stETH collateral)"
  );
  await occultist.liquidate(ethers.utils.parseUnits("1250", 18));
  await loadBalance();
  console.log(
    "Withdraw stETH from Transmuter (1250 ocstETH transmuted to stETH)"
  );
  await transmuter.transmuteAndClaim();
  await loadBalance();
  console.log(
    "Withdraw 3750 stETH from Occultist (0 stETH loan : 0 stETH collateral)"
  );
  await occultist.withdraw(ethers.utils.parseUnits("3750", 18));
  await loadBalance();

  console.log("--------------------------------");
  console.log("Basic StakingPools functionality demo");
  console.log("--------------------------------");

  async function loadStakeBalance() {
    console.log(
      "-ocstETH balance: " +
        ethers.utils.formatUnits(
          (await ocToken.balanceOf(owner_address)).toString(),
          18
        )
    );
    console.log(
      "-LDO balance: " +
        ethers.utils.formatUnits(
          (await ldoMock.balanceOf(owner_address)).toString(),
          18
        )
    );
  }

  console.log("Approve StakingPools to use ocstETH");
  await ocToken.approve(
    _StakingPools.address,
    ethers.utils.parseUnits("1000000000000", 18)
  );
  console.log("Get 5000 ocstETH by taking a loan");
  await occultist.deposit(ethers.utils.parseUnits("10000", 18));
  await occultist.mint(ethers.utils.parseUnits("5000", 18));
  await loadStakeBalance();
  console.log("Stake 5000 ocstETH in StakingPools");
  await stakingPools.deposit(1, ethers.utils.parseUnits("5000", 18));
  await loadStakeBalance();
  console.log("Exit StakingPools");
  await stakingPools.exit(1);
  await loadStakeBalance();
  await occultist.repay(0, ethers.utils.parseUnits("5000", 18));
  await occultist.withdraw(ethers.utils.parseUnits("10000", 18));

  console.log("--------------------------------");
  console.log("Basic LidoVault functionality demo");
  console.log("--------------------------------");

  console.log(
    "Deposit 10000 stETH into Occultist as collateral and mint 5000 ocstETH"
  );
  await occultist.deposit(ethers.utils.parseUnits("10000", 18));
  await occultist.mint(ethers.utils.parseUnits("5000", 18));
  await loadBalance();
  console.log("Stake 5000 ocstETH in Transmuter");
  await transmuter.stake(ethers.utils.parseUnits("5000", 18));
  await loadBalance();
  console.log(
    "Increase mock stETH pooled ether to shares ratio to emulate 60% yield"
  );
  await stETHMock.setTotalShares(ethers.utils.parseUnits("10000", 18));
  await stETHMock.setTotalPooledEther(ethers.utils.parseUnits("16000", 18));
  console.log(
    "Harvest yield from vault (10% goes to rewards wallet, 90% goes to Transmuter)"
  );
  await occultist.harvest(0);
  console.log(
    "-Rewards wallet stETH balance: " +
      ethers.utils.formatUnits(
        (await stETHMock.balanceOf(rewards_address)).toString(),
        18
      )
  );
  console.log(
    "-Transmuter stETH balance: " +
      ethers.utils.formatUnits(
        (await stETHMock.balanceOf(_Transmuter.address)).toString(),
        18
      )
  );
  console.log("Withdraw 10000 stETH from Occultist (loan paid off by yield)");
  await occultist.withdraw(ethers.utils.parseUnits("10000", 18));
  await loadBalance();
  console.log(
    "Withdraw stETH from Transmuter (all staked ocstETH transmuted to stETH)"
  );
  await transmuter.transmuteAndClaim();
  await loadBalance();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
