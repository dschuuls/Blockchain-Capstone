var MyLittleHouseToken = artifacts.require('MyLittleHouseToken');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];

    const NUM_TEST_TOKENS = 5;

    describe('match erc721 spec', function () {

        beforeEach(async function () {

            this.contract = await MyLittleHouseToken.new({from: account_one});

            // mint multiple tokens
            for (let i = 1; i <= NUM_TEST_TOKENS; i++) {

                await this.contract.mint(account_one, i);
            }
        })

        it('should return total supply', async function () {

            let totalSupply = await this.contract.totalSupply.call();

            assert.equal(totalSupply, NUM_TEST_TOKENS, 'total supply is incorrect');
        })

        it('should get token balance', async function () {

            let balanceOne = await this.contract.balanceOf.call(account_one);
            let balanceTwo = await this.contract.balanceOf.call(account_two);

            assert.equal(balanceOne, NUM_TEST_TOKENS, 'balance of account_one is incorrect');
            assert.equal(balanceTwo, 0, 'balance of account_two is incorrect');
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () {

            const baseURI = 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/';

            for (let i = 1; i <= NUM_TEST_TOKENS; i++) {

                let tokenURI = await this.contract.tokenURI.call(i);

                assert.equal(tokenURI, baseURI.concat(i.toString()), 'tokenURI is incorrect');
            }
        })

        it('should return name and symbol', async function () {

            let name = await this.contract.name.call();
            let symbol = await this.contract.symbol.call();

            assert.equal(name, 'MyLittleHouseToken', 'name is incorrect');
            assert.equal(symbol, 'MLH', 'symbol is incorrect');
        })

        it('should transfer token from one owner to another', async function () {

            let balanceOne = await this.contract.balanceOf.call(account_one);
            let balanceTwo = await this.contract.balanceOf.call(account_two);
            let owner = await this.contract.ownerOf.call(1);

            assert.equal(balanceOne, NUM_TEST_TOKENS, 'balance of account_one is incorrect');
            assert.equal(balanceTwo, 0, 'balance of account_two is incorrect');
            assert.equal(owner, account_one, 'account_one should be the owner');

            await this.contract.transferFrom(account_one, account_two, 1, {from: account_one});

            balanceOne = await this.contract.balanceOf.call(account_one);
            balanceTwo = await this.contract.balanceOf.call(account_two);
            owner = await this.contract.ownerOf.call(1);

            assert.equal(balanceOne, NUM_TEST_TOKENS - 1, 'balance of account_one is incorrect');
            assert.equal(balanceTwo, 1, 'balance of account_two is incorrect');
            assert.equal(owner, account_two, 'account_two should be the owner');
        })
    });

    describe('have ownership properties', function () {

        beforeEach(async function () {

            this.contract = await MyLittleHouseToken.new({from: account_one});
        })

        it('should fail when minting when address is not contract owner', async function () {

            let reverted = false;
            try {
                await this.contract.mint(account_two, 1, {from: account_two});
            } catch (e) {
                reverted = true;
                assert.equal(e.message.includes('caller must be the owner'), true, 'reverted with wrong error msg');
            }
            assert.equal(reverted, true, 'should have been reverted');
        })

        it('should return contract owner', async function () {

            assert.equal(account_one, await this.contract.owner.call(), 'this is not the owner address');
        })

    });
})
