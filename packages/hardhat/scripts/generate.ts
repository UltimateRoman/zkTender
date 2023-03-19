const snarkjs = require("snarkjs");

export const generateProof = async (inputs: any) => {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs, 
        "./circuits/build/circuit_js/circuit.wasm", 
        "./circuits/build/circuit_js/circuit_0001.zkey"
    );
    const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
    return [JSON.stringify(proof, null, 1), publicSignals, calldata];
};