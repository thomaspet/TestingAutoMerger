import {Component, Input, Output, EventEmitter, HostBinding} from '@angular/core';
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

    @HostBinding('class') get hostClass() {
        if (this.status) {
            return this.status.class || this.status.state;
        }
    }

    STATES = STATUSTRACK_STATES;
    isActive: boolean;
    hasDetailsSection: boolean;
    classString: string;

    hasSubStatuses: boolean;
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
        this.showStatusHistory = (this.singleStatus || this.isActive) && !!this.entityType && !!this.entityID;

        const classes = [];
        if (this.status && (this.status.class || this.status.state)) {
            classes.push(this.status.class || this.status.state);
        }

        if (this.hasSubStatuses) {
            classes.push('has-substatus');
        }

        if (this.singleStatus) {
            classes.push('single-status');
        }

        this.classString = classes.join(' ');
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
