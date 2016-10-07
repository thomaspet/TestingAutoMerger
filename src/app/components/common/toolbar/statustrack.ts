import {Component, Input} from '@angular/core';

export module UniStatusTrack {

    export enum States {
        Completed, // Past
        Active,    // Present
        Future,    // Potential
        Obsolete,  // The data has changed si
        Disabled   // Waiting for the right circumstances
    }

    export interface IStatus {
        title: string;
        state: States;
        badge?: string;
    }

    @Component({
        selector: 'uni-statustrack',
        template: `
            <ol class="poster_statustrack">
                <li *ngFor="let status of config"
                    [class]="getStatusClass(status.state)"
                    [attr.data-badge]="status.badge">{{status.title}}</li>
            </ol>
        `
    })
    export class StatusTrack {
        @Input() private config: IStatus[];
        private getStatusClass(state: States) {
            return States[state].toLowerCase();
        }
    }

}
