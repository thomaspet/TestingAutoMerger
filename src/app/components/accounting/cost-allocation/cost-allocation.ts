import { Component, OnInit, ViewChild } from '@angular/core';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { IUniSaveAction } from '@uni-framework/save/save';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { CostAllocation } from '@app/unientities';
import { CostAllocationService } from '@app/services/accounting/costAllocationService';
import { createGuid } from '@app/services/common/dimensionService';
import { ErrorService } from '@app/services/common/errorService';
import { CustomDimensionService } from '@app/services/common/customDimensionService';
import { ConfirmActions, UniModalService } from '@uni-framework/uni-modal';
import { ToastService, ToastTime, ToastType } from '@uni-framework/uniToast/toastService';
import { Observable } from 'rxjs/Observable';
import { UniCostAllocationList } from '@app/components/accounting/cost-allocation/cost-allocation-list/cost-allocation-list';


const EXPAND_ITEMS = [
    'Items',
    'Items.Account',
    'Items.VatType',
    'Items.Dimensions',
    'Items.Dimensions.Project',
    'Items.Dimensions.Department',
    'Items.Dimensions.Dimension5',
    'Items.Dimensions.Dimension6',
    'Items.Dimensions.Dimension7',
    'Items.Dimensions.Dimension8',
    'Items.Dimensions.Dimension9',
    'Items.Dimensions.Dimension10',
];

@Component({
    selector: 'uni-cost-allocation',
    templateUrl: './cost-allocation.html',
    styles: [`.splitview_list, .splitview_detail { width: 100%;}`]
})
export class UniCostAllocation implements OnInit {
    touched: boolean;
    saveActions: IUniSaveAction[];
    toolbarconfig: IToolbarConfig;
    costAllocationItems: CostAllocation[] = [];
    selectedIndex = -1;
    currentCostAllocation = new CostAllocation();
    dimensionTypes: any[] = [];

    @ViewChild('costAllocationList', { static: true }) costAllocationList: UniCostAllocationList;

    constructor(
        public toast: ToastService,
        public tabService: TabService,
        public modalService: UniModalService,
        public costAllocationService: CostAllocationService,
        public customDimensionService: CustomDimensionService,
        public errorService: ErrorService
    ) {
        this.tabService.addTab({
            url: '/accounting/costallocation',
            name: 'Fordelingsnøkler',
            active: true,
            moduleID: UniModules.CostAllocation
        });
        this.saveActions = this.updateSaveActions(false);
        this.toolbarconfig = <IToolbarConfig>{
            title: 'Fordelingsnøkler',
            navigation: {
                add: () => {
                    this.costAllocationService.GetNewEntity(EXPAND_ITEMS).subscribe(entity => {
                            this.currentCostAllocation = entity;
                            this.selectedIndex = -1;
                            this.saveActions = this.updateSaveActions(false);
                        });
                },
            }
        };
    }

    ngOnInit() {
        if (this.dimensionTypes.length === 0) {
            this.customDimensionService.getMetadata().subscribe(x => this.dimensionTypes = x);
        }
        if (this.selectedIndex === -1) {
            this.costAllocationService.GetNewEntity(EXPAND_ITEMS)
                .subscribe(entity => {
                    this.touched = false;
                    this.saveActions = this.updateSaveActions(false);
                    this.currentCostAllocation = entity;

                });
        } else {
            this.costAllocationService.Get(this.costAllocationItems[this.selectedIndex].ID, EXPAND_ITEMS)
                .subscribe(entity => {
                    this.touched = false;
                    this.saveActions = this.updateSaveActions(false);
                    this.currentCostAllocation = entity;
                    setTimeout(() => this.costAllocationList.table.focusRow(this.selectedIndex), 200);

                });
        }
        this.costAllocationService.GetAll()
            .subscribe(items => {
                this.touched = false;
                this.saveActions = this.updateSaveActions(false);
                this.costAllocationItems = items;
            });
    }

    onDetailsTouched(touched) {
        this.touched = touched;
        this.saveActions = this.updateSaveActions(touched);
    }

    updateSaveActions(touched: boolean = false) {
        return [
            {
                label: 'Lagre',
                action: done => {
                    this.saveEntity(this.currentCostAllocation).subscribe(entity => {
                        this.ngOnInit();
                        done('Lagring fullført');
                    }, (error) => {
                        this.errorService.handle(error);
                        done(error.errorMessage);
                    });
                },
                disabled: !touched
            }
        ];
    }

    onCostAllocationSelected(data) {
        if (data.index === this.selectedIndex) {
            return;
        }
        if (!this.touched) {
            this.costAllocationService.Get(data.row.ID, EXPAND_ITEMS).subscribe(entity => {
                this.currentCostAllocation = entity;
                this.selectedIndex = data.index;
            });
        } else {
            this.modalService.openUnsavedChangesModal().onClose.subscribe((res: any) => {
                if (res === ConfirmActions.ACCEPT) {
                    this.saveEntity(this.currentCostAllocation).subscribe((result: any) => {
                        this.touched = false;
                        this.costAllocationService.GetAll('', EXPAND_ITEMS)
                            .subscribe(items => {
                                this.toast.addToast('Fordelingsnøkler lagret', ToastType.good, ToastTime.medium);
                                this.currentCostAllocation = result;
                                this.costAllocationItems = items;
                                this.selectedIndex = this.costAllocationItems.findIndex(item => item.ID === result.ID);
                            });
                    }, (reason) => {
                        this.toast.addToast(reason, ToastType.bad, ToastTime.medium);
                    });
                } else {
                    if (res !== ConfirmActions.CANCEL) {
                        this.currentCostAllocation = data.row;
                        this.selectedIndex = data.index;
                        this.touched = false;
                    } else {
                        setTimeout(() => {
                            this.costAllocationList.table.focusRow(this.selectedIndex);
                        });
                    }
                }
            });
        }
    }

    onDeleteCostAllocation(selectedCostAllocation: CostAllocation) {
        this.costAllocationService.Remove(selectedCostAllocation.ID, selectedCostAllocation).subscribe((result) => {
            this.selectedIndex = -1;
            this.ngOnInit();
        }, (error) => {
            this.ngOnInit();
            this.errorService.handle(error);
        });
    }

    saveEntity(entity: CostAllocation): Observable<CostAllocation> {
        const copyOfCostAllocation = Object.assign({}, entity);
        const items = copyOfCostAllocation.Items
            .filter(row => !row['_isEmpty'])
            .map(s => {
                if (!s.ID) {
                    s._createguid = createGuid();
                }
                if (s.Account && s.Account.ID) {
                    s.AccountID = s.Account.ID;
                    s.Account = null;
                }
                if (s.VatType && s.VatType.ID) {
                    s.VatTypeID = s.VatType.ID;
                    s.VatType = null;
                }
                if (s.Dimensions && !s.Dimensions.ID) {
                    s.Dimensions['_createguid'] = createGuid();
                }
                if (s.Dimensions && s.Dimensions.Department) {
                    s.Dimensions.DepartmentID = s.Dimensions.Department.ID;
                    s.Dimensions.Department = null;
                }
                if (s.Dimensions && s.Dimensions.Project) {
                    s.Dimensions.ProjectID = s.Dimensions.Project.ID;
                    s.Dimensions.Project = null;
                }
                if (this.dimensionTypes) {
                    this.dimensionTypes.forEach(type => {
                        const name = 'Dimension' + type.Dimension;
                        const id = 'Dimension' + type.Dimension + 'ID';
                        if (s.Dimensions && s.Dimensions[name]) {
                            s.Dimensions[id] = s.Dimensions[name].ID;
                            s.Dimensions[name] = null;
                        }
                    });
                }
                return s;
            });
        entity.Items = items;
        let source$;
        if (entity.ID) {
            source$ = this.costAllocationService.Put(entity.ID, entity);
        } else {
            entity['_creteguid'] = createGuid();
            source$ = this.costAllocationService.Post(entity);
        }
        return source$;

    }

    canDeactivate(): boolean | Observable<boolean> {
        if (this.touched === false) {
            return true;
        }
        return this.openUnsavedChangesModal();
    }

    openUnsavedChangesModal() {
        return Observable.create(observer => {
            this.modalService.openUnsavedChangesModal().onClose.subscribe(res => {
                if (res === ConfirmActions.ACCEPT) {
                    this.saveEntity(this.currentCostAllocation).subscribe(() => {
                        this.touched = false;
                        this.ngOnInit();
                        this.toast.addToast('Fordelingsnøkler lagret', ToastType.good, ToastTime.medium);
                        observer.next(true);
                        observer.complete();
                    }, (reason) => {
                        this.toast.addToast(reason, ToastType.bad, ToastTime.medium);
                        observer.next(false);
                        observer.complete();
                    });
                } else {
                    observer.next(res !== ConfirmActions.CANCEL);
                    observer.complete();
                }
            });
        });
    }
}
