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
    badge?: string;
    timestamp?: Date;
    substatusList?: IStatus[];
    data?: any;
    logEntries?: any[];
    forceSubstatus?: boolean;
    formatDateTime?: string;
}

@Component({
    selector: 'uni-statustrack',
    templateUrl: './statustrack.html',
    styleUrls: ['./statustrack.sass']
})
export class StatusTrack {
    @Input() public config: IStatus[];
    @Input() private entityType: string;
    @Input() private entityID: number;

    @Output() public statusSelectEvent: EventEmitter<any> = new EventEmitter();

    activeStatus: IStatus;

    constructor(private statusService: StatusService) {}

    ngOnChanges() {
        if (this.config && this.config.length) {
            this.activeStatus = this.config.find(status => status.state === STATUSTRACK_STATES.Active);
        }
    }

    public getStatusClass(state: STATUSTRACK_STATES) {
        return (STATUSTRACK_STATES[state] || 'future').toLowerCase();
    }

    public isActiveSubStatus(status: IStatus) {
        return status.state === STATUSTRACK_STATES.Active;
    }

    public selectStatus(status: IStatus, parent?: IStatus) {
        this.statusSelectEvent.emit([status, parent]);
        if (this.entityType && this.entityID) {
            if (status.code) {
                // if statuslog is already loaded and the user clicks the same status again, close
                // the statuslog instead of retrieving it again
                if (!status.logEntries) {
                    this.statusService.getStatusLogEntries(this.entityType, this.entityID, status.code)
                        .subscribe(statuschanges => {
                            status.logEntries = statuschanges;
                        });
                } else {
                    status.logEntries = null;
                }
            }
        }
    }
    public formatTime(datetime, formatDateTime?: string) {
        if (!datetime) { return; }
        return moment(datetime).format(formatDateTime ? formatDateTime : 'lll');
    }
}
