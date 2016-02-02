import {Component, Input, ElementRef} from 'angular2/core';
import {TreeListItem} from './treeListItem';
import {TreeListComponentLoader} from './treeListComponentLoader';

declare var jQuery;

export enum TREE_LIST_TYPE { TABLE, FORM, TEXT, LIST }

@Component({
    selector: 'uni-tree-list',
    templateUrl: 'framework/treeList/treeList.html',
    directives: [TreeList, TreeListComponentLoader]
})

export class TreeList {
    
    @Input() treeListItems: Array<TreeListItem>;
    expanded: boolean = false;
    type = TREE_LIST_TYPE;
    current: any;
    count: number = 0;

    constructor(public elementRef: ElementRef) { }

    showContent(event) {
        //Slides up all .content_div
        jQuery('.tree_list').find('.content_div').slideUp(500);

        //Slides down current .content_div
        if (this.current !== event.target || this.count === 2) {
            jQuery(event.target).next('.content_div').slideDown(500);
            this.count = 0;
        }

        this.current = event.target;
        this.count++;
    }

    showHideAll() {
        this.expanded = !this.expanded;
        this.revertAllExpanded(this.treeListItems);
    }

    revertAllExpanded(items) {
        items.forEach((item) => {
            item.expanded = this.expanded;
            if (item.treeListItems) {
                this.revertAllExpanded(item.treeListItems);
            }
        })
    }
}