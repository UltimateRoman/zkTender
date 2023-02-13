//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./Tender.sol";

contract TenderManager {
    address public evaluator;
    address public baseImplementation;
    address public verifier;
    address[] public tenders;

    constructor(address _evaluator, address _verifier) {
        evaluator = _evaluator;
        verifier = _verifier;
        baseImplementation = address(new Tender());
    }

    event CreatedNewTender(address proxy, address beneficiary);

    function createNewTender(Tender.TenderInfo calldata tenderInfo) external {
        address proxy = Clones.clone(baseImplementation);
        Tender(proxy).initialize(tenderInfo, msg.sender, evaluator);
        tenders.push(proxy);
        emit CreatedNewTender(proxy, msg.sender);
    }

    function getAllTenders() public view returns (address[] memory) {
        return tenders;
    }
}