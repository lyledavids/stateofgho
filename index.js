// Setup our environment variables via dotenv
require('dotenv').config()
const mainnetEndpoint = "https://api.thegraph.com/subgraphs/name/aave/gho-mainnet";
const axios = require('axios');
const { ethers } = require('ethers');
const fetch = require('node-fetch');
const network = "mainnet";
const alchemyApiKey = process.env.ALCHEMY_KEY;
const provider = new ethers.AlchemyProvider(network, alchemyApiKey);

// Import relevant classes from discord.js
const { Client, Intents, Interaction, Constants, MessageEmbed} = require('discord.js');
const { url } = require('inspector');
const { json } = require('stream/consumers');
const { time } = require('console');

const client = new Client(
    { intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] }
);



client.on('ready', function(e){
    console.log(`Logged in as ${client.user.tag}!`)

    const guildId = "823031986368675840";
    const guild = client.guilds.cache.get(guildId);
    let commands

    if (guild) {
        commands = guild.commands
    } else {
        commands = client.application?.commands
    }

    commands?.create({
        name: "get-treasury-mints",
        description: "Returns up to 5 of the recent treasury mints of GHO",
    })

    commands?.create({
        name: "get-recent-repays",
        description: "Get recent repays",
    })

    // commands?.create({
    //     name: "get-recent-repays",
    //     description: "Get recent repays",
    //     options: [
    //         {
    //             name: 'id',
    //             description: 'ID',
    //             required: true,
    //             type: Constants.ApplicationCommandOptionTypes.STRING
    //         }
    //     ]
    // })


})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return
    }

    const { commandName, options} = interaction

    if (commandName === 'get-treasury-mints') {
        
        const query = `
        {
            mintedToTreasuries(orderBy: timestamp, orderDirection: desc, first: 10) {
              id
              amount
              timestamp
            }
          }
        `;
    
        axios.post(mainnetEndpoint, { query })
            .then(response => {
                const ss = response.data.mintedToTreasuries;
    
                if (ss && ss.length > 0) {
                    const stakersEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`Recent Treasury Mints`);
    
                    ss.forEach(s => {
                        stakersEmbed.addField("ID", s.account);
                        stakersEmbed.addField("Amount", `${weiToReadable(s.amount)} GHO`);
                        stakersEmbed.addField("Timestamp", s.timestamp);
    
                        stakersEmbed.addField("\u200B", "\u200B");
                    });
    
                    interaction.reply({ embeds: [stakersEmbed] });
                } else {
                    interaction.reply({
                        content: "No recent mints found."
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching mints:', error);
                interaction.reply({
                    content: "An error occurred while fetching mints."
                });
            });
    } else if (commandName === 'get-recent-repays') {
        const query = `
            {
                {
                    repays(first: 10, orderBy: timestamp, orderDirection: desc) {
                      amount
                      repayer {
                        id
                      }
                      timestamp
                      txHash
                      user {
                        id
                      }
                    }
                  }
            }
        `;
    
        //axios.post(
    } 
    
    
    

})


async function getResponse(url) {
	console.log(url)

    let options = {method: 'GET', headers: {'Content-Type': 'application/json'}};

    const data = await fetch(url, options)
    .then(res => res.json())
    .then(json => console.log(json.Floor_Price))
    .catch(err => console.error('error:' + err));
    return data
}

function weiToReadable(weiAmount) {
    const decimals = 18; // Decimals for DAI token

    const divisor = 10 ** decimals;

    const readableDaiAmount = parseFloat(weiAmount) / divisor;
    return readableDaiAmount.toFixed(2); // Return with correct decimal precision
}


client.login(process.env.DISCORD_TOKEN)