export class Directory {
    expanded = false;

    constructor(
        public name: string,
        public directories: Array<Directory>,
        public files: Array<any>) { }

    toggle() {
        this.expanded = !this.expanded;
    }

    getIcon() {
        if (this.expanded) {
            return '- ';
        }
        return '+ ';
    }
}