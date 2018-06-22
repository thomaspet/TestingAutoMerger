// angular
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';

// app
import {environment} from 'src/environments/environment';
import {UniHttp} from '../../../../framework/core/http/http';

// model
import {Job} from '../../../models/admin/jobs/job';
import {Trigger} from '../../../models/admin/jobs/trigger';
import {ElsaContract, ElsaCompanyLicense, ElsaUserLicense, ElsaProduct} from '@app/services/elsa/elsaModels';

export interface JobLogProgress {
    ID: number;
    JobRunID: number;
    JobRun?: any;
    Progress: string;
    Created: Date;
}

export interface JobLog {
    ID: number;
    HangfireJobId: string;
    Created: Date;
    Input: string;
    Output: string;
    Exception?: any;
    JobName: string;
    Progress: JobLogProgress[];
    JobRunLogs: any[];
}

@Injectable()
export class JobService {
    constructor(private uniHttp: UniHttp) {

    }

    // job runs
    public getLatestJobRuns(num: number): Observable<any> {
        return this.uniHttp.asGET()
            .sendToUrl(environment.UNI_JOB_SERVER_URL + 'jobruns/latest?num=' + num);
    }

    public getJobRun(jobName: string, hangfireJobId: number, loglimit: number = 50): Observable<JobLog> {
        return this.uniHttp.asGET()
            .sendToUrl(environment.UNI_JOB_SERVER_URL + 'jobruns?job=' + jobName + '&run=' + hangfireJobId
                + '&loglimit=' + loglimit)
            .map(jobRun => {
                if (jobRun.Exception) {
                    throw new Error(jobRun.Exception);
                }
                return jobRun;
            });
    }

    public getJobRunUntilNull(jobName: string, hangfireJobId: number): Observable<JobLog> {
        let keepRequestingLogs = true;
        const TenSeconds = 10 * 1000;
        return Observable
            .interval(TenSeconds)
            .timeInterval()
            .switchMap(() => this.getJobRun(jobName, hangfireJobId, 9999))
            .takeWhile(() => keepRequestingLogs)
            .do(jobRun => keepRequestingLogs = jobRun.Progress.every(p => p.Progress !== null))
            .do(jobRun => jobRun.Progress = jobRun.Progress.filter(p => p.Progress !== null));
    }

    // jobs
    public getJobs(): Observable<any> {
        return this.uniHttp.asGET()
            .sendToUrl(environment.UNI_JOB_SERVER_URL + 'jobs');
    }

    public startJob(name: string, minutes?: number, body?): Observable<number> {
        let url: string = environment.UNI_JOB_SERVER_URL + 'jobs?job=' + name;

        if (minutes) {
            url += '&minutes=' + minutes;
        }

        return this.uniHttp.asPOST()
            .withBody(body)
            .sendToUrl(url)
            .map(jobIDString => +jobIDString);
    }

    // schedules
    public createSchedule(jobName: string, cronExp: string): Observable<any> {
        return this.uniHttp.asPOST()
            .sendToUrl(environment.UNI_JOB_SERVER_URL + 'job-schedules?job=' + jobName + '&cronExpression=' + cronExp);
    }

    public deleteSchedule(id: string): Observable<any> {
        return this.uniHttp.asDELETE()
            .sendToUrl(environment.UNI_JOB_SERVER_URL + 'job-schedules?scheduleId=' + id);
    }

    public getSchedules(jobName: string): Observable<any> {
        return this.uniHttp.asGET()
            .sendToUrl(environment.UNI_JOB_SERVER_URL + 'job-schedules?job=' + jobName);
    }

    public modifySchedule(jobName: string, id: string, cronExp: string): Observable<any> {
        return this.uniHttp.asPUT()
            .sendToUrl(environment.UNI_JOB_SERVER_URL
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



export interface JobServerMassInviteInput {
    Contract: ElsaContract;
    CompanyLicenses: ElsaCompanyLicense[];
    UserLicenses: ElsaUserLicense[];
    Products: ElsaProduct[];
}
