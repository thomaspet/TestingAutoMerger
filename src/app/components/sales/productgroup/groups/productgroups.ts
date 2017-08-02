import {Component, Input, ViewChild, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, FieldType, UniFieldLayout} from '../../../../../framework/ui/uniform/index';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {UniModalService} from '../../../../../framework/uniModal/barrel';
import {ProductCategory} from '../../../../unientities';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../../framework/ui/unitable/index';
import {
    ProductCategoryService,
    ErrorService,
    StatisticsService
} from '../../../../services/services';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';
declare const _; // lodash

@Component({
    selector: 'product-groups',
    templateUrl: './productgroups.html'
})
export class ProductGroups implements OnInit {
    @Input()
    public groupId: number;

    @ViewChild(UniForm)
    public form: UniForm;

    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public group$: BehaviorSubject<ProductCategory> = new BehaviorSubject(new ProductCategory());

    public productsConfig: UniTableConfig;
    public products$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    private nodes: any[] = [];
    private groups: ProductCategory[] = [];

    private parentId: number;
    private isDirty: boolean;
    private toolbarconfig: IToolbarConfig;

    private saveactions: IUniSaveAction[] = [
         {
             label: 'Lagre',
             action: (completeEvent) => this.saveProductGroup(completeEvent),
             main: true,
             disabled: false
         }
    ];

    private treeoptions = {
        //allowDrag: true, // TODO activate later when functionality is available
        displayField: 'Name',
        childrenField: '_children'
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private tabService: TabService,
        private productCategoryService: ProductCategoryService,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private modalService: UniModalService
    ) {
        this.addTab();
        this.loadGroups();
    }

    public ngOnInit() {
        this.fields$.next(this.getComponentFields());
        this.setupTable();

        this.route.params.subscribe(params => {
            if (this.groupId > 0) { this.parentId = this.groupId; }
            this.groupId = +params['id'];
            if (this.groupId > 0) {
                this.productCategoryService.Get(this.groupId).subscribe((group) => {
                    this.group$.next(group);
                    this.setRelatedProducts(group);
                    this.setupToolbar();
                });
            } else {
                this.group$.next(new ProductCategory());
                this.setupToolbar();
            }
        });
    }

    private addTab() {
        this.tabService.addTab({
            url: '/sales/productgroups',
            name: 'Produktgrupper',
            active: true,
            moduleID: UniModules.ProductGroup
        });
    }

    private setRelatedProducts(group) {
        this.statisticsService.GetAllUnwrapped(`model=Product&select=PartName,Name,CostPrice,PriceExVat,Unit&join=Product.ID eq ProductCategoryLink.ProductID&filter=ProductCategoryLink.ProductCategoryID eq ${group.ID}`)
            .subscribe(products => {
                this.products$.next(products);
            });
    }

    private nodeMoved(event) {
        console.log("MOVED", event);
    }

    private nodeActive(event) {
        let node = event.node;
        this.router.navigateByUrl('/sales/productgroups/' + node.data.ID);
    }

    private change(event) {
        this.isDirty = true;
    }

    private setupToolbar() {
        let subheads = [];
        if (this.groupId > 0) {
            subheads.push({title: 'Produktgruppe ' + this.group$.getValue().Name});
        }

        this.toolbarconfig = {
            title: this.groupId > 0 ? 'Produktgruppe' : 'Ny produktgruppe',
            subheads: subheads,
            navigation: {
                add: () => this.addProductGroup()
            }
        };
    }

    private addProductGroup() {
        this.router.navigateByUrl('/sales/productgroups/0');
    }

    public canDeactivate(): boolean | Observable<boolean> {
        if (!this.isDirty) {
            return true;
        }

        return this.modalService.openUnsavedChangesModal()
            .onClose
            .map(canDeactivate => {
                if (!canDeactivate) {
                    this.addTab();
                }

                return canDeactivate;
            });
    }

    private treeStructureToNodes(tree, root = null): any {
        if (root == null) { root = tree.find(x => x.ParentID == 0); }

        if (root != null) {
            var children = tree.filter(x => x.ParentID == root.ID);
            if (children != null) {
                root['_children'] = [];
                children.forEach(x => {
                    x['_children'] = this.treeStructureToNodes(tree, x);
                    root['_children'].push(x);
                });
            }
            return children;
        }
        return [];
    }

    public loadGroups() {
        this.productCategoryService.GetAll('orderby=Lft asc').subscribe(groups => {
            this.groups = groups;
            let root = groups.find(x => x.ParentID == 0);
            this.parentId = root.ID;
            this.nodes = this.treeStructureToNodes(groups);
        }, err => this.errorService.handle(err));
    }

    private saveProductGroup(completeEvent) {
        let productgroup = this.group$.getValue();

        if (this.groupId > 0) {
            this.productCategoryService.Put(productgroup.ID, productgroup).subscribe(
                (group) => {
                    this.isDirty = false;
                    completeEvent('Produktgruppe lagret');
                    this.loadGroups();
                    this.setupToolbar();
                },
                (err) => {
                    completeEvent('Feil oppsto ved lagring');
                    this.errorService.handle(err);
                }
            );
        } else {
            productgroup.ParentID = this.parentId;
            this.productCategoryService.Post(productgroup)
                .subscribe(
                    (newGroup) => {
                        this.isDirty = false;
                        completeEvent('Produktgruppe lagret');
                        this.loadGroups();
                        this.router.navigateByUrl(`/sales/productgroups/${newGroup.ID}`);
                    },
                    (err) => {
                        completeEvent('Feil oppsto ved lagring');
                        this.errorService.handle(err);
                    }
                );
        }
    }

    private getComponentFields(): UniFieldLayout[] {
        return [
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Gruppenavn',
                Property: 'Name',
                Placeholder: 'Navn på produktgruppen'
            },
            <any>{
                FieldType: FieldType.TEXTAREA,
                Label: 'Beskrivelse',
                Property: 'Description',
                Placeholder: 'Beskrivelse av produktgruppe'
            }
        ];
    }

    private setupTable() {
        let numberCol = new UniTableColumn('ProductPartName', 'Produktnr', UniTableColumnType.Text);
        let nameCol = new UniTableColumn('ProductName', 'Navn', UniTableColumnType.Text);
        let unitCol = new UniTableColumn('ProductUnit', 'Enhet', UniTableColumnType.Text).setWidth('4rem');
        let costpriceCol = new UniTableColumn('ProductCostPrice', 'Innpris eks.mva', UniTableColumnType.Money);
        let priceexvatCol = new UniTableColumn('ProductPriceExVat', 'Utpris eks.mva', UniTableColumnType.Money);

        this.productsConfig = new UniTableConfig(false, false, 25)
            .setColumns([numberCol, nameCol, unitCol, costpriceCol, priceexvatCol])
            .setSearchable(true);
    }
}
