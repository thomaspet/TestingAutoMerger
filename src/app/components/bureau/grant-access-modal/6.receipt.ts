import {Component, Output, EventEmitter, Input} from '@angular/core';
import {GrantAccessData} from '@app/components/bureau/grant-access-modal/grant-access-modal';
import {JobServerMassInviteInput, JobService} from '@app/services/admin/jobs/jobService';
import {ErrorService} from '@app/services/common/errorService';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'receipt-for-bulk-access',
    templateUrl: './6.receipt.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class ReceiptForBulkAccess {
    @Input() hangfireID: number;

    messages: string[];

    constructor(
        private jobService: JobService,
        private errorService: ErrorService,
    ) {}

    ngAfterViewInit() {
        this.jobService.getJobRunUntilNull('MassInviteBureau', this.hangfireID)
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
