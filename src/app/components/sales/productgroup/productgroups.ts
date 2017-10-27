import {Component, ViewChild, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {IUniSaveAction} from '../../../../framework/save/save';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig, ICommentsConfig} from './../../common/toolbar/toolbar';
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
    private commentsConfig: ICommentsConfig;
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
        this.setupToolbar();

        this.childRoutes = [
            { name: 'Gruppedetaljer', path: 'groupDetails' },
        ];

        this.contextMenuItems = [{
            label: 'Slett',
            disabled: () => !this.activeProductGroupID,
            action: () => this.deleteProductGroup(this.activeProductGroupID)
        }];
    }

    public ngOnInit() {
        this.loadGroups();

        this.route.queryParams.subscribe(params => {
            this.activeProductGroupID = +params['productGroupID'];
            if (this.activeProductGroupID > 0) {
                this.productCategoryService.Get(this.activeProductGroupID).subscribe((group) => {
                    setTimeout(() => {
                        let currentNode = this.treeComponent.treeModel.getNodeById(this.activeProductGroupID);

                        this.productCategoryService.currentProductGroup.next(group);

                        this.toolbarconfig.title = group.Name;
                        this.toolbarconfig.subheads = [];

                        this.commentsConfig = {
                            entityType: 'ProductCategory',
                            entityID: group.ID
                        };

                        if (currentNode) {
                            if (currentNode.parent.data.Name) {
                                this.setSubheadTitle(currentNode.parent.data.Name);
                            }

                            if (currentNode.isActive) {
                                return;
                            }
                            return currentNode.ensureVisible().toggleActivated();
                        }
                    });
                });
                return;
            } else if (this.activeProductGroupID === 0) {
                this.clearInfo();
                if (this.parentId) {
                    let currentNode = this.treeComponent.treeModel.getNodeById(this.parentId);

                    this.setSubheadTitle(currentNode.data.Name);
                }
                return;
            }
            return this.clearInfo();
        });
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
            this.loadGroups();
            this.router.navigateByUrl('/sales/productgroups/groupDetails');
        });
    }

    private clearInfo() {
        this.treeComponent.treeModel.setFocusedNode(null);
        this.toolbarconfig.title = 'Ny produktgruppe';
        this.toolbarconfig.subheads = [];
        this.commentsConfig = null;
        this.productCategoryService.setNew();
        this.productCategoryService.currentProductGroup.next(null);
    }

    private nodeActive(event: any) {
        let node = event.node;

        this.parentId = node.parent.data.ID;
        this.setQueryParamAndNavigate(node.data.ID);
    }

    public setQueryParamAndNavigate(id: number) {
        let url = this.router.url.split('?')[0];

        if (this.activeProductGroupID === id) {
            return;
        }
        this.router.navigate([url], {
            queryParams: {
                productGroupID: id
            },
            skipLocationChange: false
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

    private setSubheadTitle(name: string) {
        if (name) {
            this.toolbarconfig.subheads = [{title: 'i gruppen ' + name}];
        }
    }

    private addProductGroup() {
        this.parentId = this.productCategoryService.currentProductGroup.value.ID;
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
                    this.clearInfo();
                },
                (err) => {
                    completeEvent('Feil oppsto ved lagring');
                    this.errorService.handle(err);
                }
            );
        } else {
            productgroup.ParentID = 1;
            if (this.parentId && this.parentId !== 1) {
                productgroup.ParentID = this.parentId;
            }
            this.productCategoryService.Post(productgroup)
                .subscribe(
                    (newGroup) => {
                        this.productCategoryService.isDirty = false;
                        completeEvent('Produktgruppe lagret');
                        this.loadGroups();
                        this.clearInfo();
                    },
                    (err) => {
                        completeEvent('Feil oppsto ved lagring');
                        this.errorService.handle(err);
                    }
                );
        }
    }
}
