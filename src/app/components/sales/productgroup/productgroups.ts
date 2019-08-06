import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {cloneDeep} from 'lodash';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';
import {ProductCategory} from '@uni-entities';
import {ProductCategoryService, ErrorService} from '@app/services/services';

import {MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';

export * from './groupDetails/groupDetails';

@Component({
    selector: 'product-groups',
    templateUrl: './productgroups.html'
})
export class ProductGroups {
    public nodes: any[];
    private groups: ProductCategory[] = [];

    public toolbarconfig: IToolbarConfig;
    public selectedGroup: ProductCategory;

    public toolbarActions;

    treeControl: NestedTreeControl<any>;
    treeDataSource: MatTreeNestedDataSource<any>;
    hasNestedChild = (level, node) => node._children && node._children.length;

    constructor(
        private tabService: TabService,
        private productCategoryService: ProductCategoryService,
        private errorService: ErrorService,
        private modalService: UniModalService,
    ) {
        this.treeControl = new NestedTreeControl(node => Observable.of(node._children));
        this.treeDataSource = new MatTreeNestedDataSource();

        this.toolbarconfig = {
            title: 'Produktgruppe',
            subheads: [],
        };

        this.tabService.addTab({
            url: '/sales/productgroups',
            name: 'Produktgrupper',
            active: true,
            moduleID: UniModules.ProductGroup
        });

        this.loadGroups().subscribe(() => {
            this.selectGroup(this.nodes[0]);
        });
    }

    selectGroup(group) {
        this.canDeactivate().subscribe(allowed => {
            if (allowed && group) {
                this.expand(group);
                this.selectedGroup = cloneDeep(group);
                this.updateToolbar();
            } else {
                this.toolbarActions = [
                    {
                        label: 'Ny produktgruppe',
                        action: (done) => this.createGroup(null, done),
                        main: true,
                        disabled: false
                    }
                ];
            }
        });
    }

    public canDeactivate() {
        const hasChanged = this.selectedGroup && this.selectedGroup['_isDirty'];
        return Observable.of(hasChanged)
            .switchMap(dirty => dirty
                ? this.modalService.openUnsavedChangesModal().onClose
                : Observable.of(ConfirmActions.REJECT))
            .map(result => {
                if (result === ConfirmActions.ACCEPT) {
                    this.saveGroup();
                }
                return result !== ConfirmActions.CANCEL;
            });
    }

    public updateToolbar() {
        const showSaveAsMain = this.selectedGroup && this.selectedGroup['_isDirty'];
        this.toolbarActions = [
            {
                label: 'Ny produktgruppe',
                action: (done) => this.createGroup(null, done),
                main: !showSaveAsMain,
                disabled: false
            },
            {
                label: 'Lagre endringer',
                action: (done) => this.saveGroup(done),
                main: showSaveAsMain,
                disabled: !this.selectedGroup['_isDirty']
            },
            {
                label: 'Slett gruppe',
                action: (done) => this.deleteGroup(done),
                main: false,
                disabled: !this.selectedGroup
            },
        ];
    }

    expand(node) {
        const rootNode = this.getRootNode(node);
        if (rootNode) {
            this.treeControl.expandDescendants(rootNode);
        }
    }

    private getRootNode(node) {
        const parent = node.ParentID && this.groups.find(group => group.ID === node.ParentID);
        if (parent) {
            return this.getRootNode(parent);
        } else {
            return node;
        }
    }

    createGroup(parentGroup?: ProductCategory, done?) {
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

        this.groups.push(newGroup);
        this.nodes = this.buildTreeData(this.groups);

        this.treeDataSource.data = null;
        this.treeDataSource.data = this.nodes;
        this.selectGroup(newGroup);
        if (done) {
            done();
        }
    }

    saveGroup(done?): Observable<boolean> {
        const group = this.selectedGroup;
        if (!group || !group['_isDirty']) {
            done('');
            return;
        }

        const groupIndex = this.groups.findIndex(g => g.ID === this.selectedGroup.ID);

        const saveRequest = this.selectedGroup.ID > 0
            ? this.productCategoryService.Put(group.ID, group)
            : this.productCategoryService.Post(group);

        saveRequest.subscribe(savedGroup => {
            this.groups[groupIndex] = savedGroup;
            this.selectedGroup = savedGroup;
            this.nodes = this.buildTreeData(this.groups);

            this.treeDataSource.data = null;
            this.treeDataSource.data = this.nodes;
            this.selectGroup(savedGroup);
            if (done) {
                done('Lagring vellykket.');
            }
            return true;
        });
    }

    deleteGroup(done?) {
        const deleteRequest = this.selectedGroup.ID
            ? this.productCategoryService.Remove(this.selectedGroup.ID)
            : Observable.of(true);

        deleteRequest.subscribe(
            res => {
                const parent = this.selectedGroup.ParentID && this.groups.find(group => group.ID === this.selectedGroup.ParentID);

                const groupIndex = this.groups.findIndex(group => group.ID === this.selectedGroup.ID);
                this.selectedGroup = undefined;
                this.groups.splice(groupIndex, 1);
                this.nodes = this.buildTreeData(this.groups);

                this.treeDataSource.data = null;
                this.treeDataSource.data = this.nodes;
                this.selectGroup(parent || this.groups[0]);
                if (done) {
                    done('Gruppe slettet');
                }
            },
            err => {
                this.errorService.handle(err);
                done('Sletting avbrutt');
            }
        );
    }

    buildTreeData(groups: ProductCategory[]) {
        groups.forEach(group => group['_children'] = undefined);

        const buildChildTree = (parent: ProductCategory) => {
            const childNodes = groups.filter(g => g.ParentID && g.ParentID === parent.ID);
            childNodes.forEach(node => buildChildTree(node));
            parent['_children'] = childNodes;
        };

        const rootNodes = groups.filter(group => !group.ParentID);
        rootNodes.forEach(node => buildChildTree(node));

        return rootNodes;
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

                    this.nodes = this.buildTreeData(this.groups);
                    this.treeDataSource.data = this.nodes;
                } else {
                    this.groups = [];
                    this.nodes = [];
                }

                return Observable.of(true);
            });
    }
}
