#!/bin/bash

cd circuits
mkdir -p build

echo "Compiling: circuit..."

# compile circuit
circom circuit.circom --r1cs --wasm --sym -o build

cd build/circuit_js
echo '{
    "sealedBids": ["14829661078755452231420445082416535460451393402374125723096801939703538813624", 
    "18492744225100146689686516206566825915834837132961559311973652074722466053781", 
    "2243820949055196761166884933669249247950111863991145656119364250341089250289", 
    "3087912"],
    "bids": [["10", "276493910927104206225793465378762856788547525410735445355386653182898671962"], 
    ["15", "145153374249673047216413803798375737926277454578172975255049250085490173295"], 
    ["22", "352275327439015942835713349749961149172466588155936243892021288726228976124"],
    ["2", "312"]]
}' > input.json

echo "Generating: witness..."
node generate_witness.js circuit.wasm input.json witness.wtns

snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v -e="random text"
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
snarkjs groth16 setup ../circuit.r1cs pot12_final.ptau circuit_0000.zkey
snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name="1st Contributor Name" -v -e="random text"
snarkjs zkey export verificationkey circuit_0001.zkey verification_key.json

echo "Generating: proof..."
snarkjs groth16 prove circuit_0001.zkey witness.wtns proof.json public.json
echo "Verifying: proof..."
snarkjs groth16 verify verification_key.json public.json proof.json
snarkjs zkey export solidityverifier circuit_0001.zkey ../../../contracts/Verifier.sol