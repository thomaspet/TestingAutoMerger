import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {UniHttp} from '../../../../framework/core/http/http';

// model
import {Job} from '../../../models/admin/jobs/job';
import {Trigger} from '../../../models/admin/jobs/trigger';

@Injectable()
export class JobService {
    constructor(private uniHttp: UniHttp) {

    }

    public getAll(): Observable<Array<Job>> {
        return null;
    }

    public get(id: number): Observable<Job> {
        return null;
    }

    public create(job: Job, zipfile: Uint8Array) {

    } 
    
    public delete(id: number) {

    }

    public modify(job: Job) {

    }

    public upload(id: number, zipFile: Uint8Array) {

    }

    public schedule(id: number) {
        
    }

    // history
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