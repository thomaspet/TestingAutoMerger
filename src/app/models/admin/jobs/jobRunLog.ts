import {JobRun} from './jobRun';

export enum LogType {
        Info = 10,
        Warning = 20,
        Error = 30,
}

export class JobRunLog {
        public ID: number;
        public JobRunID: number;
        public Msg: string;
        public LogType: LogType;
        public JobRun: JobRun;
        public Created: string;
}