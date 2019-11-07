import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ErrorService} from '@app/services/services';

@Component({
    selector: 'bank-statement-settings',
    templateUrl: './bank-statement-settings.html',
    styleUrls: ['./bank-statement-settings.sass']
})
export class BankStatementSettings implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();
    defaultSettings = { MaxDayOffset: 0, MaxDelta: 0.0 };
    settings: { MaxDayOffset: number, MaxDelta: number };
    originalSettings: string;
    errorMsg: string = '';

    constructor(
        private errorService: ErrorService,
    ) {}

    ngOnInit() {
        this.settings = this.clone(this.options.data.settings || this.defaultSettings, this.originalSettings);
    }

    private clone(value: any, backup: string) {
        if (value) {
            backup = JSON.stringify(value);
            return JSON.parse(backup);
        }
    }

    complete() {
        this.settings.MaxDayOffset = this.settings.MaxDayOffset || 0;
        this.settings.MaxDelta = this.settings.MaxDelta || 0;

        if (isNaN(this.settings.MaxDayOffset) || isNaN(this.settings.MaxDelta)) {
            this.errorMsg = 'Ugyldig input. Verdi må være tall mellom 0 og 100';
            return;
        }

        this.onClose.emit(this.settings);
    }
}
