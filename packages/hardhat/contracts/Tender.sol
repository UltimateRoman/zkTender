//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract Tender is Initializable {
    struct TenderInfo {
        uint256 biddingDeadline;
        string title;
        string description;
        string document;
        string creator;
    }

    bool isCancelled;
    address managerContract;
    mapping(address => uint256) bidValue;

    uint8 public constant MAX_BIDS = 4;
    uint256 public constant DEPOSIT_AMOUNT = 0.05 ether;

    bool public refundCompleted;
    uint256 public numberOfPenalizedBidders;
    uint256 public winningBid;
    address public owner;
    address public evaluator;
    address public winningBidder;
    bytes32[] public bids;
    address[] public bidders;
    mapping(address => bytes32) public sealedBid;
    mapping(address => bool) public isPenalized;
    string public proofCID;

    TenderInfo public tenderInfo;

    modifier onlyBefore(uint time) {
        require(block.timestamp < time, "late");
        _;
    }

    modifier onlyAfter(uint time) {
        require(block.timestamp > time, "early");
        _;
    }

    constructor() {
        _disableInitializers();
    }

    function initialize(
        TenderInfo calldata _tenderInfo, 
        address _owner, 
        address _evaluator,
        address _managerContract
    )   
        initializer 
        external 
    {
        tenderInfo = _tenderInfo;
        owner = _owner;
        evaluator = _evaluator;
        managerContract = _managerContract;
    }

    function placeBid(bytes32 _sealedBid) external payable onlyBefore(tenderInfo.biddingDeadline) {
        require(bids.length < MAX_BIDS, "max count reached");
        require(msg.value >= DEPOSIT_AMOUNT, "security deposit required");
        require(sealedBid[msg.sender] == 0, "already placed bid");
        sealedBid[msg.sender] = _sealedBid;
        bids.push(_sealedBid);
        bidders.push(msg.sender);
    }

    function revealBid(uint256 _value) external onlyAfter(tenderInfo.biddingDeadline) {
        require(bidValue[msg.sender] == 0, "already revealed bid");
        require(_value > 0, "bid amount cannot be 0");
        bidValue[msg.sender] = _value;
    }

    function verifyBids(address[] calldata penalizedBidders) 
        external 
        onlyAfter(tenderInfo.biddingDeadline)
    {
        require(msg.sender == evaluator, "only evaluator");
        require(bidRevealCompleted() == true, "bid reveal incomplete");
        require(winningBidder == address(0), "winner already selected");
        numberOfPenalizedBidders = penalizedBidders.length;
        address[] memory eligibleBidders = new address[](bidders.length - penalizedBidders.length);
        for (uint8 i = 0; i < penalizedBidders.length; ++i) {
            isPenalized[penalizedBidders[i]] = true;
        }
        if (penalizedBidders.length == bidders.length) {
            isCancelled = true;
        } else {
            uint8 j = 0;
            for (uint8 i = 0; i < bidders.length; ++i) {
                if (!isPenalized[bidders[i]]) {
                    eligibleBidders[j] = bidders[i];
                    ++j;
                }
            }
            winningBid = bidValue[eligibleBidders[0]];
            winningBidder = eligibleBidders[0];
            for (uint8 i = 0; i < eligibleBidders.length; ++i) {
                if (bidValue[eligibleBidders[i]] < winningBid) {
                    winningBid = bidValue[eligibleBidders[i]];
                    winningBidder = eligibleBidders[i];
                }
            }
        }
    }

    function refundDeposits() external {
        require(refundCompleted == false, "refund already completed");
        require(winningBidder != address(0), "winner not selected");
        for (uint8 i = 0; i < bidders.length; ++i) {
            if (bidders[i] != winningBidder && !isPenalized[bidders[i]]) {
                payable(bidders[i]).transfer(DEPOSIT_AMOUNT);
            }
        }
        refundCompleted = true;
    }

    function setEvaluator(address _evaluator) external {
        require(msg.sender == owner, "only owner");
        evaluator = _evaluator;
    }

    function setProof(string memory _proofCID) external {
        require(msg.sender == evaluator, "only evaluator");
        proofCID = _proofCID;
    }

    function getAllBidders() public view returns (address[] memory) {
        return bidders;
    }

    function getAllSealedBids() public view returns (bytes32[] memory) {
        return bids;
    }

    function currentStage() public view returns (uint8) {
        if (isCancelled) {
            return 3;
        } else if (block.timestamp < tenderInfo.biddingDeadline) {
            return 0;
        } else {
            if (winningBidder == address(0)) {
                return 1;
            } else {
                return 2;
            }
        }
    }

    function bidRevealCompleted() public view returns (bool) {
        for (uint i=0; i < bidders.length; ++i) {
            if (bidValue[bidders[i]] == 0) {
                return false;
            }
        }
        return true;
    }

    function getBidValues() public view returns (uint256[] memory) {
        require(msg.sender == evaluator, "only evaluator");
        require(bidRevealCompleted() == true, "bid reveal incomplete");
        uint256[] memory bidValueArray = new uint256[](bids.length);
        for (uint i=0; i < bidders.length; ++i) {
            bidValueArray[i] = bidValue[bidders[i]];
        }
        return bidValueArray;
    }

    function isWinnerSelected() public view returns (bool) {
        return winningBidder != address(0);
    }

    function winningBidderUsername() public view returns (string memory) {
        (, bytes memory data) = managerContract.staticcall(abi.encodeWithSignature("getUsername(address)", winningBidder));
        return abi.decode(data, (string));
    }

    function bidderUsernames() public view returns (string[] memory) {
        (, bytes memory data) = managerContract.staticcall(abi.encodeWithSignature("getUsernames(address[])", bidders));
        return abi.decode(data, (string[]));
    }
}
