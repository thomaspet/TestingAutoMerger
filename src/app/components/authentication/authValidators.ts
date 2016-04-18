export function passwordValidator(control) {
    let password = control.value;
    
    let hasLowerCase = /[a-zæøå]/.test(password);
    let hasUpperCase = /[A-ZÆØÅ]/.test(password);
    let hasNumber   = /[\d]/.test(password);
    let hasSymbol    = /[\@\#\$\%\^\&\*\-_\\+\=\[\]\{\}\|\\\:\‘\,\.\?\/\`\~\“\(\)\;]/.test(password); 
    
    let counter = 0;
    if (hasLowerCase) counter++;
    if (hasUpperCase) counter++;
    if (hasNumber) counter++;
    if (hasSymbol) counter++;
    
    if (counter < 3) {
        return {'passwordValidator': true};
    }
    
    return null;    
}
