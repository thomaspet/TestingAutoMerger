import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions, ConfirmActions} from '@uni-framework/uni-modal/interfaces';


@Component({
    selector: 'uni-confirm-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign">
            <header>
                <h1 class="new">{{options.header}}</h1>
            </header>

            <article>
                <p class="warn" *ngIf="options.warning" [innerHtml]="options.warning"></p>
                <section [innerHtml]="options.message"></section>
            </article>

            <footer [ngClass]="options?.footerCls">
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
export class UniConfirmModalV2 implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

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
