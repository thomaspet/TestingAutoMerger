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
    current: any;
    count: number = 0;

    constructor(public dynamicComponentLoader: DynamicComponentLoader, public elementRef: ElementRef) { }

    showContent(event) {
        //Slides up all .content_div
        jQuery('#tree_list').find('.content_div').slideUp(500);

        //Slides down current .content_div
        //If statement makes sure that if the current is pressed, it is not shown again
        if (this.current !== event.target || this.count === 2) {
            jQuery(event.target).next('.content_div').slideDown(500);
            this.count = 0;
        }

        this.current = event.target;
        this.count++;
        
    }

    showHideAll() {
        this.expanded = !this.expanded;
        this.revertAllExpanded(this.directories);
    }

    revertAllExpanded(dir) {
        dir.forEach((d) => {
            d.expanded = this.expanded;
            if (d.directories) {
                this.revertAllExpanded(d.directories);
            }
        })
    }
}