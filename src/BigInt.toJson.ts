// Inspired by: https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-1006088574

interface BigInt {
    /** Convert to BigInt to string form in JSON.stringify */
    toJSON: () => string;
}

// The main reason is for Redux to serialize args.
BigInt.prototype.toJSON = function () {
    return this.toString();
};