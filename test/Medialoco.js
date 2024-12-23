import { expect } from 'chai';
import hardhat from 'hardhat';
const { ethers } = hardhat;

const tokens = (n) => ethers.parseUnits(n.toString(), 'ether');

describe('MedialocoToken', () => {
  let token, accounts, deployer, receiver, exchange;

  beforeEach(async () => {
    const Token = await ethers.getContractFactory('MedialocoToken');
    token = await Token.deploy('Medialoco', 'LOCO', '1000000');

    accounts = await ethers.getSigners();
    deployer = accounts[0];
    receiver = accounts[1];
    exchange = accounts[2];
  });

  describe('Deployment', () => {
    const name = 'Medialoco';
    const symbol = 'LOCO';
    const decimals = 18;
    const totalSupply = tokens(1000000);

    it('has correct name', async () => {
      expect(await token.name()).to.equal(name);
    });

    it('has correct symbol', async () => {
      expect(await token.symbol()).to.equal(symbol);
    });

    it('has correct decimals', async () => {
      expect(await token.decimals()).to.equal(decimals);
    });

    it('has correct total supply', async () => {
      expect(await token.totalSupply()).to.equal(totalSupply);
    });

    it('assigns total supply to deployer', async () => {
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
    });
  });

  describe('Sending Tokens', () => {
    let amount, transaction, result;

    describe('Success', () => {
      beforeEach(async () => {
        amount = tokens(100);
        transaction = await token.connect(deployer).transfer(receiver.address, amount);
        result = await transaction.wait();
      });

      it('transfers token balances', async () => {
        expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900));
        expect(await token.balanceOf(receiver.address)).to.equal(amount);
      });

      it('emits a Transfer event', async () => {
        const event = result.logs.find(log =>
          log.topics[0] === ethers.id('Transfer(address,address,uint256)')
        );
        expect(event).to.not.be.undefined;

        const decodedEvent = ethers.defaultAbiCoder.decode(
          ['address', 'address', 'uint256'],
          event.data
        );
        expect(decodedEvent[0]).to.equal(deployer.address);
        expect(decodedEvent[1]).to.equal(receiver.address);
        expect(decodedEvent[2]).to.equal(amount);
      });
    });

    describe('Failure', () => {
      it('rejects insufficient balances', async () => {
        const invalidAmount = tokens(100000000);
        await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted;
      });

      it('rejects invalid recipient', async () => {
        const amount = tokens(100);
        await expect(token.connect(deployer).transfer(ethers.ZeroAddress, amount)).to.be.reverted;
      });
    });
  });

  describe('Approving Tokens', () => {
    let amount, transaction, result;

    beforeEach(async () => {
      amount = tokens(100);
      transaction = await token.connect(deployer).approve(exchange.address, amount);
      result = await transaction.wait();
    });

    describe('Success', () => {
      it('allocates an allowance for delegated token spending', async () => {
        expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount);
      });

      it('emits an Approval event', async () => {
        const event = result.logs.find(log =>
          log.topics[0] === ethers.id('Approval(address,address,uint256)')
        );
        expect(event).to.not.be.undefined;

        const decodedEvent = ethers.defaultAbiCoder.decode(
          ['address', 'address', 'uint256'],
          event.data
        );
        expect(decodedEvent[0]).to.equal(deployer.address);
        expect(decodedEvent[1]).to.equal(exchange.address);
        expect(decodedEvent[2]).to.equal(amount);
      });
    });

    describe('Failure', () => {
      it('rejects invalid spenders', async () => {
        await expect(token.connect(deployer).approve(ethers.ZeroAddress, amount)).to.be.reverted;
      });
    });
  });

  describe('Delegated Token Transfers', () => {
    let amount, transaction, result;

    beforeEach(async () => {
      amount = tokens(100);
      transaction = await token.connect(deployer).approve(exchange.address, amount);
      result = await transaction.wait();
    });

    describe('Success', () => {
      beforeEach(async () => {
        transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount);
        result = await transaction.wait();
      });

      it('transfers token balances', async () => {
        expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900));
        expect(await token.balanceOf(receiver.address)).to.equal(amount);
      });

      it('resets the allowance', async () => {
        expect(await token.allowance(deployer.address, exchange.address)).to.equal(tokens(0));
      });

      it('emits a Transfer event', async () => {
        const event = result.logs.find(log =>
          log.topics[0] === ethers.id('Transfer(address,address,uint256)')
        );
        expect(event).to.not.be.undefined;

        const decodedEvent = ethers.defaultAbiCoder.decode(
          ['address', 'address', 'uint256'],
          event.data
        );
        expect(decodedEvent[0]).to.equal(deployer.address);
        expect(decodedEvent[1]).to.equal(receiver.address);
        expect(decodedEvent[2]).to.equal(amount);
      });
    });

    describe('Failure', () => {
      it('rejects insufficient balances', async () => {
        const invalidAmount = tokens(100000000);
        await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted;
      });
    });
  });
});
