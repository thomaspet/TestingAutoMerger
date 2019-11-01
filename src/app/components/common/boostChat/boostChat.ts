import { Component } from '@angular/core';

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
    styleUrls: ['./boostChat.sass']
})
export class BoostChat {
    private chatPanel: any = null;
    public chatPanelReady = false;
    private chatScriptUrl = 'https://435984srpoc.boost.ai/chatPanel/chatPanel.js';
    private chatApiUrl = 'https://435984srpoc.boost.ai/api';
    chatbotIcon = 'assets/chatbot_icon.png';

    constructor() {
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
            pace: 'fast',
            hyperlinksTargetBlank: true,
        };

        this.chatPanel = (window as ExtendedWindow).boostChatPanel(chatPanelConfiguration);
    }

    openBoostAIChat() {
        this.chatPanel.show();
    }
}
