// node deploy-commands.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [
  new SlashCommandBuilder().setName('help').setDescription('help'),
  new SlashCommandBuilder().setName('new-game').setDescription('start a new game').addStringOption(option => option.setName('name').setDescription('name your game').setRequired(true)),
  new SlashCommandBuilder().setName('tally').setDescription('see current state'),
  new SlashCommandBuilder().setName('kill').setDescription('kill a player').addUserOption(option => option.setName('user').setDescription('who are you killing?').setRequired(true)),
  new SlashCommandBuilder().setName('vote').setDescription('vote for a player').addUserOption(option => option.setName('user').setDescription('who are you voting for?').setRequired(true)),
  new SlashCommandBuilder().setName('voting-done').setDescription('voting is done'),
]
  .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);