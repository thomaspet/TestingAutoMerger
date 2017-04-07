interface IWidgetDatasetBuilder {
    buildSingleColorDataset(data: any, index: number, config: any): any;
    buildWithDynamicLabels(data: any, config: any): any;
    getMonthsOutOfOrder(startIndex: number, amount: number): string[];
    getMonthsShortOutOfOrder(startIndex: number, amount: number): string[];
}

export enum ChartColorEnum {
    Blue = 0,
    Orange,
    Green,
    Red,
    Grey,
    Purple,
    Rust,
    Moss,
    White,
    Black
}

export class WidgetDatasetBuilder implements IWidgetDatasetBuilder {

    public BAR_CHART_COLORS = ['#7293cb', '#e1974c', '#84ba5b', '#d35e60', '#808585', '#9067a7', '#ab6857', '#ccc274', '#FFFFFF', '#000000'];
    public LINE_CHART_COLORS = ['#396bb1', '#da7c30', '#3e9651', '#cc2529', '#535154', '#6b4c9a', '#922428', '#948b3d', '#FFFFFF', '#000000'];
    public MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    public MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    public QUARTERS = ['1. Kvartal', '2. Kvartal', '3. Kvartal', '4. Kvartal'];
    public QUARTERS_SHORT = ['Q1', 'Q2', 'Q3', 'Q4'];

    //Mainly used for bar- line- and point-charts.. 
    public buildSingleColorDataset(data: any, index: number, config: any) {
        let chartColorArray = this.LINE_CHART_COLORS;
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
            backgroundColor: config.colors[index],
            label: config.title[index],
            borderColor: this.BAR_CHART_COLORS[ChartColorEnum.White],
        }
    }

    //Returns dataset AND labels for pie and doughnuts
    public buildWithDynamicLabels(data: any, config: any) {
        let myData = [];
        let myLabels = [];
        let myCounter = {};
        let use: boolean = true;

        //If number of labels is the value
        if (config.dataKey.length === 1) {
            data.forEach((item) => {
                use = config.useIf !== '' ? item[config.useIf] : true;
                if (item[config.dataKey[0]] !== null) {
                    if (myLabels.indexOf(item[config.dataKey[0]].toUpperCase()) === -1 && use) {
                        myLabels.push(item[config.dataKey[0]].toUpperCase());
                        myCounter[item[config.dataKey[0]].toUpperCase()] = 1;
                    } else if (use) {
                        myCounter[item[config.dataKey[0]].toUpperCase()]++;
                    }
                }
            })
        } else if (config.dataKey.length === 2) {
            data.forEach((item) => {
                use = config.useIf !== '' ? item[config.useIf] : true;
                if (item[config.dataKey[0]] !== null && item[config.dataKey[1]] !== null && item[config.dataKey[1]] !== 0) {
                    if (myLabels.indexOf(item[config.dataKey[0]].toUpperCase()) === -1 && use) {
                        myLabels.push(item[config.dataKey[0]].toUpperCase());
                        myCounter[item[config.dataKey[0]].toUpperCase()] = item[config.dataKey[1]];
                    } else if (use) {
                        myCounter[item[config.dataKey[0]].toUpperCase()] += item[config.dataKey[1]];
                    }
                }
            })
        }

        //No space for infinite amount of labels. If bigger then maxNumberOfLabels, find the most frequent, and sum the rest up as "OTHER"
        if (myLabels.length > config.maxNumberOfLabels) {
            //Get sorted list of keys, biggest to lowest
            let sorted = Object.keys(myCounter).sort((a, b) => { return myCounter[b] - myCounter[a] });
            let restTotal = 0;
            myLabels = [];

            for (var i = 0; i < sorted.length; i++) {
                if (i < config.maxNumberOfLabels) {
                    myData.push(myCounter[sorted[i]]);
                    myLabels.push(sorted[i]);
                } else {
                    restTotal += myCounter[sorted[i]];
                }
            }

            myLabels.push('RESTERENDE');
            myData.push(restTotal);
        } else {
            myLabels.forEach((key: string) => {
                myData.push(myCounter[key]);
            })
        }

        if (config.addDataValueToLabel) {
            for (var i = 0; i < myLabels.length; i++) {
                myLabels[i] = myLabels[i] + ' - ' + myData[i];
            }
        }

        return {
            dataset: {
                data: myData,
                backgroundColor: this.BAR_CHART_COLORS.slice(0, data.length),
                label: '',
                borderColor: this.LINE_CHART_COLORS[8]
            },
            labels: myLabels
        }
    }

    public getMonthsOutOfOrder(startIndex: number, amount: number) {
        if (startIndex > this.MONTHS.length) { return [] }
        let returnValue = [];
        for (let i = startIndex; i < amount; i++) {
            returnValue.push(this.MONTHS[i]);

            if (i >= this.MONTHS.length) { i = 0; }
        }
        return returnValue;
    }

    public getMonthsShortOutOfOrder(startIndex: number, amount: number) {
        if (startIndex > this.MONTHS_SHORT.length) { return [] }
        let returnValue = [];
        for (let i = startIndex; i < amount; i++) {
            returnValue.push(this.MONTHS_SHORT[i]);

            if (i >= this.MONTHS_SHORT.length) { i = 0; }
        }
        return returnValue;
    }

}