import {Schedule} from './schedule';

export class Job {
    public ID: number;
    public Name: string;
    // @TODO: check if needed on frontend
    public FileStorageRef: string;
    public IsStandard: boolean;
    public IsPublic: boolean;
    public IsEnabled: boolean;
    public Schedules: Schedule[];
}