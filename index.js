const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

const bot = mineflayer.createBot({
    host: 'localhost',
    port: 23175,
    username: 'FinneyBot',
    version: '1.21.11',
    auth: 'offline'
})

bot.loadPlugin(pathfinder)

bot.once('spawn', () => {
    console.log(` Bot ${bot.username} conectado correctamente!`)
    bot.chat('¡Hola! Estoy listo. Escribe comandos como: ven, mirame, salta, para')

    // Configuración de movimiento
    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)
    bot.pathfinder.setMovements(defaultMove)
})

// ==================== COMANDOS ====================
bot.on('chat', (username, message) => {
    if (username === bot.username) return

    const target = bot.players[username] ? bot.players[username].entity : null

    // --- Seguir al jugador ---
    if (message.toLowerCase() === 'ven' || message.toLowerCase() === 'follow') {
        if (!target) {
            bot.chat('No te veo cerca :(')
            return
        }
        bot.pathfinder.setGoal(new goals.GoalFollow(target, 2))
        bot.chat(`¡Siguiéndote, ${username}!`)
    }

    // --- Mirar al jugador ---
    if (message.toLowerCase() === 'mirame' || message.toLowerCase() === 'look') {
        if (target) {
            bot.lookAt(target.position.offset(0, 1.6, 0)) // mira a la cabeza
            bot.chat('Te estoy mirando ')
        } else {
            bot.chat('No te veo')
        }
    }

    // --- Saltar ---
    if (message.toLowerCase() === 'salta' || message.toLowerCase() === 'jump') {
        bot.setControlState('jump', true)
        setTimeout(() => bot.setControlState('jump', false), 350)
        bot.chat('¡Salto!')
    }

    // --- Detenerse ---
    if (message.toLowerCase() === 'para' || message.toLowerCase() === 'stop') {
        bot.pathfinder.setGoal(null)
        bot.clearControlStates()
        bot.chat('Me detuve ✅')
    }

    // --- Ir a donde estás mirando ---
    if (message.toLowerCase() === 'aqui' || message.toLowerCase() === 'come') {
        const pos = bot.entity.position
        const goal = new goals.GoalNear(pos.x, pos.y, pos.z, 1)
        bot.pathfinder.setGoal(goal)
        bot.chat('Voy al lugar donde estás!')
    }
})

bot.on('error', (err) => console.log('❌ Error:', err.message))
bot.on('kicked', (reason) => console.log('❌ Kickeado:', reason))
bot.on('end', () => console.log('🔴 Bot desconectado'))