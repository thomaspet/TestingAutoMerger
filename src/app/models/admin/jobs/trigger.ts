import {JobTrigger} from './jobTrigger';

export enum JobMode {
    FireAndForget,
    Delayed,
    Recurring,
    Batch
}

export class Trigger {
    public ID: number;
    public ActionId: string;
    public ClusterId: string;
    public ObjectiveId: string;
    public CompanyKey: string
    public CronExpression: string;
    public JobMode: JobMode;
    public JobTriggers: JobTrigger[]; // List<JobTrigger>
    public Disabled: boolean;
}