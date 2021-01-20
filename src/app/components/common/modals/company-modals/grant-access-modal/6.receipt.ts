import {Component, Input} from '@angular/core';
import {JobService} from '@app/services/admin/jobs/jobService';
import {ErrorService} from '@app/services/common/errorService';
import {of, throwError} from 'rxjs';
import {switchMap} from 'rxjs/operators';

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

        this.jobService.getJobRunUntilNull('MassInviteBureau', this.hangfireID).pipe(
            switchMap(log => log.Exception ? throwError(log.Exception) : of(log))
        ).subscribe(
            log => {
                this.messages = log.Progress.map(p => p.Progress).reverse();
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
