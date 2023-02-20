const Ajv = require('ajv');
const ajv = new Ajv();

const userSchema = {
    type: "object",
    properties:{
        name: {type: "string", minLength: 4},
        email: {type: "string", format: "email"},
        password: {type: "string", minLength: 8},
        balance: {type: "number"}
    },
    required: ["name", "email", "password"]
}

const validate = ajv.compile(userSchema);

module.exports = validate;