// SPDX-License-Identifier:MIT

pragma solidity >0.8.0;

contract ERC20Token {
    string public name = "Indian Rupee";
    string public symbol = "INR";
    uint256 public totalSupply;
    uint8 public decimals = 18;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed from, address indexed to, uint256 amount);

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * 10 ** uint256(decimals);

        balanceOf[msg.sender] = totalSupply;

        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(
        address _to,
        uint256 _amount
    ) external returns (bool success) {
        require(_to != address(0), "Not a valid recipient address");
        require(balanceOf[msg.sender] >= _amount, "Not enough tokens");

        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;

        emit Transfer(msg.sender, _to, _amount);

        return true;
    }

    function approve(
        address _spender,
        uint256 _amount
    ) external returns (bool success) {
        require(_spender != address(0), "Not a valid address");

        allowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) external returns (bool success) {
        require(_from != address(0) && _to != address(0), "Invalid addresss");
        require(balanceOf[_from] >= _amount, "Not enough Tokens");
        require(allowance[_from][msg.sender] >= _amount, "Not allowed");

        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        allowance[_from][msg.sender] -= _amount;

        emit Transfer(_from, _to, _amount);
        return true;
    }
}
