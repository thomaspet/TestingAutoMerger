import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {Router} from '@angular/router';
import {UniModalService, UniFeedbackModal} from '../../../../framework/uniModal/barrel';

@Component({
    selector: 'uni-toolbar-help',
    template: `
        <a (click)="isExpanded = !isExpanded" (clickOutside)="isExpanded = false">Hjelp</a>

        <ul class="toolbar-dropdown-list" [attr.aria-expanded]="isExpanded">
            <li *ngIf="videoURL?.length" (click)="goToVideo()">Opplæringsvideo for skjermbilde</li>
            <li (click)="goToServiceDesk()">Kundesenter</li>
            <li (click)="goToAbout()">Systeminfo</li>
            <li (click)="openFeedbackModal()">Gi tilbakemelding</li>
        </ul>
    `,
    styles: ['.toolbar-dropdown-list { top: 0.7rem; }'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniToolbarHelp {
    @Input() public videoURL: string;

    public isExpanded: boolean;

    constructor(private router: Router, private modalService: UniModalService) {}

    public goToVideo() {
        window.open(this.videoURL, '_blank');
    }

    public goToServiceDesk() {
        window.open('https://unimicro.atlassian.net/servicedesk/customer/portal/3', '_blank');
    }

    public goToAbout() {
        this.router.navigateByUrl('/about/versions');
    }

    public openFeedbackModal() {
        this.modalService.open(UniFeedbackModal);
    }
}
