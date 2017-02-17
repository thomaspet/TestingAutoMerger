import {Component, Input, Output, EventEmitter} from '@angular/core';
import {StatusService} from '../../../services/services';

declare const moment;

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
        code?: number;
        badge?: string;
        timestamp?: Date;
        substatusList?: IStatus[];
        data?: any;
        logEntries?: any[];
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

                    <ol *ngIf="status.logEntries"
                        class="statustrack_statuslog">
                        <li *ngFor="let statusChange of status.logEntries">
                            <div>Forrige status: <strong>{{statusChange.FromStatusText}}</strong></div>
                            <div>Endret av: <strong>{{statusChange.CreatedByName}}</strong></div>
                            <time>
                                {{formatTime(statusChange.CreatedAt)}}
                            </time>
                        </li>
                        <li *ngIf="status.logEntries.length === 0">
                            Ingen statusoppdateringer funnet for denne statusen
                        </li>
                    </ol>
                </li>
            </ol>
        `
    })
    export class StatusTrack {
        @Input() private config: IStatus[];
        @Input() private entityType: string;
        @Input() private entityID: number;

        @Output() public statusSelectEvent: EventEmitter<any> = new EventEmitter();

        constructor(private statusService: StatusService) {

        }

        private getStatusClass(state: States) {
            return States[state].toLowerCase();
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
                    }
                }
            }
        }
        public formatTime(datetime) {
            if (!datetime) { return; }
            return moment(datetime).format('lll');
        }
    }

}
