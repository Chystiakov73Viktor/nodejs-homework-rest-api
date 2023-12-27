const fs = require("node:fs/promises");
const path = require("node:path");
const { nanoid } = require("nanoid");

const contactsPath = path.join(__dirname, "contacts.json");

async function readFile() {
  const data = await fs.readFile(contactsPath, { encoding: "utf-8" });
  return JSON.parse(data);
}

async function writeFile(contacts) {
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2), "utf-8");
}

function listContacts() {
  return readFile();
}

async function getContactById(contactId) {
  const contacts = await readFile();
  const result = contacts.find((contact) => contact.id === contactId);
  return result || null;
}

async function removeContact(contactId) {
  const contacts = await readFile();
  const index = contacts.findIndex((contact) => contact.id === contactId);
  if (index === -1) {
    return null;
  }
  const [result] = contacts.splice(index, 1);
  await writeFile(contacts);
  return result;
}

async function addContact(body) {
  const contacts = await readFile();
  const newContact = {
    id: nanoid(),
    ...body,
  };
  contacts.push(newContact);
  await writeFile(contacts);
  return newContact;
}

const updateContact = async (contactId, body) => {
  const contacts = await readFile();
  const index = contacts.findIndex((contact) => contact.id === contactId);
  if (index === -1) {
    return null;
  }
  contacts[index] = { id: contactId, ...body };
  await writeFile(contacts);
  return contacts[index];
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
