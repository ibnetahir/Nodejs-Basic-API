const Ajv = require('ajv');
const ajv = new Ajv();

const noteSchema = {
    type: "object",
    properties:{
        title: {type: 'string', minLength: 3},
        description: {type: 'string', minLength: 5},
        tag: {type: 'string', default: "personal"}
    },
    required: ["title", "description"]
}

const validate = ajv.compile(noteSchema);

module.exports = validate;