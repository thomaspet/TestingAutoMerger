import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { IUniSaveAction } from '@uni-framework/save/save';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { CostAllocation } from '@app/unientities';
import { CostAllocationService } from '@app/services/accounting/costAllocationService';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { createGuid } from '@app/services/common/dimensionService';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { ErrorService } from '@app/services/common/errorService';


const EXPAND_ITEMS = [
    'Items',
    'Items.Account',
    'Items.VatType',
    'Items.Dimensions',
    'Items.Dimensions.Department',
];

@Component({
    selector: 'uni-cost-allocation',
    templateUrl: './cost-allocation.html',
    styles: [`.splitview_list, .splitview_detail { width: 100%;}`]
})
export class UniCostAllocation implements OnInit, OnDestroy {
    saveActions: IUniSaveAction[];
    toolbarconfig: IToolbarConfig;
    costAllocationItems: CostAllocation[] = [];
    selectedIndex = -1;
    currentCostAllocation = new CostAllocation();
    _onDestroy = new Subject();

    constructor(
        public tabService: TabService,
        public costAllocationService: CostAllocationService,
        public toastService: ToastService,
        public errorService: ErrorService,
        public cd: ChangeDetectorRef) {
        this.tabService.addTab({
            url: '/accounting/costallocation',
            name: 'Fordelingsnøkler',
            active: true,
            moduleID: UniModules.CostAllocation
        });
        this.saveActions = this.updateSaveActions(false);
        this.toolbarconfig = <IToolbarConfig>{
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
        if (this.selectedIndex === -1) {
            this.costAllocationService.GetNewEntity(EXPAND_ITEMS)
                .pipe(takeUntil(this._onDestroy))
                .subscribe(entity => {
                    this.saveActions = this.updateSaveActions(false);
                    this.currentCostAllocation = entity;

                });
        } else {
            this.costAllocationService.Get(this.costAllocationItems[this.selectedIndex].ID, EXPAND_ITEMS)
                .pipe(takeUntil(this._onDestroy))
                .subscribe(entity => {
                    this.saveActions = this.updateSaveActions(false);
                    this.currentCostAllocation = entity;

                });
        }
        this.costAllocationService.GetAll()
            .pipe(takeUntil(this._onDestroy))
            .subscribe(items => {
                this.saveActions = this.updateSaveActions(false);
                this.costAllocationItems = items;
            });
    }

    ngOnDestroy() {
        this._onDestroy.next();
    }

    onDetailsTouched() {
        this.saveActions = this.updateSaveActions(true);
    }

    updateSaveActions(touched: boolean = false) {
        return [
            {
                label: 'Lagre',
                action: done => {
                    let source$;
                    const copyOfCostAllocation = Object.assign({}, this.currentCostAllocation);
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
                                if (s.Dimensions.Department) {
                                    s.Dimensions.DepartmentID = s.Dimensions.Department.ID;
                                    s.Dimensions.Department = null;
                                }
                            }
                            return s;
                        });
                    copyOfCostAllocation.Items = items;
                    if (copyOfCostAllocation.ID) {
                        source$ = this.costAllocationService.Put(copyOfCostAllocation.ID, copyOfCostAllocation);
                    } else {
                        copyOfCostAllocation['_creteguid'] = createGuid();
                        source$ = this.costAllocationService.Post(copyOfCostAllocation);
                    }
                    source$.subscribe(entity => {
                        // this.toastService.addToast('Entity Lagret', ToastType.good, 500);
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
        this.costAllocationService.Get(data.row.ID, EXPAND_ITEMS).subscribe(entity => {
            this.currentCostAllocation = entity;
            this.selectedIndex = data.index;
        });
    }

    onDeleteCostAllocation(selectedCostAllocation: CostAllocation) {
        this.costAllocationService.Remove(selectedCostAllocation.ID, selectedCostAllocation).subscribe((result) => {
            this.ngOnInit();
        }, (error) => this.errorService.handle(error));
    }
}
