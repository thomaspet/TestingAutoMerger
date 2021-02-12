import { Component, ChangeDetectorRef } from '@angular/core';
import {AuthService} from '@app/authService';
import {theme} from 'src/themes/theme';

type ExtendedWindow = typeof window & {
    boostChatPanel: any;
};

@Component({
    selector: 'boost-chat',
    template: `
        <span *ngIf="iconUrl && chatPanelReady"
            (click)="openBoostAIChat()"
            role="button"
            aria-label="Chatbot">

            <img [src]="iconUrl">
        </span>
    `,
    styleUrls: ['./boostChat.sass']
})
export class BoostChat {
    private chatPanel = null;

    chatPanelReady = false;

    iconUrl: string = theme.chatbotIcon;

    boostCode: string;
    conversationId: string;
    bankFilter: string[] = [];

    constructor(
        private cdr: ChangeDetectorRef,
        private authService: AuthService,
    ) {

        // temporary check for boost code, 'bigger than 40' should be safe since guid is 36 or 38 chars.
        if (sessionStorage.getItem('code') && sessionStorage.getItem('code').length > 40) {
            this.boostCode = decodeURIComponent(sessionStorage.getItem('code'));
        }

        this.conversationId = sessionStorage.getItem('boostConversationId');

        this.bankFilter = [this.authService.publicSettings?.BIC || ''];

        this.initBoostChat();
    }

    initBoostChat() {
        const script = document.createElement('script');
        script.type = 'application/javascript';
        script.src = 'https://435984srpoc.boost.ai/chatPanel/chatPanel.js';
        script.onload = () => {
            this.chatPanelReady = true;
            const chatPanelConfiguration = {
                apiUrlBase: 'https://435984srpoc.boost.ai/api',
                conversationId: this.conversationId,
                pace: 'fast',
                hyperlinksTargetBlank: true,
                filterValues: this.bankFilter
            };

            this.chatPanel = (window as ExtendedWindow).boostChatPanel(chatPanelConfiguration);

            this.chatPanel.addEventListener('conversationIdChanged', (event) => {
                this.conversationId = event.detail.conversationId;
                sessionStorage.setItem('boostConversationId', this.conversationId);

                if (this.boostCode) {
                    setTimeout(() => {
                        this.chatPanel.loginEvent({authContent: this.boostCode, authType: 'openid'});

                        // boost code is only valid once, remove it after we've used it
                        this.boostCode = '';
                        sessionStorage.removeItem('code');
                    }, 20);
                }
            });

            if (this.boostCode) {
                this.chatPanel.show();
            }

            this.cdr.markForCheck();
        };

        document.getElementsByTagName('head')[0].appendChild(script);
    }

    openBoostAIChat() {
        this.chatPanel.show();
    }

    public openChatWithSupportCase() {
        this.chatPanel.sendMessage('Opprett supportsak');
    }
}
