import {Component, EventEmitter, Output} from '@angular/core';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {AssetsActions} from '@app/components/accounting/assets/assets.actions';
import {IUniSaveAction} from '@uni-framework/save/save';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {tap} from 'rxjs/operators';

@Component({
    selector: 'assets-list-toolbar',
    template: `
        <uni-toolbar
            [config]="toolbarconfig"
            [saveactions]="saveActions"
        ></uni-toolbar>
    `
})
export class AssetsListToolbar {
    @Output() actionEvent: EventEmitter<any> = new EventEmitter<any>();

    saveActions: IUniSaveAction[];
    toolbarconfig: IToolbarConfig = {
        title: 'Eiendeler',
        contextmenu: [
            {
                label: 'Utfør avskrivninger',
                action: () => this.assetsActions.performDepreciations().pipe(
                    tap((res) => {
                        if (res?.length > 0) {
                            this.toast.addToast('Error', ToastType.bad, ToastTime.medium, JSON.stringify(res));
                            this.actionEvent.emit({
                                action: 'performDepreciation',
                                result: false
                            });
                        }
                        this.actionEvent.emit({
                            action: 'performDepreciation',
                            result: true
                        });
                    })
                )
            }
        ]
    };

    constructor(
        private tabService: TabService,
        private assetsActions: AssetsActions,
        private toast: ToastService
    ) {}

    ngOnInit() {
        this.addTab();
        this.setSaveActions();
    }

    private addTab() {
        this.tabService.addTab({
            name: 'Eiendeler', url: '/accounting/assets',
            moduleID: UniModules.Accountsettings, active: true
        });
    }

    private setSaveActions() {
        this.saveActions = [{
            label: 'Registrer ny eiendel',
            action: () => this.assetsActions.navigateToNewAsset()
        }];
    }
}
