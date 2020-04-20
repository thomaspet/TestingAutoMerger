import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions, ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import { RegulativeService } from '@app/services/services';


@Component({
    selector: 'uni-confirm-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header style="margin:0 0 1rem 35%; width: 65%">Lag nytt regulativ</header>

            <article>
                <p style="text-align: center;">
                    Statens regulativ kan importeres direkte inn i systemet. Disse kan du laste ned fra Regjeringen sine sider i Excel-format.
                    <a href="https://www.regjeringen.no/no/tema/arbeidsliv/Statlig-arbeidsgiverpolitikk/lonn-og-tariff-i-staten/lonnstabellen/id438643/#Atabellen" target="_blank">
                        Du finner de her.
                    </a>
                </p>
                <p style="text-align: center;">Det er også mulig å lage eget regulativ i Excel og lese inn i systemet. Du kan også lage egne regulativ ved å eksportere allerede eksisterende regulativ (evt. mal) til Excel, endre og lese inn med ny startdato.</p>

                <button class="c2a" (click)="import()" style="display: inline-block; margin: 1rem 40% 1rem 40%; width: 10rem;">
                    Importer regulativ
                </button>

                <button
                    style="display: inline-block; margin: 0 40%; width: 10rem;"
                    class="secondary"
                    (click)="downloadTemplate()">
                    Last ned mal
                </button>
            </article>
        </section>
    `
})
export class UniNewRegulativeModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    constructor(private regulativeService: RegulativeService) {}

    public import() {
        this.onClose.emit(ConfirmActions.ACCEPT);
    }

    public downloadTemplate() {
        this.regulativeService
            .downloadTemplateFile();
        this.onClose.emit(ConfirmActions.CANCEL);
    }
}
