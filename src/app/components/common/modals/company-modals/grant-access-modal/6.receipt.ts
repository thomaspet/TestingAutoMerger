import {Component, Output, EventEmitter, Input} from '@angular/core';
import {GrantAccessData} from './grant-access-modal';
import {JobServerMassInviteInput, JobService} from '@app/services/admin/jobs/jobService';
import {ErrorService} from '@app/services/common/errorService';
import {Observable} from 'rxjs';

@Component({
    selector: 'receipt-for-bulk-access',
    templateUrl: './6.receipt.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class ReceiptForBulkAccess {
    @Input() hangfireID: number;

    scrollContainer: HTMLElement;
    messages: string[] = [];

    constructor(
        private jobService: JobService,
        private errorService: ErrorService,
    ) {}

    ngAfterViewInit() {
        this.scrollContainer = document.getElementById('scrollContainer');

        this.jobService.getJobRunUntilNull('MassInviteBureau', this.hangfireID)
            .switchMap(logs => {
                return logs.Exception
                    ? Observable.throw(logs.Exception)
                    : Observable.of(logs);
            })
            .subscribe(logs => {
                this.messages = logs.Progress.map(p => p.Progress).reverse();
                this.scrollToBottom();
            },
                err => this.errorService.handle(err),
            );
    }

    scrollToBottom() {
        setTimeout(() => {
            try {
                this.scrollContainer.scrollTop = this.scrollContainer.scrollHeight;
            } catch (err) {
                console.error(err);
            }
        });
    }
}
