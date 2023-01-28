pragma circom 2.0.0;

template Main() {
    signal input x;
    signal input y;
    signal output out;

    out <== x * y;
}

component main {public [x]} = Main();