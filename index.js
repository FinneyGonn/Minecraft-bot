const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

const bot = mineflayer.createBot({
    host: 'localhost',
    port: 23003,
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

// ==================== VARIABLES DE ESTADO PARA SEGUIMIENTO ====================
let siguiendo = false;
let jugadorObjetivo = null;
let intervaloSeguimiento = null;

// ==================== COMANDOS ====================
bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    const target = bot.players[username] ? bot.players[username].entity : null;
    const msg = message.toLowerCase().trim();

    // --- Activar seguimiento permanente ---
    if (msg === 'sigueme' || msg === 'follow') {
        if (!target) {
            bot.chat('No te veo cerca :(');
            return;
        }

        siguiendo = true;
        jugadorObjetivo = target;
        bot.chat(`¡Siguiéndote permanentemente, ${username}!`);

        // Iniciamos el seguimiento constante
        if (intervaloSeguimiento) clearInterval(intervaloSeguimiento);

        intervaloSeguimiento = setInterval(() => {
            if (siguiendo && jugadorObjetivo && bot.entity) {
                bot.pathfinder.setGoal(new goals.GoalFollow(jugadorObjetivo, 2));
            }
        }, 800); // Se actualiza cada 800ms
    }

    // --- Detener el seguimiento ---
    if (msg === 'detente' || msg === 'stop' || msg === 'no me sigas') {
        siguiendo = false;
        jugadorObjetivo = null;

        if (intervaloSeguimiento) {
            clearInterval(intervaloSeguimiento);
            intervaloSeguimiento = null;
        }

        bot.pathfinder.setGoal(null);
        bot.clearControlStates();
        bot.chat('Me detuve. Ya no te sigo.');
    }

    // --- Otros comandos 
    if (msg === 'mirame' || msg === 'look') {
        if (target) {
            bot.lookAt(target.position.offset(0, 1.6, 0));
            bot.chat('Te estoy mirando');
        }
    }

    if (msg === 'salta' || msg === 'jump') {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 350);
        bot.chat('¡Salto!');
    }

    if (msg === 'para' || msg === 'stop') {
        bot.pathfinder.setGoal(null);
        bot.clearControlStates();
        bot.chat('Me detuve');
    }

    //Comando para que el bot pueda minar el bloque que esta mirando 

    if (msg === 'mina' || msg === 'mine') {
        const target = bot.entityAtCursor(5);   // Mira hasta 5 bloques de distancia

        if (!target) {
            bot.chat("No estoy viendo ningún bloque para minar.");
            return;
        }

        // Opcional: Decirle qué bloque va a minar
        bot.chat(`Minando ${target.name}...`);

        bot.dig(target)
            .then(() => {
                bot.chat("¡Bloque minado exitosamente!");
            })
            .catch((err) => {
                bot.chat("No pude minar ese bloque.");
                console.log(err);
            });
    }
});


bot.on('error', (err) => console.log(' Error:', err.message))
bot.on('kicked', (reason) => console.log(' Kickeado:', reason))
bot.on('end', () => console.log(' Bot desconectado'))