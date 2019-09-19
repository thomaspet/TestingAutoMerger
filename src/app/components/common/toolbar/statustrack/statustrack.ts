import {Component, Input, Output, EventEmitter} from '@angular/core';
import {StatusService} from '@app/services/services';
import * as moment from 'moment';

export enum STATUSTRACK_STATES {
    Completed, // Past
    Active,    // Present
    Future,    // Potential
    Obsolete,  // The data has changed since
}

export interface IStatus {
    title: string;
    subtitle?: string;
    state: STATUSTRACK_STATES;
    code?: number;
    timestamp?: Date;
    substatusList?: IStatus[];
    data?: any;
    logEntries?: any[];
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

    constructor(private statusService: StatusService) {}

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

    loadStatusHistory(status: IStatus) {
        if (this.entityType && this.entityID && !status.logEntries) {
            this.statusService.getStatusLogEntries(
                this.entityType, this.entityID
            ).subscribe(statuschanges => {
                status.logEntries = statuschanges;
            });
        }
    }

    formatTime(datetime, formatDateTime?: string) {
        if (!datetime) { return; }
        return moment(datetime).format(formatDateTime ? formatDateTime : 'lll');
    }
}
