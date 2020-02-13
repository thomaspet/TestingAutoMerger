import { Component, ChangeDetectorRef } from '@angular/core';

type ExtendedWindow = typeof window & {
    boostChatPanel: any;
};

@Component({
    selector: 'boost-chat',
    template: `
    <span *ngIf="chatPanelReady" (click)="openBoostAIChat()">
        <img style="box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.2); border-radius: 50%" [src]="chatbotIcon">
    </span>
    `,
})
export class BoostChat {
    private chatPanel: any = null;
    public chatPanelReady = false;
    private chatScriptUrl = 'https://435984srpoc.boost.ai/chatPanel/chatPanel.js';
    private chatApiUrl = 'https://435984srpoc.boost.ai/api';
    chatbotIcon = 'assets/chatbot_icon.png';

    boostCode: string;
    conversationId: string;

    constructor(private cdr: ChangeDetectorRef) {

        // temporary check for boost code, 'bigger than 40' should be safe since guid is 36 or 38 chars.
        if (sessionStorage.getItem('code') && sessionStorage.getItem('code').length > 40) {
            this.boostCode = decodeURIComponent(sessionStorage.getItem('code'));
        }
        this.conversationId = sessionStorage.getItem('boostConversationId');

        if (this.chatScriptUrl && this.chatApiUrl) {
            const script = document.createElement('script');
            script.type = 'application/javascript';
            script.onload = this.loadSuccessCallback;
            script.src = this.chatScriptUrl;
            document.getElementsByTagName('head')[0].appendChild(script);
        }
    }

    loadSuccessCallback = () => {
        this.chatPanelReady = true;

        const chatPanelConfiguration = {
            apiUrlBase: this.chatApiUrl,
            conversationId: this.conversationId,
            hyperlinksTargetBlank: true,
            pace: 'fast',
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
    }

    openBoostAIChat() {
        this.chatPanel.show();
    }

    public openChatWithSupportCase() {
        this.chatPanel.sendMessage('Opprett supportsak');
    }
}
