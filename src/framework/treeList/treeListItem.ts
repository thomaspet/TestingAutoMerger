import {TREE_LIST_TYPE} from './treeList';

export class TreeListItem {

    expanded = false;
    title: string;
    treeListItems: Array<TreeListItem>;
    content: Object | string;
    type: TREE_LIST_TYPE;
    formFunction: Function;

    constructor(title: string) {
        this.title = title;
    }

    setContent(content: Object | string) {
        this.content = content;
        return this;
    }

    setType(type: TREE_LIST_TYPE) {
        this.type = type;
        return this;
    }

    setFormFunction(formFunction: Function) {
        this.formFunction = formFunction;
        return this;
    }

    addTreeListItem(item: TreeListItem) {
        if (!this.treeListItems) {
            this.treeListItems = [];
        }
        this.treeListItems.push(item);
        return this;
    }

    addTreeListItems(items: TreeListItem[]) {
        if (!this.treeListItems) {
            this.treeListItems = [];
        }   
        items.forEach((item) => {
            this.treeListItems.push(item);
        })
        return this;
    }

    toggle() {
        this.expanded = !this.expanded;
    }
}