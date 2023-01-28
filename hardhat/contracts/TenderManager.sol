//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./Tender.sol";

contract TenderManager {

    address baseImplementation;
    address[] public tenders;

    constructor() {
        baseImplementation = address(new Tender());
    }

    function createNewTender(Tender.TenderInfo calldata tenderInfo) external {
        address instance = Clones.clone(baseImplementation);
        Tender(instance).initialize(tenderInfo, msg.sender);
        tenders.push(instance);
    }
}