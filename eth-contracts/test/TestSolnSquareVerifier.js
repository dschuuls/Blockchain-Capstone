var SquareVerifier = artifacts.require('SquareVerifier');
var SolnSquareVerifier = artifacts.require('SolnSquareVerifier');

const proof = require('../../zokrates/code/square/proof.json')['proof'];
const inputs = require('../../zokrates/code/square/proof.json')['inputs'];

contract('SolnSquareVerifier', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];

    beforeEach(async function () {
        let squareVerifier = await SquareVerifier.new({from: account_one});
        this.contract = await SolnSquareVerifier.new(squareVerifier.address, {from: account_one});
    })

    it('an ERC721 token can be minted', async function () {

        let totalSupplyBefore = await this.contract.totalSupply.call();

        try {
            await this.contract.verifyMint(account_two, 1, proof.a, proof.b, proof.c, inputs);
        } catch (e) {
            console.log(e);
        }

        let totalSupplyAfter = await this.contract.totalSupply.call();

        assert.equal(totalSupplyBefore, 0, 'total supply before is incorrect');
        assert.equal(totalSupplyAfter, 1, 'total supply after is incorrect');
    })

    it('minting two tokens with same proof fails', async function () {

        let reverted = false;

        await this.contract.verifyMint(account_two, 1, proof.a, proof.b, proof.c, inputs);

        try {
            await this.contract.verifyMint(account_two, 2, proof.a, proof.b, proof.c, inputs);
        } catch (e) {
            reverted = true;
            assert.equal(e.message.includes('proof has been used before'), true, 'reverted with wrong error msg');
        }

        assert.equal(reverted, true, 'should have been reverted');
    })
})
