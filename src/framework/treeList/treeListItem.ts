import {TREE_LIST_TYPE} from "./treeList";
import guid = kendo.guid;

export class TreeListItem {

    expanded = false;
    title: string;
    treeListItems: Array<TreeListItem>;
    content: Object | string;
    type: TREE_LIST_TYPE;
    formSubmitCallback: (model?: any) => void;
    guid: string;

    constructor(title: string = "") {
        this.title = title;
        this.guid = 'id-' + guid();
    }

    setContent(content: Object | string) {
        this.content = content;
        return this;
    }

    setType(type: TREE_LIST_TYPE) {
        this.type = type;
        return this;
    }

    setFormSubmitCallback(submitCallback: (model?: any) => void) {
        this.formSubmitCallback = submitCallback;
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
        items.forEach((item: TreeListItem) => {
            this.treeListItems.push(item);
        });
        return this;
    }

}