import {Component, Input, Output, EventEmitter} from '@angular/core';

export enum STATUSTRACK_STATES {
    Completed = 'completed', // Past
    Active = 'active',    // Present
    Future = 'future',    // Potential
    Obsolete = 'obsolete',  // The data has changed since
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
    @Input() showFullStatustrack: boolean;

    @Output() statusSelectEvent = new EventEmitter();

    STATES = STATUSTRACK_STATES;
    activeStatus: IStatus;

    ngOnChanges() {
        if (this.config && this.config.length) {
            this.activeStatus = this.config.find(status => status.state === STATUSTRACK_STATES.Active);
            if (!this.activeStatus) {
                this.activeStatus = this.config.find(status => status.state === STATUSTRACK_STATES.Obsolete);
            }
        }
    }
}
