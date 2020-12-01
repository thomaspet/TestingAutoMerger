import {Injectable} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http';
import {map, catchError} from 'rxjs/operators';
import {of, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

export interface JobTicketResponse {
    Jobid: string;
    CompanyName: string;
    Status: string;
}

@Injectable()
export class JobTicketService {

    constructor(
        private uniHttp: UniHttp,
        private http: HttpClient,
    ) { }

    getJobTicketCompany(): Observable<JobTicketResponse[]> {
        return this.http.get<JobTicketResponse[]>('/api/jobticket/jobticket-company');
    }
}
