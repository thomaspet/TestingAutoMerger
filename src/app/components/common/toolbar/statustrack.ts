import {Component, Input, Output, EventEmitter} from '@angular/core';
import * as moment from 'moment';

export module UniStatusTrack {

    export enum States {
        Completed, // Past
        Active,    // Present
        Future,    // Potential
        Obsolete,  // The data has changed since
        Disabled   // Waiting for the right circumstances
    }

    export interface IStatus {
        title: string;
        state: States;
        badge?: string;
        timestamp?: Date;
        substatusList?: IStatus[];
        data?: any;
    }

    @Component({
        selector: 'uni-statustrack',
        template: `
            <ol>
                <li *ngFor="let status of config"
                    [class]="getStatusClass(status.state)"
                    [attr.data-badge]="status.badge">

                    <span class="statustrack_title"
                        (click)="selectStatus(status)"
                        [attr.data-badge]="status.badge">{{status.title}}</span>

                    <ol *ngIf="status.substatusList?.length >= 2"
                        class="statustrack_substati">

                        <li *ngFor="let substatus of status.substatusList"
                            [class]="getStatusClass(substatus.state)"
                            (click)="selectStatus(substatus, status)">
                            {{substatus.title}}

                            <time [attr.datetime]="substatus.timestamp?.toDateString()">
                                {{formatTime(substatus.timestamp)}}
                            </time>

                        </li>

                    </ol>
                </li>
            </ol>
        `
    })
    export class StatusTrack {
        @Input() private config: IStatus[];
        @Output() public statusSelectEvent: EventEmitter<any> = new EventEmitter();
        private getStatusClass(state: States) {
            return States[state].toLowerCase();
        }
        public selectStatus(status: IStatus, parent?: IStatus) {
            this.statusSelectEvent.emit([status, parent]);
        }
        public formatTime(datetime) {
            if (!datetime) { return; }
            return moment(datetime).format('lll');
        }
    }

}
