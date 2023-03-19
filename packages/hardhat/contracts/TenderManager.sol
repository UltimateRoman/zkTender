//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./Tender.sol";

contract TenderManager is Ownable {
    struct TenderBaseInfo {
        address tender;
        string title;
        string creator;
    }

    TenderBaseInfo[] tenders;
    mapping(address => string) usernameOf;

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
        require(
            keccak256(abi.encodePacked(usernameOf[msg.sender])) == keccak256(abi.encodePacked("")), 
            "Already registered"
        );
        usernameOf[msg.sender] = username;
        emit RegisteredUser(msg.sender, username);
    }

    function createNewTender(Tender.TenderInfo calldata tenderInfo) external {
        require(
            keccak256(abi.encodePacked(usernameOf[msg.sender])) != keccak256(abi.encodePacked("")), 
            "Not registered"
        );
        address proxy = Clones.clone(baseImplementation);
        Tender(proxy).initialize(tenderInfo, msg.sender, evaluator, address(this));
        tenders.push(TenderBaseInfo(proxy, tenderInfo.title, usernameOf[msg.sender]));
        emit CreatedNewTender(proxy, msg.sender);
    }

    function getAllTenders() public view returns (TenderBaseInfo[] memory) {
        return tenders;
    }

    function getUsername(address user) public view returns (string memory) {
        return usernameOf[user];
    }

    function getUsernames(address[] calldata users) public view returns (string[] memory) {
        string[] memory usernames = new string[](users.length);
        for (uint8 i = 0; i < users.length; ++i) {
            usernames[i] = usernameOf[users[i]];
        }
        return usernames;
    }
}