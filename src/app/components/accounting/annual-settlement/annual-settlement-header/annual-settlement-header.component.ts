import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import {IUniSaveAction} from '@uni-framework/save/save';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';

@Component({
    selector: 'uni-annual-settlement-component',
    templateUrl: './annual-settlement-header.component.html',
    styleUrls: ['./annual-settlement-header.component.sass'],
    encapsulation: ViewEncapsulation.None
})
export class AnnualSettlementHeaderComponent {
    @Input() annualSettlement;
    @Input() icon: string;
    @Input() outlinedIcon: boolean;
    @Input() title: string;
    @Input() saveButtonLabel: string;
    @Input() completeLabel: string;
    @Input() disableCompleteButton: boolean;
    @Output() clickSaveButton = new EventEmitter<any>(true);
    @Output() clickCompleteButton = new EventEmitter<any>(true);

    saveActions: IUniSaveAction[] = [];
    toolbarconfig: IToolbarConfig = {};

    ngOnChanges() {
        this.toolbarconfig = Object.assign({}, {
            title: this.title,
            buttons: [
                {
                    label: this.saveButtonLabel || 'Lagre',
                    action: () => this.clickSaveButton.emit()
                }
            ]
        });
        this.saveActions.push(<IUniSaveAction> {
            action: (done) => this.clickCompleteButton.emit(done),
            label: this.completeLabel || 'Fullført',
            main: true,
            disabled: false,
        });
    }
}
