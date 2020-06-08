import {Component, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import {BoostChat} from '@app/components/layout/boostChat/boostChat';
import {theme, THEMES} from 'src/themes/theme';

@Component({
    selector: 'uni-tabstrip-help',
    template: `
        <uni-icon #trigger [icon]="'help'" matTooltip="Lisensinformasjon og support"></uni-icon>

        <dropdown-menu [trigger]="trigger">
            <ng-template>
                <a class="dropdown-menu-item" href="https://help.unieconomy.no" target="_blank" *ngIf="isUeEnvironment">
                    Kundesenter
                </a>

                <a class="dropdown-menu-item" href="https://unimicro.atlassian.net/servicedesk/customer/portal/3/create/24" target="_blank" *ngIf="isUeEnvironment">
                    Opprett supportsak
                </a>

                <a class="dropdown-menu-item" href="https://unimicro.atlassian.net/servicedesk/customer/user/requests?status=open" target="_blank" *ngIf="isUeEnvironment">
                    Mine supportsaker
                </a>

                <a class="dropdown-menu-item" href="ftp://ftp.unimicro.biz/teknisk/umtt.exe" target="_blank" *ngIf="isUeEnvironment">
                    Teamviewer nedlasting
                </a>

                <a class="dropdown-menu-item" routerLink="/about/versions">
                    Versjonsinformasjon
                </a>

                <a class="dropdown-menu-item" routerLink="/license-info">
                    Lisensinformasjon
                </a>

                <a class="dropdown-menu-item" (click)="openChatBotWithSupport()" *ngIf="isSrEnvironment">
                    Opprett supportsak
                </a>
            </ng-template>
        </dropdown-menu>
        <section *ngIf="showBoostChat" class="boost-icon">
            <boost-chat></boost-chat>
        </section>
    `,
    styleUrls: ['./help.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTabstripHelp {
    @ViewChild(BoostChat) boost: BoostChat;

    isUeEnvironment = theme.theme === THEMES.UE;
    isSrEnvironment = theme.theme === THEMES.SR;

    showBoostChat = theme.theme === THEMES.SR || theme.theme === THEMES.EXT02;

    openChatBotWithSupport() {
        if (this.boost.chatPanelReady) {
            this.boost.openChatWithSupportCase();
        }
    }
}
