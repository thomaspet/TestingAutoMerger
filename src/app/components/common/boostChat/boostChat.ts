import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

type ExtendedWindow = typeof window & {
    boostChatPanel: any;
};

@Component({
    selector: 'boost-chat',
    template: `
    <span *ngIf="chatPanelReady" (click)="openBoostAIChat()">
        <i class="material-icons-outlined" style="vertical-align: middle; margin: 0 2px 2px 0">chat</i>
        Boost.ai
    </span>
    <span *ngIf="chatPanelReady" style="padding: 0 8px; cursor: default">|</span>
    `,
})
export class BoostChat {
    private chatPanel: any = null;
    public chatPanelReady = false;
    private chatScriptUrl = environment.BOOST_AI_SCRIPT_URL;
    private chatApiUrl = environment.BOOST_AI_API_URL;

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
            startThumbs: true,
        };

        this.chatPanel = (window as ExtendedWindow).boostChatPanel(chatPanelConfiguration);
    }

    openBoostAIChat() {
        this.chatPanel.show();
    }
}
