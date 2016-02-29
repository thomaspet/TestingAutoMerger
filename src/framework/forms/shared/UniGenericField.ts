declare var _;

export class UniGenericField {
    config;
    /**
     * It builds the string of classes after evaluate each class callback
     *
     * @returns {string}
     */
    buildClassString(): string {
        var classes = [];
        var cls = this.config.classes;
        for (var cl in cls) {
            if (cls.hasOwnProperty(cl)) {
                var value = undefined;
                if (_.isFunction(cls[cl])) {
                    value = cls[cl]();
                } else {
                    value = cls[cl];
                }
                if (value === true) {
                    classes.push(cl);
                }
            }
        }
        return classes.join(" ");
    }
}
