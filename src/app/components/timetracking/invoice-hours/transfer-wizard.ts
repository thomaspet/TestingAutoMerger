import {Component, Input, Output, EventEmitter} from '@angular/core';
import {
    IUniModal,
    IModalOptions,
    ConfirmActions,
    UniModalService
} from '@uni-framework/uniModal/modalService';
import { StatisticsService } from '@app/services/common/statisticsService';
import { ErrorService } from '@app/services/common/errorService';
import { Http } from '@angular/http';
import { OnInit, AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
    selector: 'workitem-transfer-wizard',
    templateUrl: './transfer-wizard.html',
    styles: [
        `.container { padding: 1em 1em 0 1em; }
         .wizard-step-container { min-height: 15em; }
        `
    ]
})
export class WorkitemTransferWizard implements IUniModal, OnInit, AfterViewInit {
    @Input()
    public options: IModalOptions = {};
    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public step = 0;
    public steps: Array<{label: string}> = [
        { label: 'Utvalg' },
        { label: 'Filtrer' },
        { label: 'Produkt/pris' },
        { label: 'Fullfør' }
    ];

    public busy: boolean = false;
    public choices: Array<{ label: string, checked?: boolean }> = [
        { label: 'Kunde-timer', checked: true},
        { label: 'Ordre-timer'},
        { label: 'Prosjekt-timer'}
    ];

    constructor(
        private http: Http,
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) {

    }

    public ngOnInit() {
        if (!this.options.buttonLabels) {
            this.options.buttonLabels = {
                accept: 'Videre',
                cancel: 'Avbryt'
            };
        }
        if (this.options && this.options.data) {
            // this.busy = true;
        }
    }

    public ngAfterViewInit() {
        setTimeout(function() {
            document.getElementById('good_button_ok').focus();
        });
    }

    public goBack() {
        if (this.step > 0) {
            this.step--;
        }
    }

    public accept() {
        if (this.step === this.steps.length - 1) {
            this.onClose.emit(ConfirmActions.ACCEPT);
            return;
        }
        this.step++;
    }

    public reject() {
        this.onClose.emit(ConfirmActions.REJECT);
    }

    public cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }


}
