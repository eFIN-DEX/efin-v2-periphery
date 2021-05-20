pragma solidity =0.6.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) ERC20(_name,_symbol) public {
        _setupDecimals(_decimals);
        _mint(msg.sender, 100000 * (10 ** uint256(_decimals)));
    }

    /**
     * @dev See {ERC20-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the {MinterRole}.
     */
    function mint(address account, uint256 amount) public returns (bool) {
        _mint(account, amount);
        return true;
    }
}