import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector: 'uni-toolbar-help',
    template: `
        <a (click)="isExpanded = !isExpanded" (clickOutside)="isExpanded = false">Hjelp</a>

        <ul class="toolbar-dropdown-list" [attr.aria-expanded]="isExpanded">
            <li *ngIf="videoURL?.length" (click)="goToVideo()">Opplæringsvideo for skjermbilde</li>
            <li (click)="goToServiceDesk()">Kundesenter</li>
            <li (click)="goToAbout()">Systeminfo</li>
        </ul>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniToolbarHelp {
    @Input() public videoURL: string;

    public isExpanded: boolean;

    constructor(private router: Router) {}

    public goToVideo() {
        window.open(this.videoURL, '_blank');
    }

    public goToServiceDesk() {
        window.open('https://unimicro.atlassian.net/servicedesk/customer/portal/3', '_blank');
    }

    public goToAbout() {
        this.router.navigateByUrl('/about/versions');
    }
}
