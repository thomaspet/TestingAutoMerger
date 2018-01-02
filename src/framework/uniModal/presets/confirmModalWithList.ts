import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions, ConfirmActions} from '@uni-framework/uniModal/interfaces';

export interface IConfirmModalWithListReturnValue {
    list: Array<boolean>;
    action: ConfirmActions;
}

@Component({
    selector: 'uni-confirm-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1 class="new">{{options.header}}</h1>
            </header>

            <article>
                <section [innerHtml]="options.message"></section>
                <p class="warn" *ngIf="options.warning">
                    {{options.warning}}
                </p>

                <p>
                    {{options.listMessage}}
                </p>
                <ul class="confirm_modal_list">
                    <li *ngFor="let item of list; let i = index;"
                    (click)="checkUncheckListItem($event, i)">
                        <label class="" for="{{ 'confirmlistitem' + i }}">
                            <input type="checkbox" [(ngModel)]="list[i]" id="{{ 'confirmlistitem' + i }}" />
                            {{ options.list[i][options.listkey] }}
                        </label>
                    </li>
                </ul>
            </article>

            <footer>
                <button *ngIf="options.buttonLabels.accept" class="good" (click)="accept()">
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
export class UniConfirmModalWithList implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<IConfirmModalWithListReturnValue> = new EventEmitter();

    private list: Array<boolean> = [];

    public ngOnInit() {
        if (!this.options.buttonLabels) {
            this.options.buttonLabels = {
                accept: 'Ok',
                cancel: 'Avbryt'
            };
        }

        // Push a boolean on the list
        this.options.list.forEach(item => this.list.push(true));

    }

    public checkUncheckListItem(event: Event, index: number) {
        event.preventDefault();
        this.list[index] = !this.list[index];
    }

    public accept() {
        this.onClose.emit( { list: this.list, action: ConfirmActions.ACCEPT } );
    }

    public reject() {
        this.onClose.emit({ list: this.list, action: ConfirmActions.REJECT });
    }

    public cancel() {
        this.onClose.emit({ list: this.list, action: ConfirmActions.CANCEL });
    }
}
