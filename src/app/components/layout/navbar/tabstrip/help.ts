import {Component, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import {BoostChat} from '@app/components/layout/boostChat/boostChat';
import {theme, THEMES} from 'src/themes/theme';
import {UniModalService, GiveSupportAccessModal} from '@uni-framework/uni-modal';

@Component({
    selector: 'uni-tabstrip-help',
    template: `
        <uni-icon #trigger [icon]="'help'" matTooltip="Lisensinformasjon og support"></uni-icon>

        <dropdown-menu [trigger]="trigger">
            <ng-template>
                <a *ngIf="helpDeskUrl" class="dropdown-menu-item" [href]="helpdeskUrl" target="_blank">
                    Hjelpeside
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

                <a class="dropdown-menu-item" (click)="openGiveSupportAccessModal()">
                    Gi lesetilgang
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

    helpdeskUrl;

    constructor(private modalService: UniModalService) {
        if (this.isUeEnvironment) {
            this.helpdeskUrl = 'https://help.unieconomy.no';
        } else if (this.isSrEnvironment) {
            this.helpdeskUrl = 'https://www.sparebank1.no/nb/sr-bank/bedrift/produkter/bank-regnskap/hjelp.html';
        }
    }

    openChatBotWithSupport() {
        if (this.boost.chatPanelReady) {
            this.boost.openChatWithSupportCase();
        }
    }

    openGiveSupportAccessModal() {
        this.modalService.open(GiveSupportAccessModal);
    }
}
