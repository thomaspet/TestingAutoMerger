import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IStatus, STATUSTRACK_STATES} from '../statustrack';
import * as moment from 'moment';
import {StatusService, ErrorService} from '@app/services/services';

@Component({
    selector: 'statustrack-status',
    templateUrl: './statustrack-status.html',
    styleUrls: ['./statustrack-status.sass']
})
export class StatustrackStatus {
    @Input() status: IStatus;
    @Input() singleStatus: boolean;
    @Input() entityType: string;
    @Input() entityID: number;
    @Output() subStatusClick = new EventEmitter();

    STATES = STATUSTRACK_STATES;
    isActive: boolean;
    hasDetailsSection: boolean;
    cssClasses: string[];

    hasSubStatuses: boolean;
    showSubStatusCounter: boolean;
    showStatusHistory: boolean;

    statusHistoryLoaded: boolean;
    statusHistory: any[];

    constructor(
        private statusService: StatusService,
        private errorService: ErrorService
    ) {}

    ngOnChanges(changes) {
        if (changes['status'] && this.status) {
            this.isActive = this.status.state === STATUSTRACK_STATES.Active;
        }

        this.hasSubStatuses = this.status.substatusList && this.status.substatusList.length > 0;
        this.showSubStatusCounter = this.hasSubStatuses && (this.singleStatus || this.isActive);
        this.showStatusHistory = (this.singleStatus || this.isActive) && !!this.entityType && !!this.entityID;
    }

    formatTime(datetime, formatDateTime?: string) {
        if (datetime) {
            return moment(datetime).format(formatDateTime ? formatDateTime : 'lll');
        }
    }

    loadStatusHistory() {
        if (this.entityType && this.entityID && !this.statusHistoryLoaded) {
            this.statusService.getStatusLogEntries(
                this.entityType, this.entityID
            ).subscribe(
                statuschanges => {
                    console.log(statuschanges);
                    this.statusHistoryLoaded = true;
                    this.statusHistory = statuschanges;
                },
                err => this.errorService.handle(err)
            );
        }
    }
}
