export class ChangeMap {
    
    items = [];
    removables:ChangeMap;
    
    clear() {
        this.items.length = 0;
    }
    
    remove(key:any) {
        var ix = this.indexOf(key);
        if (ix>=0) {
            this.items.splice(ix, 1);
        }
    }
    
    add(key:any, value:any) {
        var ix = this.indexOf(key);
        if (ix>=0) {
            this.items[ix].value = value; // replace
        } else {
            value._rowIndex = key;
            this.items.push({key:key, value: value }); // add
        }
    }

    addRemove(key:any, value:any, adjustDownOtherKeys = false) {
        this.removables = this.removables || new ChangeMap();
        this.removables.add(key, value);
        if (adjustDownOtherKeys) {
            for (var i=0; i<this.items.length; i++) {
                if (this.items[i].key > key) {
                    this.items[i].key--;
                }
            }
        }        
    }

    getRemovables(): Array<any> {
        if (!this.removables) return [];
        return this.removables.getValues();        
    }
    
    getValues(): Array<any> {
        var values = [];
        for (var i=0; i<this.items.length; i++) 
            values.push(this.items[i].value);
        return values;
    }
    
    getKeys(): Array<any> {
        var keys = [];
        for (var i=0; i<this.items.length; i++) 
            keys.push(this.items[i].key);
        return keys;        
    }
    
    indexOf(key:any):number  {
        for (var i=0; i<this.items.length;i++) {
            if (this.items[i].key === key) {
                return i;
            }
        }               
        return -1; 
    }
    
    exists(key:any):boolean | any {
        return this.indexOf(key)>=0;
    }
    
    get(key:any):any {
        var ix = this.indexOf(key);
        if (ix>=0) {
            return this.items[ix];
        }
    }    
    
}