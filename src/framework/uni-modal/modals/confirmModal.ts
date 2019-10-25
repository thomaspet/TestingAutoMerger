import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions, ConfirmActions} from '@uni-framework/uni-modal/interfaces';


@Component({
    selector: 'uni-confirm-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>{{options.header | translate}}</header>

            <article>
                <section class="alert warn" *ngIf="options.warning" [innerHtml]="options.warning"></section>
                <section [innerHtml]="options.message | translate"></section>
            </article>

            <footer [ngClass]="options?.footerCls">
                <button *ngIf="options.buttonLabels.cancel" class="pull-left secondary" (click)="cancel()">
                    {{options.buttonLabels.cancel}}
                </button>

                <button *ngIf="options.buttonLabels.reject"
                    [ngClass]="options.buttonClasses?.reject || 'bad'"
                    (click)="reject()">
                    {{options.buttonLabels.reject}}
                </button>

                <button *ngIf="options.buttonLabels.accept"
                    [ngClass]="options.buttonClasses?.accept || 'good'"
                    id="good_button_ok"
                    (click)="accept()">
                    {{options.buttonLabels.accept}}
                </button>
            </footer>
        </section>
    `
})
export class UniConfirmModalV2 implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    public ngOnInit() {
        if (!this.options.buttonLabels) {
            this.options.buttonLabels = {
                accept: 'Ok',
                cancel: 'Avbryt'
            };
        }
    }

    public ngAfterViewInit() {
        setTimeout(function() {
            if (document.getElementById('good_button_ok')) {
                document.getElementById('good_button_ok').focus();
            }
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
