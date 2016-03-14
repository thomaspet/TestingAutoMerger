import {Component, Input, ElementRef} from "angular2/core";
import {TreeListItem} from "./treeListItem";
import {TreeListComponentLoader} from "./treeListComponentLoader";

export enum TREE_LIST_TYPE { TABLE, FORM, TEXT, LIST }

@Component({
    selector: "uni-tree-list",
    templateUrl: "framework/treeList/treeList.html",
    directives: [TreeList, TreeListComponentLoader]
})

export class TreeList {

    @Input() treeListItems: Array<TreeListItem>;
    expanded: boolean = false;
    type = TREE_LIST_TYPE;
    current: any;
    count: number = 0;
    allContentDivHidden: boolean = true;

    constructor(public elementRef: ElementRef) {
    }

    showHideAll() {
        this.expanded = !this.expanded;
        this.updateExpandedState(this.treeListItems);

    }

    updateExpandedState(items) {
        items.forEach((item: any) => {
            item.expanded = this.expanded;
            if (item.treeListItems) {
                this.updateExpandedState(item.treeListItems);
            }
        })
    }
}