//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./Tender.sol";

contract TenderManager is Ownable {
    struct TenderBaseInfo {
        string title;
        address tender;
    }

    TenderBaseInfo[] tenders;
    mapping(address => string) usernames;

    address public evaluator;
    address public verifier;
    address public baseImplementation;

    constructor(address _evaluator, address _verifier) {
        evaluator = _evaluator;
        verifier = _verifier;
        baseImplementation = address(new Tender());
    }

    event RegisteredUser(address user, string username);
    event CreatedNewTender(address proxy, address beneficiary);

    function setEvaluator(address _evaluator) external onlyOwner {
        evaluator = _evaluator;
    }

    function setVerifier(address _verifier) external onlyOwner {
        verifier = _verifier;
    }

    function registerUser(string calldata username) external {
        require(keccak256(abi.encodePacked(usernames[msg.sender])) == keccak256(abi.encodePacked("")), "Already registered");
        usernames[msg.sender] = username;
        emit RegisteredUser(msg.sender, username);
    }

    function createNewTender(Tender.TenderInfo calldata tenderInfo) external {
        address proxy = Clones.clone(baseImplementation);
        Tender(proxy).initialize(tenderInfo, msg.sender, evaluator, address(this));
        tenders.push(TenderBaseInfo(tenderInfo.title, proxy));
        emit CreatedNewTender(proxy, msg.sender);
    }

    function getAllTenders() public view returns (TenderBaseInfo[] memory) {
        return tenders;
    }

    function getUsername(address user) public view returns (string memory) {
        return usernames[user];
    }
}