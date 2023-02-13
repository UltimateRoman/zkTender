//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract Tender is Initializable {
    uint8 public constant MAX_BIDS = 4;
    uint256 public constant DEPOSIT_AMOUNT = 0.1 ether;

    struct TenderInfo {
        uint256 biddingDeadline;
        string title;
        string description;
        string document;
    }

    address owner;
    address evaluator;
    address winningBidder;

    TenderInfo public tenderInfo;
    uint8 public bidderCount;
    uint8 public bidCount;
    address[] public bidders;
    bytes32[] public bids;

    mapping(address => string) bidderName;
    mapping(address => bytes32) public sealedBid;

    bool public biddingEnded;

    modifier onlyBefore(uint time) {
        require(block.timestamp < time);
        _;
    }

    modifier onlyAfter(uint time) {
        require(block.timestamp > time);
        _;
    }

    function initialize(TenderInfo calldata _tenderInfo, address _owner, address _evaluator) initializer external {
        tenderInfo = _tenderInfo;
        owner = _owner;
        evaluator = _evaluator;
    }

    function registerBidder(string calldata _bidderName) external {
        require(msg.sender != owner, "creator cannot bid");
        bidderCount += 1;
        bidderName[msg.sender] = _bidderName;
        bidders.push(msg.sender);
    }

    function placeBid(bytes32 _sealedBid) external payable {
        require(bidCount < MAX_BIDS, "max count reached");
        require(msg.value >= 0.1 ether, "security deposit required");
        sealedBid[msg.sender] = _sealedBid;
        bids.push(_sealedBid);
        bidCount += 1;
    }

    function revealBids(bytes32[] calldata hashedBids, bytes32 lowestBidHash) external onlyAfter(tenderInfo.biddingDeadline) {
        require(msg.sender == evaluator, "Only evaluator");
        for (uint8 i = 0; i < bidCount; ++i) {
            require(bids[i] == hashedBids[i], "Invalid bid amount");
        }
        for (uint8 i = 0; i < bidderCount; ++i) {
            if (sealedBid[bidders[i]] == lowestBidHash) {
                winningBidder = bidders[i];
            }
        }
    }

    function refundDeposits() external {
        require(winningBidder != address(0), "Winner not selected");
        for (uint8 i = 0; i < bidderCount; ++i) {
            if (bidders[i] != winningBidder) {
                payable(bidders[i]).transfer(DEPOSIT_AMOUNT);
            }
        }
    }

    function isTenderOpen() public view returns (bool) {
        return block.timestamp < tenderInfo.biddingDeadline;
    }

    function isTenderSettled() public view returns (bool) {
        return winningBidder != address(0);
    }

    function winningBidderName() public view onlyAfter(tenderInfo.biddingDeadline) returns (string memory) {
        return bidderName[winningBidder];
    }
}
