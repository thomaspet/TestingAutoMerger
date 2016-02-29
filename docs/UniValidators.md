# UniValidators

UniValidators return an Angular2 Control validator like:

```ts
function contains(value: string, key: string) {
    return function validator(c: Control): any {
        // VALIDATION STUFF
        var validationResult : boolean = validate();
        
        let error = {};
        error[key] = validationResult; //true or false;
        return error;
    }
}
```

# String validators

- `contains(value: string, key: string)`
    return true if control contains value as substring
    
- `eqLength(value: string, key: string)`
    return true if control length is equal to value
    
- `maxLength(value: string, key: string)`
    return true if control length is lower than value
    
- `minLength(value: string, key: string)`
    return true if control length is higher than value
    
- `match(value: string, key: string)`
    return true if control matches value as Regular Expression

# Logic validators

- `greaterThan(value: string, key: string)`
    return true if control is greater than value
    
- `lowerThan(value: string, key: string)`
    return true if control is lower than value
    
- `greaterEqualThan(value: string, key: string)`
    return true if control is equal or greater than value
    
- `lowerEqualThan(value: string, key: string)`
    return true if control is equal or lower than value
    
- `equalTo(value: string, key: string)`
    return true if control is equal to value
    
- `notEqualTo(value: string, key: string)`
    return true if control is not equal to value
    
    
# input
- `required(value: string, key: string)`
    return true if value is not empty string, null or undefined
    
# date
- `isDate(value: string, key: string)`
    return true if control is greater than value
    
- `dateGreaterThan(value: string, key: string)`
    return true if control is greater than value
    
- `dateLowerThan(value: string, key: string)`
    return true if control is lower than value
    
- `dateGreaterEqualThan(value: string, key: string)`
    return true if control is equal or greater than value
    
- `dateLowerEqualThan(value: string, key: string)`
    return true if control is equal or lower than value
    
- `dateEqualTo(value: string, key: string)`
    return true if control is equal to value
    
- `dateNotEqualTo(value: string, key: string)`
    return true if control is not equal to value