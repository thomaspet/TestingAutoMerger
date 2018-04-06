import {Component, ViewChild, OnInit, ChangeDetectorRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {IUniSaveAction} from '../../../../framework/save/save';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig, ICommentsConfig} from './../../common/toolbar/toolbar';
import {UniModalService, ConfirmActions} from '../../../../framework/uni-modal';
import {IUniTabsRoute} from '../../layout/uniTabs/uniTabs';
import {ProductCategory} from '../../../unientities';
import {TreeComponent} from 'angular-tree-component';
import {
    ProductCategoryService,
    ErrorService,
    StatisticsService
} from '../../../services/services';

export * from './groupDetails/groupDetails';

declare const _; // lodash

@Component({
    selector: 'product-groups',
    templateUrl: './productgroups.html'
})

export class ProductGroups {
    @ViewChild('tree') private treeComponent: TreeComponent;

    private nodes: any[];
    private groups: ProductCategory[] = [];
    private activeProductGroupID: any = '';

    private toolbarconfig: IToolbarConfig;
    private commentsConfig: ICommentsConfig;
    private contextMenuItems: any;

    private idParam: number;
    private selectedGroup: ProductCategory;

    private init: number;

    public saveactions: IUniSaveAction[] = [{
        label: 'Lagre',
        action: (completeEvent) => {
            this.saveProductGroup().subscribe(success => {
                completeEvent('');
                this.router.navigateByUrl('/sales/productgroups/' + this.selectedGroup.ID);
            });
        },
        main: true,
        disabled: false
    }];

    public treeoptions: any = {
        displayField: 'Name',
        childrenField: '_children',
        idField: 'ID',
        actionMapping: {
            mouse: {
                click: (tree, node, $event) => {
                    const group = node.data;
                    if (group) {
                        this.router.navigateByUrl('/sales/productgroups/' + group.ID);
                    }
                }
            }
        }
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private tabService: TabService,
        private productCategoryService: ProductCategoryService,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private modalService: UniModalService,
        private cdr: ChangeDetectorRef
    ) {
        this.toolbarconfig = {
            title: 'Produktgruppe',
            subheads: [],
        };

        this.updateTabInfo();

        this.contextMenuItems = [{
            label: 'Slett',
            disabled: () => !this.selectedGroup,
            action: () => this.deleteGroup()
        }];

        this.loadGroups().subscribe(success => {
            this.route.paramMap.subscribe(paramMap => {
                this.idParam = parseInt(paramMap.get('id'), 10);
                this.updateTabInfo();

                // Focus and set selected group
                setTimeout(() => {
                    const node = this.idParam >= 0
                        ? this.treeComponent.treeModel.getNodeById(this.idParam)
                        : this.treeComponent.treeModel.getFirstRoot();

                    if (node && node.data) {
                        this.selectedGroup = node.data;
                        node.setActiveAndVisible();

                        if (!this.idParam) {
                            this.router.navigateByUrl('/sales/productgroups/' + node.data.ID);
                        }
                    }
                });
            });
        });
    }

    public canDeactivate() {
        if (!this.selectedGroup || !this.selectedGroup['_isDirty']) {
            return Observable.of(true);
        }

        return this.modalService.openUnsavedChangesModal().onClose.switchMap(response => {
            if (response === ConfirmActions.ACCEPT) {
                return this.saveProductGroup();
            } else if (response === ConfirmActions.REJECT) {
                this.selectedGroup = undefined;
                this.idParam = undefined;
                this.nodes = this.createTree(_.cloneDeep(this.groups));
                this.treeComponent.treeModel.nodes = this.nodes;
                this.treeComponent.treeModel.update();

                return Observable.of(true);
            } else {
                return Observable.of(false);
            }
        });
    }

    private updateTabInfo() {
        let url = '/sales/productgroups';
        if (this.idParam) {
            url += '/' + this.idParam;
        }

        this.tabService.addTab({
            url: url,
            name: 'Produktgrupper',
            active: true,
            moduleID: UniModules.ProductGroup
        });
    }

    private createGroup(parentGroup?: ProductCategory) {
        if (!this.treeComponent) {
            return;
        }

        const guid = this.productCategoryService.getNewGuid();
        const newGroup: any = {
            ID: 0,
            ParentID: parentGroup && parentGroup.ID || 0,
            Name: 'Ny produktgruppe',
            _isDirty: true,
            _createguid: guid,
            _guid: guid,
            _children: []
        };

        if (parentGroup) {
            const node = this.treeComponent.treeModel.getNodeById(parentGroup.ID);
            if (!node.data['_children']) {
                node.data['_children'] = [];
            }

            node.data['_children'].push(newGroup);
        } else {
            this.nodes.push(newGroup);
            this.treeComponent.nodes = this.nodes;
        }

        const navigationPromise = this.idParam
            ? this.router.navigateByUrl('/sales/productgroups/0')
            : Promise.resolve(true);

        navigationPromise.then(() => {
            this.selectedGroup = newGroup;
            this.treeComponent.treeModel.update();

            setTimeout(() => {
                const newNode = this.treeComponent.treeModel.getNodeById(0);
                if (newNode) {
                    newNode.setActiveAndVisible();
                }
            });
        });
    }

    private deleteGroup() {
        if (!this.selectedGroup) {
            return;
        }

        if (this.selectedGroup.ID) {
            this.productCategoryService.Remove(this.selectedGroup.ID, null)
                .switchMap(res => this.loadGroups())
                .subscribe(
                    success => {
                        this.selectedGroup = undefined;
                        this.idParam = undefined;
                        this.router.navigateByUrl('/sales/productgroups');
                    },
                    err => this.errorService.handle(err)
                );
        } else {
            this.selectedGroup = undefined;
            this.idParam = undefined;
            this.router.navigateByUrl('/sales/productgroups');

            this.nodes = this.createTree(_.cloneDeep(this.groups));
            this.treeComponent.treeModel.update();
        }
    }

    private createTree(
        groups: ProductCategory[],
        parent: Partial<ProductCategory> = {ID: 0},
        tree = []
    ) {
        const children = _.filter(groups, child => child.ParentID === parent.ID);
        if (!_.isEmpty(children)) {
            if (parent.ID) {
                parent['_children'] = children;
            } else {
                tree = children;
            }

            _.each(children, (child) => this.createTree(groups, child));
        }

        return tree;
    }

    public loadGroups() {
        return this.productCategoryService.GetAll(null)
            .catch(err => {
                this.errorService.handle(err);
                return Observable.of([]);
            })
            .switchMap(groups => {
                if (groups && groups.length) {
                    this.groups = groups.map(group => {
                        if (!group.Name) {
                            group.Name = 'Mangler navn';
                        }

                        group['_guid'] = this.productCategoryService.getNewGuid();
                        return group;
                    });

                    this.nodes = this.createTree(_.cloneDeep(this.groups));
                } else {
                    this.groups = [];
                    this.nodes = [];
                }

                return Observable.of(true);
            });
    }

    private saveProductGroup(): Observable<boolean> {
        const group = this.selectedGroup;
        if (!group || !group['_isDirty']) {
            return Observable.of(true);
        }

        const saveRequest = this.selectedGroup.ID > 0
            ? this.productCategoryService.Put(group.ID, group)
            : this.productCategoryService.Post(group);

        return saveRequest.switchMap(savedGroup => {
            this.selectedGroup.ID = savedGroup.ID;
            this.selectedGroup['_isDirty'] = false;
            return this.loadGroups();
        });
    }
}
