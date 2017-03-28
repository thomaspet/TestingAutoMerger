interface IWidgetDatasetBuilder {
    buildSingleColorDataset(data: any, borderColor: ChartColorEnum, color: string, label: string, key: string, chartType: string, multiplyValue?: number): any;
    buildMultiColorDataset(data: any, key: string, borderColor: ChartColorEnum): any;
    getBarChartColors(amount: number): string[];
    getLineChartColors(amount: number): string[];
    getMonths(): string[];
    getMonthsShort(): string[];
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
    public buildSingleColorDataset(data: any, borderColor: ChartColorEnum, color: string, label: string, key: string, chartType: string, multiplyValue: number = 1) {
        let chartColorArray = this.LINE_CHART_COLORS;
        let myData = [];
        if (chartType === 'bar') {
            chartColorArray = this.BAR_CHART_COLORS;
        }

        for (let i = 0; i < data.length; i++) {
            if (data[i][key] === null) {
                myData.push(0);
            } else {
                myData.push(data[i][key] * multiplyValue);
            }
        }

        return {
            data: myData,
            backgroundColor: color,
            label: label,
            borderColor: chartColorArray[borderColor]
        }
    }

    //Mainly used for pie- and doughnut-charts
    public buildMultiColorDataset(data: any, key: string, borderColor: ChartColorEnum) {
        let myData = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i][key] === null) {
                myData.push(0);
            } else {
                myData.push(data[i][key]);
            }
        }

        return {
            data: myData,
            backgroundColor: this.LINE_CHART_COLORS.slice(0, data.length),
            label: '',
            borderColor: this.LINE_CHART_COLORS[borderColor]
        }
    }

    public getBarChartColors(amount: number) {
        return this.BAR_CHART_COLORS.slice(0, amount);
    }

    public getLineChartColors(amount: number) {
        return this.LINE_CHART_COLORS.slice(0, amount);
    }

    public getMonths() {
        return this.MONTHS;
    }

    public getMonthsShort() {
        return this.MONTHS_SHORT;
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