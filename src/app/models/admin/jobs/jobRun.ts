import {JobProgress} from './jobProgress';

export class JobRun {
    public ID: number;
    public HangfireJobId: string;
    public Progress: JobProgress[]; // List<JobProgress>
    public Created: string; // DateTimeOffset
}