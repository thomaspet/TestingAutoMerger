export class WidgetDatasetBuilder {
    PIE_COLORS = [ '#005AA4', '#0071CD', '#008ED2', '#7FC6E8', '#A1DFFF', '#CEEEFF', '#DFF1F9' ];

    // MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    //     'September', 'October', 'November', 'December'];
    // MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // QUARTERS = ['1. Kvartal', '2. Kvartal', '3. Kvartal', '4. Kvartal'];
    // QUARTERS_SHORT = ['Q1', 'Q2', 'Q3', 'Q4'];

    // Mainly used for bar- line- and point-charts..
    public buildSingleColorDataset(data: any, index: number, config: any) {
        let myData = [];

        for (let i = 0; i < data.length; i++) {
            if (data[i][config.dataKey[index]] === null) {
                myData.push(0);
            } else {
                myData.push(data[i][config.dataKey[index]] * config.multiplyValue);
            }
        }

        return {
            data: myData,
            backgroundColor: (config.backgroundColors || [])[index] || 'transparent',
            label: config.title[index],
            borderColor: config.colors[index]
        };
    }

    public buildPieDataset(data: any[], config) {
        const labels = [];
        const dataset = [];

        let rest = [];

        let sorted = data.sort((a, b) => {
            return (a[config.valueKey] <= b[config.valueKey]) ? 1 : -1;
        });

        sorted = sorted.filter(x => x[config.valueKey] > 0);

        if (sorted.length > config.maxNumberOfLabels) {
            rest = sorted.splice(config.maxNumberOfLabels - 1);
        }

        sorted.forEach((item) => {
            labels.push((item[config.labelKey] || '').slice(0, 40));
            dataset.push(item[config.valueKey]);
        });

        if (rest.length) {
            labels.push('Resterende');
            dataset.push(rest.reduce((sum, item) => {
                return sum + item[config.valueKey];
            }, 0));
        }

        return {
            dataset: [{
                data: dataset,
                backgroundColor: this.PIE_COLORS.slice(0, data.length),
                label: '',
            }],
            labels: labels
        };
    }

    // public getMonthsOutOfOrder(startIndex: number, amount: number) {
    //     if (startIndex > this.MONTHS.length) { return [] }
    //     let returnValue = [];
    //     for (let i = startIndex; i < amount; i++) {
    //         returnValue.push(this.MONTHS[i]);

    //         if (i >= this.MONTHS.length) { i = 0; }
    //     }
    //     return returnValue;
    // }

    // public getMonthsShortOutOfOrder(startIndex: number, amount: number) {
    //     if (startIndex > this.MONTHS_SHORT.length) { return [] }
    //     let returnValue = [];
    //     for (let i = startIndex; i < amount; i++) {
    //         returnValue.push(this.MONTHS_SHORT[i]);

    //         if (i >= this.MONTHS_SHORT.length) { i = 0; }
    //     }
    //     return returnValue;
    // }
}
