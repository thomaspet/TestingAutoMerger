// angular
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

// app
import {AppConfig} from '../../../AppConfig';
import {UniHttp} from '../../../../framework/core/http/http';

// model
import {Job} from '../../../models/admin/jobs/job';
import {Trigger} from '../../../models/admin/jobs/trigger';

@Injectable()
export class JobService {
    constructor(private uniHttp: UniHttp) {

    }

    // job runs
    public getLatestJobRuns(num: number): Observable<any> {
        return this.uniHttp.asGET()
            .sendToUrl(AppConfig.UNI_JOB_SERVER_URL + 'jobruns/latest?num=' + num);
    }

    public getJobRun(jobName: string, hangfireJobId: string): Observable<any> {
        return this.uniHttp.asGET()
            .sendToUrl(AppConfig.UNI_JOB_SERVER_URL + 'jobruns?job=' + jobName + '&run=' + hangfireJobId);
    }

    // jobs
    public getJobs(): Observable<any> {
        return this.uniHttp.asGET()
            .sendToUrl(AppConfig.UNI_JOB_SERVER_URL + 'jobs');
    }

    public startJob(name: string, minutes?: number): Observable<any> {
        let url: string = AppConfig.UNI_JOB_SERVER_URL + 'jobs?job=' + name;

        if (minutes) {
            url += '&minutes=' + minutes;
        }

        return this.uniHttp.asPOST()
            .withBody('')
            .sendToUrl(url);
    }

    // schedules
    public createSchedule(jobName: string, cronExp: string): Observable<any> {
        return this.uniHttp.asPOST()
            .sendToUrl(AppConfig.UNI_JOB_SERVER_URL + 'job-schedules?job=' + jobName + '&cronExpression=' + cronExp);
    }

    public deleteSchedule(id: string): Observable<any> {
        return this.uniHttp.asDELETE()
            .sendToUrl(AppConfig.UNI_JOB_SERVER_URL + 'job-schedules?scheduleId=' + id);
    }

    public getSchedules(jobName: string): Observable<any> {
        return this.uniHttp.asGET()
            .sendToUrl(AppConfig.UNI_JOB_SERVER_URL + 'job-schedules?job=' + jobName);
    }

    public modifySchedule(jobName: string, id: string, cronExp: string): Observable<any> {
        return this.uniHttp.asPUT()
            .sendToUrl(AppConfig.UNI_JOB_SERVER_URL
                + 'job-schedules?job=' + jobName + '&scheduleId=' + id  + '&cronExpression=' + cronExp);
    }

    ///
    public get(id: number): Observable<Job> {
        return null;
    }

    public create(job: Job, zipfile: Uint8Array) {

    }

    public delete(id: number) {

    }

    public modify(job: Job) {

    }

    // do we need this? (or upload to blob?)
    public upload(id: number, zipFile: Uint8Array) {

    }

    public schedule(id: number) {

    }

    public getHistory(id: number): Observable<Job> {
        return null;
    }

    public getLatest(num: number = 10): Observable<Array<Job>> {
        return null;
    }

    public getFailed(num: number = 10): Observable<Array<Job>> {
        return null;
    }

    public getQueued(num: number = 10): Observable<Array<Job>> {
        return null;
    }

    // triggers
    public getTriggers(jobId: number): Observable<Array<Trigger>> {
        return null;
    }

    public getTrigger(jobId: number): Observable<Trigger> {
        return null;
    }

    public createTrigger(jobId: number, trigger: Trigger) {

    }

    public modifyTrigger(jobId: number, trigger: Trigger) {

    }
}