import { expect } from 'chai';
import hardhat from 'hardhat';
const { ethers } = hardhat;

console.log('Ethers.parseUnits:', ethers.parseUnits);

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether')
}

describe('MedialocoToken', () => {
  let token, accounts, deployer

  beforeEach(async () => {
    const Token = await ethers.getContractFactory('MedialocoToken')
    token = await Token.deploy('Medialoco', 'LOCO', '1000000')

    accounts = await ethers.getSigners()
    deployer = accounts[0]
  })

  describe('Deployment', () => {
    const name = 'Medialoco'
    const symbol = 'LOCO'
    const decimals = '18'
    const totalSupply = tokens('1000000')

    it('has correct name', async () => {
      expect(await token.name()).to.equal(name)
    })

    it('has correct symbol', async () => {
      expect(await token.symbol()).to.equal(symbol)
    })

    it('has correct decimals', async () => {
      expect(await token.decimals()).to.equal(decimals)
    })

    it('has correct total supply', async () => {
      expect(await token.totalSupply()).to.equal(totalSupply)
    })

    it('assigns total supply to deployer', async () => {
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
    })

  })

})