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
    id?: number;
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
    year: number;
    id?: number;
}

export class ReportRow implements IReportRow {
    id?: number;
    title: string;
    sum: number;
    prc: number;
    year: number;
    items: Array<{tsum: number}>;
    constructor(title: string, year: number, id?: number) {
        this.title = title;
        this.items = utils.createRow(12, () => ({ tsum: 0 }));
        this.sum = 0;
        this.prc = 0;
        this.id = id;
        this.year = year;
    }
}

export class HourReportInput {
    cell: IQueryData;
    row: IReportRow;
    groupBy: { name: string, label: string };
    odata: { query: string, filter: string };
    showDetails: boolean;
    details: [];
}
