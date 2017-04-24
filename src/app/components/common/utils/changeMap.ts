export class ChangeMap {
    
    public items: Array<any> = [];
    public removables: ChangeMap;
    
    public clear() {
        this.items.length = 0;
        if (this.removables) { this.removables.clear(); }
    }
    
    public remove(key: any, adjustDownOtherKeys: boolean) {
        var ix = this.indexOf(key);
        if (ix >= 0) {
            this.items.splice(ix, 1);
            // adjust indexes ?
            if (adjustDownOtherKeys) {
                for (var i = 0; i < this.items.length; i++) {
                    if (this.items[i].key > key) {
                        this.items[i].key--;
                    }
                }
            } 
        }
    }
    
    public add(key: any, value: any) {
        var ix = this.indexOf(key);
        if (ix >= 0) {
            this.items[ix].value = value; // replace
        } else {
            value._rowIndex = key;
            this.items.push({key: key, value: value }); // add
        }
    }

    public addRemove(key: any, value: any) {
        this.removables = this.removables || new ChangeMap();
        this.removables.add(key, value);
    }

    public getRemovables(): Array<any> {
        if (!this.removables) { return []; }
        return this.removables.getValues();        
    }
    
    public getValues(): Array<any> {
        var values = [];
        for (var i = 0; i < this.items.length; i++) { 
            values.push(this.items[i].value);
        }
        return values;
    }
    
    public getKeys(): Array<any> {
        var keys = [];
        for (var i = 0; i < this.items.length; i++) {
            keys.push(this.items[i].key);
        }
        return keys;        
    }
    
    private indexOf(key: any): number  {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].key === key) {
                return i;
            }
        }               
        return -1; 
    }
    
    public exists(key: any): boolean | any {
        return this.indexOf(key) >= 0;
    }
    
    public get(key: any): any {
        var ix = this.indexOf(key);
        if (ix >= 0) {
            return this.items[ix];
        }
    }    
    
}
