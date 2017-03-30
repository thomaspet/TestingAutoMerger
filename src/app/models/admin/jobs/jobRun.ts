import {JobProgress} from './jobProgress';
import {JobRunLog} from './jobRunLog';

export class JobRun {
    public ID: number;
    public HangfireJobId: string;
    public Progress: JobProgress[]; // List<JobProgress>
    public Created: string; // DateTimeOffset
    public JobRunLogs: JobRunLog[];
}