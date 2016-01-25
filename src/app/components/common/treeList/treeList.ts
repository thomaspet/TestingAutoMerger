import {Component, Input, DynamicComponentLoader, ElementRef} from 'angular2/core';
import {Directory} from './directory';
import {TreeListComponentLoader} from './treeListComponentLoader';

declare var jQuery;

@Component({
    selector: 'uni-tree-list',
    templateUrl: 'app/components/common/treeList/treeList.html',
    directives: [TreeList, TreeListComponentLoader]
})

export class TreeList {
    
    @Input() directories: Array<Directory>;
    expanded: boolean = false;

    constructor(public dynamicComponentLoader: DynamicComponentLoader, public elementRef: ElementRef) { }

    showContent(event) {
        //Slides up all .content_div
        jQuery('#tree_list').find('.content_div').slideUp(500);
        //Slides down current .content_div
        jQuery(event.target).next('.content_div').slideDown(500);
    }

    showHideAll() {
        this.expanded = !this.expanded;
        this.revertAllExpanded(this.directories);
    }

    revertAllExpanded(dir) {
        //Needs to set explicitly true or false??
        dir.forEach((d) => {
            d.expanded = this.expanded;
            if (d.directories) {
                this.revertAllExpanded(d.directories);
            }
        })
    }
}