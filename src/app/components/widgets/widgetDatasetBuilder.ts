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

export class WidgetDatasetBuilder {

    public BAR_CHART_COLORS = ['#7293cb', '#e1974c', '#84ba5b', '#d35e60', '#808585', '#9067a7', '#ab6857', '#ccc274', '#FFFFFF', '#000000'];
    public LINE_CHART_COLORS = ['#396bb1', '#da7c30', '#3e9651', '#cc2529', '#535154', '#6b4c9a', '#922428', '#948b3d', '#FFFFFF', '#000000'];
    public MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    public MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    public QUARTERS = ['1. Kvartal', '2. Kvartal', '3. Kvartal', '4. Kvartal'];
    public QUARTERS_SHORT = ['Q1', 'Q2', 'Q3', 'Q4'];

    //Mainly used for bar- line- and point-charts..
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
            backgroundColor: config.colors[index],
            label: config.title[index],
            borderColor: this.BAR_CHART_COLORS[ChartColorEnum.White],
        };
    }

    public buildPieDataset(data: any[], config: any) {
        let labels = [];
        let dataset = [];

        let rest = [];

        let sorted = data.sort((a, b) => {
            return (a[config.valueKey] <= b[config.valueKey]) ? 1 : -1;
        });

        sorted = sorted.filter(x => x[config.valueKey] > 0);

        if (sorted.length > config.maxNumberOfLabels) {
            rest = sorted.splice(config.maxNumberOfLabels - 1);
        }

        sorted.forEach((item) => {
            labels.push(item[config.labelKey] || '');
            dataset.push(item[config.valueKey]);
        });

        if (rest.length) {
            labels.push('RESTERENDE');
            dataset.push(rest.reduce((sum, item) => {
                return sum + item[config.valueKey];
            }, 0));
        }

        return {
            dataset: [{
                data: dataset,
                backgroundColor: this.BAR_CHART_COLORS.slice(0, data.length),
                label: '',
                borderColor: this.LINE_CHART_COLORS[8]
            }],
            labels: labels
        };
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