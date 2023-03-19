pragma circom 2.0.3;

include "../../../node_modules/circomlib/circuits/poseidon.circom";

template LowestBid(bidCount) {
    signal input sealedBids[bidCount];
    signal input bids[bidCount][2];

    signal output lowestBid[2];
    signal output bidsWithValidityStatus[bidCount];

    component hashes[bidCount];
    var lowestValue = bids[0][0];
    var lowestSealedBid = sealedBids[0];

    for (var i = 0; i < bidCount; i++) {
      hashes[i] = Poseidon(2);
      hashes[i].inputs[0] <== bids[i][0];
      hashes[i].inputs[1] <== bids[i][1];

      if (hashes[i].out == sealedBids[i]) {
        if (bids[i][0] < lowestValue) {
          lowestValue = bids[i][0];
          lowestSealedBid = sealedBids[i];
        }
      }

      bidsWithValidityStatus[i] <-- hashes[i].out == sealedBids[i];
    }

  lowestBid[0] <-- lowestValue;
  lowestBid[1] <-- lowestSealedBid;
}

component main { public [ sealedBids ] } = LowestBid(4);