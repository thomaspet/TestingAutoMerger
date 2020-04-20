import * as utils from '../../common/utils/utils';

export interface IPageState {
    projectID?: string;
    month?: string;
    year?: string;
}

export interface IQueryData {
    yr: number;
    md: number;
    tsum: number;
    title: string;
}

export interface IReport {
    title: string;
    sum: number;
    columns: Array<string>;
    rows: Array<IReportRow>;
}

export interface IReportRow {
    title: string;
    sum: number;
    prc: number;
    items: Array<{tsum: number}>;
}

export class ReportRow implements IReportRow {
    title: string;
    sum: number;
    prc: number;
    items: Array<{tsum: number}>;
    constructor(title: string) {
        this.title = title;
        this.items = utils.createRow(12, () => ({ tsum: 0 }));
        this.sum = 0;
        this.prc = 0;
    }
}

export class HourReportInput {
    data: IQueryData;
    groupBy: { name: string, label: string };
    odataFilter: string;
}
