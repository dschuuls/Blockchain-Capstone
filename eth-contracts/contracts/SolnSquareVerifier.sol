// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.6;

// define a contract call to the zokrates generated solidity contract <Verifier>
import './SquareVerifier.sol';
import './ERC721Mintable.sol';

// define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
contract SolnSquareVerifier is MyLittleHouseToken {

    SquareVerifier private verifier;

    constructor (address squareVerifierAdr) MyLittleHouseToken() {
        verifier = SquareVerifier(squareVerifierAdr);
    }

    // define a solutions struct that can hold an index & an address
    struct Solution {
        uint256 index;
        address sender;
    }

    // define an array of the above struct
    Solution[] private solutions;

    // define a mapping to store unique solutions submitted
    mapping(uint256 => bool) private uniqueSolutions;

    // Create an event to emit when a solution is added
    event SolutionAdded(uint256 index, address sender, uint256 input);

    // Create a function to add the solutions to the array and emit the event
    function addSolution
    (
        address sender,
        uint256 input
    )
        internal
        onlyOwner
    {
        uint256 index = solutions.length;
        Solution memory newSolution = Solution({
            index: index,
            sender: sender
        });
        solutions.push(newSolution);
        uniqueSolutions[input] = true;
        emit SolutionAdded(index, sender, input);
    }

    // Create a function to mint new NFT
    function verifyMint
    (
        address to,
        uint256 tokenId,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    )
        public
        onlyOwner
    {
        bool debug = false;

        //  - make sure the solution is unique (has not been used before)
        require(!uniqueSolutions[input[0]], 'proof has been used before');

        //  - mint new NFT only after the solution has been verified
        bool verified = verifier.verifyTx(a, b, c, input);
        require(verified, 'proof could not be verified');
        super.mint(to, tokenId);

        //  - make sure you handle metadata as well as token supply
        addSolution(to, input[0]);
    }

}
