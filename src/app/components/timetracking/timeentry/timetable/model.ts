import * as moment from 'moment';

export enum ReportFlow {
    NotSet = 0,
    Draft = 1,
    PartialAssign = 4,
    AwaitingApproval = 5,
    PartialReject = 7,
    PartialApproval = 8,
    Rejected = 9,
    Approved = 10    
}

export enum StatusCode {
    Draft = 60001,
    AwaitingApproval = 60005,
    Declined = 60009,
    Approved = 60010,
    PartlyPaid = 60020,
    Paid = 60021
}

// tslint:disable:variable-name
// tslint:disable:member-access

export class Month {
    public Date: Date;
    public Name: string;
    public Weeks: Array<Week> = [];
    public Sums: Sums = new Sums();
    constructor(date: Date) {
        this.Date = date;
        this.Name = moment(date).format('MMMM').toLocaleUpperCase();
    }
    public isInMonth(week: Week): boolean {
        var weekMonth = moment(week.Items[2].Date).toDate().getMonth();
        var curMonth = moment(this.Date).toDate().getMonth();
        return (weekMonth === curMonth);
    }
}


export class Week {
    public WeekNumber: number = 0;
    public FirstDay: Date;
    public Items: Array<IWorkDay> = [];
    public Sums: Sums = new Sums();
    public isBusy: boolean = false;
    public get LastDay(): Date {
        if (this.Items && this.Items.length > 0) {
            return this.Items[this.Items.length - 1].Date;
        }
    }
    constructor(weekNumber?: number, date?: Date) {
        this.WeekNumber = weekNumber || this.WeekNumber;
        this.FirstDay = date || this.FirstDay;
    }

    public addMissingDays() {
        if (this.Items && this.Items.length < 7) {
            let start = this.Items.length;             
            for (let ii = start; ii < 7; ii++) { 
                let endDate = moment(this.FirstDay).add(ii, 'days').toDate();
                this.Items.push( { TotalTime: 0, IsWeekend: ii >= 5, Date: endDate } );
            }            
        }        
    }
}

export class Sums {
    public Name: string;
    public TotalTime: number = 0;
    public ValidTime: number = 0;
    public ExpectedTime: number = 0;
    public TimeOff: number = 0;
    public SickTime: number = 0;
    public Overtime: number = 0;
    public Flextime: number = 0;
    public Invoicable: number = 0;
    public Projecttime: number = 0;
    public Status: number = 0;    
    public Workflow: ReportFlow = ReportFlow.NotSet;
    public ProjectPrc?: number;
    public InvoicePrc?: number;    
    public combineFlow(flow: ReportFlow) {
        if (!flow) { return; }
        if (!this.TotalTime) { return; }
        this.Workflow = this.calcFlow(flow);
    }
    private calcFlow(flow: ReportFlow): ReportFlow {        
        if (this.Workflow === ReportFlow.NotSet || this.Workflow === flow) {
            return flow;
        } else {
            if (this.Workflow < ReportFlow.PartialReject) {
                return ReportFlow.PartialAssign;
            }
            if (this.Workflow === ReportFlow.PartialReject || this.Workflow === ReportFlow.Rejected) {
                return ReportFlow.PartialReject;
            }
            return ReportFlow.PartialApproval;
        }
    }
}

export interface IWorkDay {
    Date: Date;
    TotalTime: number;
    IsWeekend: boolean;
    ExpectedTime?: number;
    ValidTime?: number;
    TimeOff?: number;
    SickTime?: number;
    Overtime?: number;
    Flextime?: number;
    Invoicable?: number;
    Projecttime?: number;
    Status?: number;
    Workflow?: ReportFlow;
}

export interface IReport {
    Relation;
    FromDate: Date;
    ToDate: Date;
    Items: Array<any>;
    Workflow;
    Weeks?: Array<Week>;
    Months?: Array<Month>;
}
