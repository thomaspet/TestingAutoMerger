import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'uni-tabstrip-help',
    template: `
        <i #toggle role="button" class="material-icons">help</i>

        <dropdown-menu [trigger]="toggle">
            <ng-template>
                <a class="dropdown-menu-item" href="https://help.unieconomy.no" target="_blank">
                    Kundesenter
                </a>

                <a class="dropdown-menu-item" href="https://unimicro.atlassian.net/servicedesk/customer/portal/3/create/24" target="_blank">
                    Opprett supportsak
                </a>

                <a class="dropdown-menu-item" href="https://unimicro.atlassian.net/servicedesk/customer/user/requests?status=open" target="_blank">
                    Mine supportsaker
                </a>

                <a class="dropdown-menu-item" href="ftp://ftp.unimicro.biz/teknisk/umtt.exe" target="_blank">
                    Teamviewer nedlasting
                </a>

                <a class="dropdown-menu-item" routerLink="/about/versions">
                    Versjonsinformasjon
                </a>

                <a class="dropdown-menu-item" routerLink="/license-info">
                    Lisensinformasjon
                </a>
            </ng-template>
        </dropdown-menu>
    `,
    styleUrls: ['./help.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTabstripHelp {}
