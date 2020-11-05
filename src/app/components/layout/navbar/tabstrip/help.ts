import {Component, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import {BoostChat} from '@app/components/layout/boostChat/boostChat';
import {theme, THEMES} from 'src/themes/theme';
import {UniModalService, GiveSupportAccessModal} from '@uni-framework/uni-modal';
import {AuthService} from '@app/authService';

@Component({
    selector: 'uni-tabstrip-help',
    template: `
        <uni-icon #trigger [icon]="'help'" matTooltip="Lisensinformasjon og support"></uni-icon>

        <dropdown-menu [trigger]="trigger">
            <ng-template>

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
                    Gi support tilgang
                </a>

                <a class="dropdown-menu-item" routerLink="/about/versions">
                    Versjonsinformasjon
                </a>

                <a class="dropdown-menu-item" routerLink="/license-info">
                    Lisensinformasjon
                </a>

                <!-- <a class="dropdown-menu-item" (click)="openChatBotWithSupport()" *ngIf="isSrEnvironment">
                    Opprett supportsak
                </a> -->

                <!-- ChatBot support (above) is disabled temporarily, this is its replacement -->
                <a *ngIf="supportPageUrl && isSrEnvironment" class="dropdown-menu-item" [href]="supportPageUrl" target="_blank">
                    Opprett supportsak
                </a>

                <a *ngIf="helpdeskUrl" class="dropdown-menu-item" [href]="helpdeskUrl" target="_blank">
                    Hjelp
                </a>
            </ng-template>
        </dropdown-menu>
        <section *ngIf="showBoostChat" class="boost-icon">
            <boost-chat></boost-chat>
        </section>
        <zendesk-chat *ngIf="isBrunoEnvironment"></zendesk-chat>
    `,
    styleUrls: ['./help.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTabstripHelp {
    @ViewChild(BoostChat) boost: BoostChat;

    isUeEnvironment = theme.theme === THEMES.UE;
    isSrEnvironment = theme.theme === THEMES.SR;
    isBrunoEnvironment = theme.theme === THEMES.EXT02;

    showBoostChat = false; // theme.theme === THEMES.SR; // || theme.theme === THEMES.EXT02;

    helpdeskUrl: string;
    supportPageUrl: string;

    constructor(private modalService: UniModalService, private authService: AuthService) {
        // every else-if can be removed when we're sure every environment has set HelpDeskUrl in Elsa
        if (this.authService.publicSettings?.HelpDeskUrl) {
            this.helpdeskUrl = this.authService.publicSettings.HelpDeskUrl;
        } else if (this.isUeEnvironment) {
            this.helpdeskUrl = 'https://help.unieconomy.no';
        } else if (this.isSrEnvironment) {
            this.helpdeskUrl = 'https://www.sparebank1.no/nb/sr-bank/bedrift/produkter/bank-regnskap/hjelp.html';
        } else if (this.isBrunoEnvironment) {
            this.helpdeskUrl = 'https://www.dnb.no/bedrift/konto-kort-og-betaling/dnbregnskap/hjelp.html';
        }

        if (this.isSrEnvironment && this.authService.publicSettings?.SupportPageUrl) {
            this.supportPageUrl = this.authService.publicSettings.SupportPageUrl;
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
