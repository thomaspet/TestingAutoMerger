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
    compRef: any;
    current;
    count = 0;

    constructor(public dynamicComponentLoader: DynamicComponentLoader, public elementRef: ElementRef) { }

    showContent(event) {
        //Slides up all .content_div
        jQuery('#tree_list').find('.content_div').slideUp(500);

        //Slides down current .content_div
        jQuery(event.target).next('.content_div').slideDown(500);
    }
}