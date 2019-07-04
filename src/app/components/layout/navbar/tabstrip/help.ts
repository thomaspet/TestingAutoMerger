import {Component, ChangeDetectionStrategy} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector: 'uni-tabstrip-help',
    template: `
        <section class="help-toggle" role="button"
            (click)="isExpanded = !isExpanded"
            (clickOutside)="isExpanded = false">

            <span>Hjelp</span>
            <i class="material-icons">expand_more</i>
        </section>

        <ul class="toolbar-dropdown-list" [attr.aria-expanded]="isExpanded">
            <li (click)="goToServiceDesk()">Kundesenter</li>
            <li (click)="goToNewSupportCase()">Opprett supportsak</li>
            <li (click)="goToMySupportCases()">Mine supportsaker</li>
            <li (click)="goToTeamviewer()">Teamviewer nedlasting</li>
            <li (click)="goToAbout()">Versjonsinformasjon</li>
            <li (click)="goToLicenseInfo()">Lisensinformasjon</li>
        </ul>
    `,
    styleUrls: ['./help.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTabstripHelp {
    public isExpanded: boolean;

    constructor(private router: Router) {}

    goToServiceDesk() {
        window.open('https://help.unieconomy.no', '_blank');
    }

    goToNewSupportCase() {
        window.open('https://unimicro.atlassian.net/servicedesk/customer/portal/3/create/24', '_blank');
    }

    goToMySupportCases() {
        window.open('https://unimicro.atlassian.net/servicedesk/customer/user/requests?status=open', '_blank');
    }

    goToTeamviewer() {
        window.open('ftp://ftp.unimicro.biz/teknisk/umtt.exe', '_blank');
    }

    goToAbout() {
        this.router.navigateByUrl('/about/versions');
    }

    goToLicenseInfo() {
        this.router.navigateByUrl('/license-info');
    }
}
