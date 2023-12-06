const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const CredentialSchema = new Schema({
  username: {type: String, required: true, min: 4, unique: true},
  password: {type: String, required: true},
});

const CredentialModel = model('Credential', CredentialSchema);

module.exports = CredentialModel;