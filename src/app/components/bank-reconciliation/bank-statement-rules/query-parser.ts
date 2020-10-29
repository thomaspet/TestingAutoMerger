type TokenType = 'NUM' | 'STRING' | 'LPAREN' | 'RPAREN' | 'OP' | 'LOP' | 'EOL' | 'VAR' | 'EOF' | 'FUNC';

export class Token {
    type: TokenType;
    value: string;
    level: number;

    isValue(): boolean {
        return this.type === 'NUM' || this.type === 'STRING' || this.type === 'VAR';
    }
}

export class QueryParser {
    tokens = [];

    parseExpression(value: string) {
        if (!value) { return []; }

        const tokens = this.tokenize(value);
        return this.parseAndGroupTokens(tokens);
    }

    private parseAndGroupTokens(tokens: Token[]) {
        const queryItems = [];

        // Build query items (e.g "foo eq 5" and "startswith(foo,'bar')" into objects) first.
        // Just push logical operators and parenthesis as is, we'll handle these later.
        while (tokens.length) {
            if (tokens[0].type === 'VAR' && tokens[1].type === 'OP') {
                const parts = tokens.splice(0, 3);
                queryItems.push({
                    field: parts[0].value,
                    operator: parts[1].value,
                    value: parts[2].value
                });
            } else if (tokens[0].type === 'FUNC') {
                const parts = tokens.splice(0, 6);

                // We have to combine the parameter sto get the field name here, as there is no real value
                if (parts[0].value === "updated") {
                    queryItems.push({
                        field: `${parts[2].value}.${parts[4].value.replace("'","")}`,
                        operator: parts[0].value,
                        value: undefined,
                        isFunction: true
                    });
                }
                else {
                    queryItems.push({
                        field: parts[2].value,
                        operator: parts[0].value,
                        value: parts[4].value,
                        isFunction: true
                    });
                }
            } else {
                queryItems.push(tokens.splice(0, 1)[0]);
            }
        }

        // Add logical operators to their closest (rightmost) query item
        let logicalOperatorIndex = queryItems.findIndex(item => item.type === 'LOP');
        while (logicalOperatorIndex >= 0) {
            const queryItem = queryItems.slice(logicalOperatorIndex).find(item => item.field);
            const logicalOperator = queryItems.splice(logicalOperatorIndex, 1)[0];

            if (queryItem) {
                queryItem.logicalOperator = logicalOperator.value;
            }

            logicalOperatorIndex = queryItems.findIndex(item => item.type === 'LOP');
        }

        /*
            Put items between left and right parenthesis into one item with a siblings list.
            Start at the end of the array when doing this.

            Starting at the end simplifies the process a bit because we know the last
            left parenthesis is always going to be matched with the closest right parenthesis.
            This allows us to just loop and splice, instead of using recursion.

            E.g

            (...items, (...items, (...items)))
                                  ^        ^
                                  Handle these first, then keep going left until we're done!
        */

        const indexOfLastLPAREN = (items: any[]) => {
            const reversed = [...items].reverse();
            const reversedIndex = reversed.findIndex(item => item.type === 'LPAREN');
            if (reversedIndex >= 0) {
                return reversed.length - 1 - reversedIndex;
            } else {
                return -1;
            }
        };

        let lParenIndex = indexOfLastLPAREN(queryItems);
        while (lParenIndex >= 0) {
            // Find closest RPAREN
            const stopIndex = queryItems.slice(lParenIndex).findIndex(item => item.type === 'RPAREN');

            // Remove the items from the original array
            const items = queryItems.splice(lParenIndex, stopIndex + 1);
            if (items.length) {
                // Remove LPAREN and RPAREN since we don't need these anymore
                items.pop();
                items.shift();

                // Make the first item the "main", and add the rest to a siblings array
                // Then add the single item back into the original array.
                const newItem = items.shift();
                newItem.siblings = items;
                queryItems.splice(lParenIndex, 0, newItem);
            }

            lParenIndex = indexOfLastLPAREN(queryItems);
        }

        return queryItems;
    }

    private addToken(type: TokenType, value: string) {
        const token = new Token();
        token.type = type;
        token.value = value;
        this.tokens.push(token);
    }

    private tokenize(str: string): Token[] {
        str = str.trim();
        let s = '';
        let isFuncCandidate = false;

        for (let index = 0; index < str.length; index++) {
            const char = str[index];
            s += char;
            const peek = str[index + 1];
            const isLast = (index === (str.length - 1));

            // Strings
            if (char === `'` || char === '"') {
                const iNext = str.indexOf(char, index + 1);
                if (iNext < index) {
                    return this.tokens; // unclosed quote
                } else {
                    s = str.substr(index + 1, iNext - index - 1);
                    this.addToken('STRING', s);
                    s = '';
                    index = iNext;
                    continue;
                }
            }

            let value = s.trim();

            // Numbers
            if (isNum(value) && (isLast || (!isDot(peek)) && !isNum(peek))) {
                this.addToken('NUM', value);
                s = ''; value = '';
                isFuncCandidate = false;
            }

            // Prefix minus?
            let checkForOperation = true;
            if (char === '-') {
                const prev = lastToken(this.tokens);
                if (!prev.isValue()) { checkForOperation = false; }
            }

            // Operations
            if (checkForOperation && isOp(value) && (isLast || (!isOp(peek)))) {
                s = value.toLowerCase();
                this.addToken(isLogicalOperator(s) ? 'LOP' : 'OP', s);
                s = ''; value = '';
                isFuncCandidate = false;
            }

            // Variables / function names
            if (isFxAlpha(value) && (isLast || !isFxAlpha(peek))) {
                this.addToken('VAR', value);
                s = ''; value = '';
                isFuncCandidate = true;
            }

            // Paranthesises
            if (value === '(' || value === ')') {
                s = value;
                const isLeft = s === '(';
                if (isFuncCandidate && isLeft) {
                    this.tokens[this.tokens.length - 1].type = 'FUNC';
                }

                this.addToken( isLeft ? 'LPAREN' : 'RPAREN', s);
                s = ''; value = '';
                isFuncCandidate = false;
            }

            if (s === ';' || s === '\n') {
                this.addToken('EOL', null);
                s = ''; value = '';
                isFuncCandidate = false;
            }

            if (s === ' ') {
                isFuncCandidate = false;
            }

        }
        return this.tokens;

        function lastToken(tokens): Token {
            if (tokens.length === 0) {
                return new Token();
            }
            return tokens[tokens.length - 1];
        }

        function isOp(v: string) {
            const operators = ['=', '+', '-', '*', '/', '>', '<', '>=', '<=', '==', '!=', ',', '<>',
                'and', 'or', 'AND', 'OR' ];
            for (let i = 0; i < operators.length; i++) {
                if (operators[i] === v) { return true; }
            }
            return false;
        }

        function isLogicalOperator(v: string) {
            if (!v) { return false; }
            if (v.length < 2 || v.length > 3) { return false; }
            const lops = ['and', 'or', 'AND', 'OR' ];
            for (let i = 0; i < lops.length; i++) {
                if (lops[i] === v) { return true; }
            }
            return false;
        }

        function isNum(v: string) {
            const value = parseFloat(v);
            return !isNaN(value) && isFinite(value);
        }

        function isDot(v: string) { return v === '.'; }

        function isFxAlpha(v: string) {
            const regExp = new RegExp(/^[a-z'.0-9]+$/i);
            return regExp.test(v);
        }
    }
}
