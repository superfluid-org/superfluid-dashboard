const deployTestToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-test-token");
const deploySuperToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-super-token");
const TokenABI =
    require("@superfluid-finance/ethereum-contracts/build/contracts/TestToken.json").abi;
const GovernanceABI =
    require("@superfluid-finance/ethereum-contracts/build/contracts/TestGovernance.json").abi;
const ISuperfluid =
    require("@superfluid-finance/ethereum-contracts/build/contracts/ISuperfluid").abi;
const { ethers, web3 } = require("hardhat");
const { Framework } = require("@superfluid-finance/sdk-core");

const provider = web3;

const errorHandler = (err) => {
    if (err) throw err;
};

const deployTestEnv = async () => {
    const accounts = await ethers.getSigners();
    // deploy the framework
    await deployTestToken(errorHandler, [":", "fDAI"], {
        web3,
        from: accounts[0].address,
    });
    await deploySuperToken(errorHandler, [":", "fDAI"], {
        web3,
        from: accounts[0].address,
    });

    const sf = await Framework.create({
        networkName: "custom",
        provider,
        dataMode: "WEB3_ONLY",
        resolverAddress: process.env.RESOLVER_ADDRESS,
        protocolReleaseVersion: "test",
    });

    const signer = await sf.createSigner({
        signer: accounts[0],
        provider: provider,
    });
    const daix = await sf.loadSuperToken("fDAIx");
    const daiAddress = daix.underlyingToken.address;
    const dai = new ethers.Contract(daiAddress, TokenABI, accounts[0]);
    const host = new ethers.Contract(
        sf.settings.config.hostAddress,
        ISuperfluid,
        accounts[0]
    );
    const governanceAddress = await host.getGovernance();
    const superfluid = new ethers.Contract(
        governanceAddress,
        GovernanceABI,
        accounts[0]
    );
    const _appDeployer = await ethers.getContractFactory(
        "AppLogic",
        accounts[0]
    );
    const _appLogicImplementation = await _appDeployer.deploy();
    const _cloneFactory = await ethers.getContractFactory(
        "CloneFactory",
        accounts[0]
    );
    const cloneFactory = await _cloneFactory.deploy(
        _appLogicImplementation.address,
        host.address,
    );
    const lockerFactory = await ethers.getContractFactory(
        "LockerMock",
        accounts[0]
    );
    const _hostFactory = await ethers.getContractFactory("HostMock", accounts[0]);
    const mockHost = await _hostFactory.deploy();
    const _CFAV1Factory = await ethers.getContractFactory(
        "MockCFAv1",
        accounts[0]
    );
    const mockCFAv1 = await _CFAV1Factory.deploy();
    await mockHost.setCFA1(mockCFAv1.address);

    const mockCloneFactory = await _cloneFactory.deploy(
        _appLogicImplementation.address,
        mockHost.address,
    );

    await superfluid.authorizeAppFactory(
        sf.settings.config.hostAddress,
        cloneFactory.address
    );
    return {
        defaultDeployer: signer,
        accounts: accounts,
        sf: sf,
        superfluid: superfluid,
        host: host,
        tokens: {
            dai: dai,
            daix: daix,
        },
        factories: {
            clone: cloneFactory,
            locker: lockerFactory,
        },

        mocks: {
            host: mockHost,
            cfa: mockCFAv1,
            clone: mockCloneFactory
        }
    }
};


module.exports = {
    deployTestEnv,
}

deployTestEnv().then(r => console.log(r))

