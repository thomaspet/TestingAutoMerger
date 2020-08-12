import {Component, Input} from '@angular/core';
import {GrantAccessData} from './grant-access-modal';
import {JobServerMassInviteInput, JobService, ErrorService} from '@app/services/services';
import {Observable} from 'rxjs';

@Component({
    selector: 'execute-for-bulk-access',
    templateUrl: './5.execute.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class ExecuteForBulkAccess {
    @Input() data: GrantAccessData;

    hangfireId: number;
    messages: string[];

    hasCompletedJob: boolean;

    constructor(
        private jobService: JobService,
        private errorService: ErrorService,
    ) {}

    sendInvites() {
        if (!this.hasCompletedJob) {
            const massInvite = <JobServerMassInviteInput>{};
            massInvite.Contract = this.data.contract;
            massInvite.CompanyLicenses = this.data.companies;
            massInvite.UserLicenses = this.data.users;
            massInvite.Products = this.data.products;
            massInvite.IsSelfInvite = this.data.AddAdministratorRole;

            this.jobService.startJob('MassInviteBureau', 0, massInvite).subscribe(
                res => {
                    this.hasCompletedJob = true;
                    this.hangfireId = res;
                    this.refreshLog();
                },
                err => this.errorService.handle(err)
            );
        }
    }

    refreshLog() {
        this.jobService.getJobRunUntilNull('MassInviteBureau', this.hangfireId)
            .switchMap(logs => {
                return logs.Exception
                    ? Observable.throw(logs.Exception)
                    : Observable.of(logs);
            })
            .subscribe(
                logs => this.messages = logs.Progress.map(p => p.Progress).reverse(),
                err => this.errorService.handle(err),
            );
    }
}
