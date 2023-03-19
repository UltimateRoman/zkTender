const snarkjs = require("snarkjs");

export const getAddressSum = (address: string) => {
    let s = 0;
    for (let i = 0; i < address.length; i++) {
        const c = address.charAt(i);
        if (c >= '0' && c <= '9') {
            s += parseInt(c);
        }
    }
    return s;
};

export const generateProof = async (inputs: any) => {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs, 
        "./circuit.wasm", 
        "./circuit_0001.zkey"
    );
    const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
    return [JSON.stringify(proof, null, 1), publicSignals, calldata];
};