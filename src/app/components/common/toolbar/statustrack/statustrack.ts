import {Component, Input, Output, EventEmitter} from '@angular/core';
import {StatusService, ErrorService} from '@app/services/services';
import * as moment from 'moment';

export enum STATUSTRACK_STATES {
    Completed, // Past
    Active,    // Present
    Future,    // Potential
    Obsolete,  // The data has changed since
}

export interface IStatus {
    title: string;
    class?: string;
    subtitle?: string;
    state: STATUSTRACK_STATES;
    code?: number;
    timestamp?: Date;
    substatusList?: IStatus[];
    data?: any;
    formatDateTime?: string;
    selectable?: boolean;
}

@Component({
    selector: 'uni-statustrack',
    templateUrl: './statustrack.html',
    styleUrls: ['./statustrack.sass'],
})
export class StatusTrack {
    @Input() config: IStatus[];
    @Input() entityType: string;
    @Input() entityID: number;

    @Output() statusSelectEvent = new EventEmitter();

    activeStatus: IStatus;

    statusHistoryLoaded: boolean;
    statusHistory: any[];

    constructor(
        private statusService: StatusService,
        private errorService: ErrorService
    ) {}

    ngOnChanges() {
        if (this.config && this.config.length) {
            this.activeStatus = this.config.find(status => status.state === STATUSTRACK_STATES.Active);
            if (!this.activeStatus) {
                this.activeStatus = this.config.find(status => status.state === STATUSTRACK_STATES.Obsolete);
            }
        }
    }

    isActiveSubStatus(status: IStatus) {
        return status.state === STATUSTRACK_STATES.Active;
    }

    onSubStatusClick(substatus, parent) {
        this.statusSelectEvent.emit([substatus, parent]);
    }

    loadStatusHistory() {
        if (this.entityType && this.entityID && !this.statusHistoryLoaded) {
            this.statusService.getStatusLogEntries(
                this.entityType, this.entityID
            ).subscribe(
                statuschanges => {
                    this.statusHistoryLoaded = true;
                    this.statusHistory = statuschanges;
                },
                err => this.errorService.handle(err)
            );
        }
    }

    formatTime(datetime, formatDateTime?: string) {
        if (!datetime) { return; }
        return moment(datetime).format(formatDateTime ? formatDateTime : 'lll');
    }
}
