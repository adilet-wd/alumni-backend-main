module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    ignorePatterns: ['.eslintrc.js', 'dist'],
    "extends": "standard-with-typescript",
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "@typescript-eslint/strict-boolean-expressions": "off",
        "no-unused-vars": "warn",
        "max-len": "off",
        "@typescript-eslint/ban-ts-comment": "warn",
        "require-jsdoc": "off",
        "valid-jsdoc": "off",
        "new-cap": "warn",
        "semi": ["error", "always"],
        "@typescript-eslint/semi": "off",
        "eol-last": "off",
    }
}
