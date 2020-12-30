import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import {IUniSaveAction} from '@uni-framework/save/save';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {Router} from '@angular/router';

interface IAlertData {
    title?: string;
    text?: string;
}

@Component({
    selector: 'uni-annual-settlement-header-component',
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
    @Input() isAlertOpen: boolean;
    @Input() disableCompleteButton: boolean;
    @Input() alert: IAlertData;
    @Input() tabTitle: string;
    @Output() clickSaveButton = new EventEmitter<any>(true);
    @Output() clickCompleteButton = new EventEmitter<any>(true);

    saveActions: IUniSaveAction[] = [];
    toolbarconfig: IToolbarConfig = {};
    showAlert = true;

    constructor(
        private router: Router,
        private tabService: TabService
    ) {
    }

    ngOnChanges() {
        this.showAlert = this.isAlertOpen;
        this.toolbarconfig = Object.assign({}, {
            title: this.title,
            buttons: [
                {
                    label: this.saveButtonLabel || 'Lagre',
                    action: () => this.clickSaveButton.emit()
                }
            ]
        });
        this.saveActions = [<IUniSaveAction> {
            action: (done) => this.clickCompleteButton.emit(done),
            label: this.completeLabel || 'Fullført',
            main: true,
            disabled: false,
        }];
        if (this.annualSettlement) {
            this.addTab();
        }
    }
    onCloseInfoAlert() {
        this.showAlert = false;
    }
    openInfoBox() {
        this.showAlert = true;
    }
    addTab() {
        this.tabService.addTab({
            name: this.tabTitle, url: this.router.url,
            moduleID: UniModules.Accountsettings, active: true
        });
    }
}
