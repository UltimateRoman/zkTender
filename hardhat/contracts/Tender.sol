//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract Tender is Initializable {

    uint256 public constant DEPOSIT_AMOUNT = 0.1 ether;

    struct TenderInfo {
        uint256 biddingDeadline;
        string title;
        string description;
    }

    address owner;
    address winningBidder;
    TenderInfo public tenderInfo;
    uint8 public bidderCount;
    uint8 public bidCount;
    address[] public bidders;

    bool public paymentSettled;

    modifier onlyBefore(uint time) {
        require(block.timestamp < time);
        _;
    }

    modifier onlyAfter(uint time) {
        require(block.timestamp > time);
        _;
    }

    function initialize(TenderInfo calldata _tenderInfo, address _owner) initializer external {
        tenderInfo = _tenderInfo;
        owner = _owner;
    }

    mapping(address => string) bidderNames;
    mapping(uint => address) bidderID;
    mapping(address => uint256) public bidAmount;

    function registerBidder(string calldata _bidderName) external {
        require(msg.sender != owner, "creator cannot bid");
        bidderCount += 1;
        bidderNames[msg.sender] = _bidderName;
        bidderID[bidderCount] = msg.sender;
    }

    function placeBid(uint256 _amount) external payable {
        require(msg.value >= 0.1 ether, "security deposit required");
        bidAmount[msg.sender] = _amount;
        bidCount += 1;
    }

    function settleTender() external onlyAfter(tenderInfo.biddingDeadline) {
        require(!isTenderOpen(), "tender still open");
        address lowestBidder = bidderID[1];
        uint256 lowestBid = bidAmount[lowestBidder];
        for (uint8 i=2; i<=bidderCount; ++i) {
            if (bidAmount[bidderID[i]] < lowestBid) {
                lowestBid = bidAmount[bidderID[i]];
                lowestBidder = bidderID[i];
            }
        }
        winningBidder = lowestBidder;
    }

    function settlePayment() external payable {
        require(msg.sender == winningBidder, "Not tender winner");
        payable(owner).transfer(bidAmount[winningBidder]);
        paymentSettled = true;
    }

    function isTenderOpen() public view returns (bool) {
        return block.timestamp < tenderInfo.biddingDeadline;
    }

    function isTenderSettled() public view returns (bool) {
        return winningBidder != address(0);
    }

    function winningBidderName() public view returns (string memory) {
        return bidderNames[winningBidder];
    }
}
