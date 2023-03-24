const express = require('express');
const cors = require('cors');
const snarkjs = require('snarkjs');
const app = express();
app.use(cors());

console.log("API endpoint is ready");

app.get('/generate', async function (req, res) {
    try {
        const inputs = JSON.parse(req?.query?.inputs);
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            inputs, 
            "circuit.wasm", 
            "circuit_0001.zkey"
        );
        return res.send(JSON.stringify([proof, publicSignals]));
    } catch(e) {
        console.log(e);
        return res.status(500);
    }
});

app.get('/calldata', async function (req, res) {
    try {
        const proof = JSON.parse(req?.query?.proof);
        const publicSignals = JSON.parse(req?.query?.publicSignals);
        const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
        return res.send(JSON.stringify(calldata));
    } catch(e) {
        console.log(e);
        return res.status(500);
    }
});

app.listen(process.env.PORT || 8080);