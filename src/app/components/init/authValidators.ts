import {AbstractControl} from '@angular/forms';

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

export function passwordMatchValidator(formGroup: AbstractControl) {
    const password = formGroup.get('Password').value;
    const confirmPassword = formGroup.get('ConfirmPassword').value;

    if (password !== confirmPassword) {
        formGroup.get('ConfirmPassword').setErrors({
            passwordMatchValidator: 'Passord må være like'
        });
    } else {
        return null;
    }
}

export function usernameValidator(control) {
    const invalid = /[^a-zæøåA-ZÆØÅ0-9]/g.test(control.value);
    if (invalid) {
        return {'usernameValidator': 'Brukernavn kan bare inneholde bokstaver og tall'};
    } else {
        return null;
    }
}
