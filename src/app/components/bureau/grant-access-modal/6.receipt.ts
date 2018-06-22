import {Component, Output, EventEmitter, Input} from '@angular/core';
import {GrantAccessData} from '@app/components/bureau/grant-access-modal/grant-access-modal';
import {JobServerMassInviteInput, JobService} from '@app/services/admin/jobs/jobService';
import {ErrorService} from '@app/services/common/errorService';

@Component({
    selector: 'receipt-for-bulk-access',
    templateUrl: './6.receipt.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class ReceiptForBulkAccess {
    @Output()
    public next: EventEmitter<void> = new EventEmitter<void>();
    @Input()
    data: GrantAccessData;

    hangfireId: number;
    messages: string[];

    constructor(
        private jobService: JobService,
        private errorService: ErrorService,
    ) {}

    ngAfterViewInit() {
        console.log("ngOnInit is started")
        const massInvite = <JobServerMassInviteInput>{};
        massInvite.Contract = this.data.contract;
        massInvite.CompanyLicenses = this.data.companies;
        massInvite.UserLicenses = this.data.users;
        massInvite.Products = this.data.products;

        this.jobService.startJob('MassInviteBureau', 0, massInvite)
            .do(hangfireID => this.hangfireId = hangfireID)
            .subscribe(
                () => this.refreshLog(),
                err => this.errorService.handle(err),
            );
    }

    refreshLog() {
        this.jobService.getJobRunUntilNull('MassInviteBureau', this.hangfireId)
            .map(logs => {
                if (logs.Exception) {
                    throw new Error(logs.Exception);
                }
                return logs;
            })
            .subscribe(
                logs => this.messages = logs.Progress.map(p => p.Progress).reverse(),
                err => this.errorService.handle(err),
            );
    }
}
