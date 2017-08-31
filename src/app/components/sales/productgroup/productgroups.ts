import {Component, ViewChild, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {IUniSaveAction} from '../../../../framework/save/save';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from './../../common/toolbar/toolbar';
import {UniModalService, ConfirmActions} from '../../../../framework/uniModal/barrel';
import {IUniTabsRoute} from '../../layout/uniTabs/uniTabs';
import {ProductCategory} from '../../../unientities';
import {TreeComponent} from 'angular-tree-component';
import {
    ProductCategoryService,
    ErrorService,
    StatisticsService
} from '../../../services/services';

declare const _; // lodash

@Component({
    selector: 'product-groups',
    templateUrl: './productgroups.html'
})

export class ProductGroups implements OnInit {
    @ViewChild('tree') private treeComponent: TreeComponent;

    private nodes: any[] = [];
    private groups: ProductCategory[] = [];
    private parentId: number;
    private activeProductGroupID: any = '';

    private toolbarconfig: IToolbarConfig;
    private commentsConfig: any;
    private contextMenuItems: any;
    private childRoutes: IUniTabsRoute[];

    private saveactions: IUniSaveAction[] = [
         {
             label: 'Lagre',
             action: (completeEvent) => this.saveProductGroup(completeEvent),
             main: true,
             disabled: false
         }
    ];

    private treeoptions = {
        // allowDrag: true, // TODO activate later when functionality is available
        displayField: 'Name',
        childrenField: '_children',
        idField: 'ID'
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
        this.setupToolbar();

        this.childRoutes = [
            { name: 'Gruppedetaljer', path: 'groupDetails' },
            { name: 'Produkter i gruppe', path: 'productsInGroup' }
        ];

        this.contextMenuItems = [{
            label: 'Slett',
            disabled: () => !this.activeProductGroupID,
            action: () => this.deleteProductGroup(this.activeProductGroupID)
        }];
    }

    public ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.activeProductGroupID = +params['productGroupID'];
            if (this.activeProductGroupID > 0) {
                this.productCategoryService.Get(this.activeProductGroupID).subscribe((group) => {
                    this.productCategoryService.currentProductGroup.next(group);
                });
            }
        });

        if (!this.activeProductGroupID) {
          if (!this.nodes) {
              this.productCategoryService.setNew();
          }
      }
    }

    private addTab() {
        this.tabService.addTab({
            url: '/sales/productgroups/groupDetails',
            name: 'Produktgrupper',
            active: true,
            moduleID: UniModules.ProductGroup
        });
    }

    private deleteProductGroup(id: number) {
        this.productCategoryService.Remove(id, null).subscribe(res => {
            this.clearAndRouteToStart();
            this.loadGroups();
        });
    }

    private nodeDeactivated(event: any) {
        this.clearAndRouteToStart();
    }

    private clearAndRouteToStart() {
        this.treeComponent.treeModel.setFocusedNode(null);
        this.activeProductGroupID = '';
        this.toolbarconfig.title = 'Ny produktgruppe';
        this.toolbarconfig.subheads = [];
        this.commentsConfig = {};
        this.productCategoryService.setNew();
        this.router.navigateByUrl('/sales/productgroups/groupDetails');
    }

    private nodeActive(event: any) {
        let node = event.node;
        let subheads = [];

        this.toolbarconfig.title = node.data.Name;
        this.productCategoryService.currentProductGroup.next(node.data);
        this.activeProductGroupID = node.data.ID;
        this.parentId = node.data.ParentID;

        if (node.parent.data.Name) {
            subheads.push({title: 'i gruppen ' + node.parent.data.Name});
        }
        this.toolbarconfig.subheads = subheads;

        this.commentsConfig = {
            entityType: 'ProductCategory',
            entityID: node.data.ID
        };
        this.setQueryParamAndNavigate(this.activeProductGroupID);
    }

    public setQueryParamAndNavigate(id: number) {
        let url = this.router.url.split('?')[0];
        this.router.navigate([url], {
            queryParams: {
                productGroupID: id
            }
        });
    }

    private setupToolbar() {
        this.toolbarconfig = {
            title: 'Produktgruppe',
            subheads: [],
            navigation: {
                add: () => this.addProductGroup()
            }
        };
    }

    private addProductGroup() {
        let subheads = [];
        let subheadGroup = this.productCategoryService.currentProductGroup.value.Name;

        this.toolbarconfig.title = 'Ny produktgruppe';
        this.parentId = this.productCategoryService.currentProductGroup.value.ID;

        if (subheadGroup) {
            subheads.push({title: 'i gruppen ' + subheadGroup});
        }
        this.toolbarconfig.subheads = subheads;

        this.productCategoryService.setNew();
        this.router.navigateByUrl('/sales/productgroups/groupDetails?productGroupID=0');
    }

    public canDeactivate(): Observable<boolean> {
        return !this.productCategoryService.isDirty
            ? Observable.of(true)
            : this.modalService
                .openUnsavedChangesModal()
                .onClose
                .map(result => {
                    if (result === ConfirmActions.ACCEPT) {
                        this.saveProductGroup(() => {});
                    }

                    return result !== ConfirmActions.CANCEL;
                });
    }

    private treeStructureToNodes(tree, root = null): any {
        if (root === null) { root = tree.find(x => x.ParentID === 0); }

        if (root !== null) {
            var children = tree.filter(x => x.ParentID === root.ID);
            if (children !== null) {
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
            let root = groups.find(x => x.ParentID === 0);
            this.parentId = root.ID;
            this.nodes = this.treeStructureToNodes(groups);

            if (this.activeProductGroupID) {
                setTimeout(() => {
                    const currentNode = this.treeComponent.treeModel.getNodeById(this.activeProductGroupID);

                    currentNode.ensureVisible().focus().toggleActivated();
                    this.toolbarconfig.title = currentNode.data.Name;

                    if (currentNode.parent.data.Name) {
                        this.toolbarconfig.subheads = [{title: 'i gruppen ' + currentNode.parent.data.Name}];
                    }
                });
            }
        }, err => this.errorService.handle(err));
    }

    private saveProductGroup(completeEvent) {
        let productgroup = this.productCategoryService.currentProductGroup.value;

        if (!productgroup || !this.productCategoryService.isDirty || !productgroup.Name) {
            return completeEvent('Feil oppsto ved lagring');
        }

        if (productgroup.ID > 0) {
            this.productCategoryService.Put(productgroup.ID, productgroup).subscribe(
                (group) => {
                    this.productCategoryService.isDirty = false;
                    completeEvent('Produktgruppe lagret');
                    this.loadGroups();
                    this.setupToolbar();
                    this.productCategoryService.setNew();
                },
                (err) => {
                    completeEvent('Feil oppsto ved lagring');
                    this.errorService.handle(err);
                }
            );
        } else {
            if (this.activeProductGroupID !== '') {
                productgroup.ParentID = this.parentId;
            }
            this.productCategoryService.Post(productgroup)
                .subscribe(
                    (newGroup) => {
                        this.productCategoryService.isDirty = false;
                        completeEvent('Produktgruppe lagret');
                        this.loadGroups();
                        this.productCategoryService.setNew();
                    },
                    (err) => {
                        completeEvent('Feil oppsto ved lagring');
                        this.errorService.handle(err);
                    }
                );
        }
    }
}
