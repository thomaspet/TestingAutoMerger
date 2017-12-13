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
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1 class="new">Fakturering av timer</h1>
            </header>

            <article [attr.aria-busy]="busy">
                <section [innerHtml]="options.message"></section>
                <p class="warn" *ngIf="options.warning">
                    {{options.warning}}
                </p>

            </article>

            <footer (click)="busy = !busy" >
                <button *ngIf="options.buttonLabels.accept" class="good" id="good_button_ok" (click)="accept()">
                    {{options.buttonLabels.accept}}
                </button>

                <button *ngIf="options.buttonLabels.reject" class="bad" (click)="reject()">
                    {{options.buttonLabels.reject}}
                </button>

                <button *ngIf="options.buttonLabels.cancel" class="cancel" (click)="cancel()">
                    {{options.buttonLabels.cancel}}
                </button>
            </footer>
        </section>
    `
})
export class WorkitemTransferWizard implements IUniModal, OnInit, AfterViewInit {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public busy: boolean = false;

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
            this.busy = true;
        }
    }

    public ngAfterViewInit() {
        setTimeout(function() {
            document.getElementById('good_button_ok').focus();
        });
    }

    public accept() {
        this.onClose.emit(ConfirmActions.ACCEPT);
    }

    public reject() {
        this.onClose.emit(ConfirmActions.REJECT);
    }

    public cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }


}
