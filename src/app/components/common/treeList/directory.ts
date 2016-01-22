export class Directory {

    expanded = false;
    checked = false;

    constructor(
        public name: string,
        public directories: Array<Directory>,
        public files: Array<string>,
        public config?: Object) { }

    toggle() {
        this.expanded = !this.expanded;
    }

    getIcon() {
        if (this.expanded) {
            return '- ';
        }
        return '+ ';
    }

    check() {
        this.checked = !this.checked;
        this.checkRecursive(this.checked);
    }

    checkRecursive(state: boolean) {
        this.directories.forEach(d => {
            d.checked = state;
            d.checkRecursive(state);
        });
    }
}