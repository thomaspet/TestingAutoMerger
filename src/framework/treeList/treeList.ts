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
    allContentDivHidden: boolean = true;

    constructor(public elementRef: ElementRef) { }

    showHideContent(event) {
        jQuery(event.target).next('.content_div').slideToggle(500);
    }

    showHideAll() {
        this.expanded = !this.expanded;
        
        //Slides all content up if user closes the whole list.. If this is not a good idea, just remove!!
        if (!this.expanded) {
            jQuery('.tree_list').find('.content_div').slideUp(500);
        }

        this.updateExpandedState(this.treeListItems);
        
    }

    updateExpandedState(items) {
        items.forEach((item) => {
            item.expanded = this.expanded;
            if (item.treeListItems) {
                this.updateExpandedState(item.treeListItems);
            }
        })
    }
}