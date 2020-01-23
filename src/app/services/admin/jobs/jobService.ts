import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import 'rxjs/add/observable/interval';

import {environment} from 'src/environments/environment';
import {UniHttp} from '../../../../framework/core/http/http';

import {JobRun} from '../../../models/admin/jobs/jobRun';
import {ElsaContract, ElsaCompanyLicense, ElsaProduct, ElsaUserLicense} from '@app/models';

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
    constructor(private uniHttp: UniHttp) {}

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
                if (jobRun && jobRun.Exception) {
                    throw new Error(jobRun.Exception);
                }
                return jobRun;
            });
    }

    public getJobRunWithOutput(jobName: string, hangfireJobId: number): Observable<JobLog> {
        return this.uniHttp.asGET()
            .sendToUrl(environment.UNI_JOB_SERVER_URL + 'jobrun/output?job=' + jobName + '&run=' + hangfireJobId)
            .map(jobRun => {
                if (jobRun && jobRun.Exception) {
                    throw new Error(jobRun.Exception);
                }
                return jobRun;
            });
    }

    public getJobRuns(jobName: string, loglimit: number = 50): Observable<Array<JobRun>> {
        return this.uniHttp.asGET()
            .sendToUrl(environment.UNI_JOB_SERVER_URL + 'jobruns/'+jobName  + '?loglimit=' + loglimit)
            .map(jobRun => {
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

}

export interface JobServerMassInviteInput {
    Contract: ElsaContract;
    CompanyLicenses: ElsaCompanyLicense[];
    UserLicenses: ElsaUserLicense[];
    Products: ElsaProduct[];
    IsSelfInvite?: boolean; // adds Administrator role in backend
}
