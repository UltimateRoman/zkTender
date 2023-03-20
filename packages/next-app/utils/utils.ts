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
