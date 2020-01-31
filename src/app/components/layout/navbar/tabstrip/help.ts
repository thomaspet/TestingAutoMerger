import {Component, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import {BoostChat} from '@app/components/layout/boostChat/boostChat';
import {theme, THEMES} from 'src/themes/theme';

@Component({
    selector: 'uni-tabstrip-help',
    template: `
        <uni-icon #trigger [icon]="'help'"></uni-icon>

        <dropdown-menu [trigger]="trigger">
            <ng-template>
                <a class="dropdown-menu-item" href="https://help.unieconomy.no" target="_blank" *ngIf="!isSrEnvironment">
                    Kundesenter
                </a>

                <a class="dropdown-menu-item" href="https://unimicro.atlassian.net/servicedesk/customer/portal/3/create/24" target="_blank" *ngIf="!isSrEnvironment">
                    Opprett supportsak
                </a>

                <a class="dropdown-menu-item" href="https://unimicro.atlassian.net/servicedesk/customer/user/requests?status=open" target="_blank" *ngIf="!isSrEnvironment">
                    Mine supportsaker
                </a>

                <a class="dropdown-menu-item" href="ftp://ftp.unimicro.biz/teknisk/umtt.exe" target="_blank" *ngIf="!isSrEnvironment">
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
        <section *ngIf="isSrEnvironment" class="boost-icon">
            <boost-chat></boost-chat>
        </section>
    `,
    styleUrls: ['./help.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTabstripHelp {
    @ViewChild(BoostChat, { static: false }) boost: BoostChat;

    isSrEnvironment = theme.theme === THEMES.SR;

    openChatBotWithSupport() {
        if (this.boost.chatPanelReady) {
            this.boost.openChatWithSupportCase();
        }
    }
}
