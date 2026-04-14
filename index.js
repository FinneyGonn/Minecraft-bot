const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

const bot = mineflayer.createBot({
    host: 'localhost',
    port: 1735,
    username: 'FinneyBot',
    version: '1.21.11',
    auth: 'offline'
})

bot.loadPlugin(pathfinder)

bot.once('spawn', () => {
    console.log(` Bot ${bot.username} conectado correctamente!`)
    bot.chat('¡Hola! Estoy listo. Escribe comandos como: ven, mirame, salta, sigueme, detente, mina')

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

        // Buscamos el bloque justo enfrente del bot (más estable)
        const frontBlock = bot.blockAt(bot.entity.position.offset(0, 0, 1));   // 1 bloque enfrente
        const belowBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0)); // bloque debajo (por si acaso)

        let target = null;

        // Prioridad: bloque enfrente → bloque debajo
        if (frontBlock && bot.canDigBlock(frontBlock)) {
            target = frontBlock;
        } else if (belowBlock && bot.canDigBlock(belowBlock)) {
            target = belowBlock;
        }

        if (!target) {
            bot.chat("❌ No encuentro ningún bloque minable cerca (prueba parándote justo enfrente de uno).");
            return;
        }

        // Miramos correctamente al bloque
        const lookPosition = target.position.offset(0.5, 0.5, 0.5);
        bot.lookAt(lookPosition, true);

        bot.chat(`⛏ Minando ${target.name}...`);

        // Dig con callback (más estable)
        bot.dig(target, (err) => {
            if (err) {
                bot.chat("❌ No pude minar el bloque.");
                console.error(err.message);
            } else {
                bot.chat("✅ ¡Bloque minado!");
            }
        });
    }

    // ==================== AUTO MINING - TODO LO QUE TENGA AL FRENTE ====================
    let isAutoMining = false;

    if (msg === '#mina') {
        if (isAutoMining) {
            bot.chat("⚠️ Ya estoy en modo auto-mining.");
            return;
        }

        isAutoMining = true;
        bot.chat("⛏ Modo auto-mining ACTIVADO → Minando todo lo que tenga al frente");
        autoMineLoop();
    }

    if (msg === '#stop' || msg === '#parar') {
        isAutoMining = false;
        bot.chat("⛔ Modo auto-mining DETENIDO.");
        bot.stopDigging();
    }

    // ====================== LOOP MEJORADO ======================
    async function autoMineLoop() {
        while (isAutoMining) {

            // Busca cualquier bloque rompible cerca
            const target = bot.findBlock({
                matching: (block) => {
                    // Protección extra contra null
                    if (!block) return false;
                    return bot.canDigBlock(block);
                },
                maxDistance: 10,
                count: 1
            });

            if (!target) {
                bot.chat("❌ No encuentro más bloques para minar cerca.");
                await new Promise(r => setTimeout(r, 2500)); // espera más tiempo
                continue;
            }

            // Equipar pico si tiene
            const pickaxe = bot.inventory.items().find(item =>
                item.name.includes('pickaxe')
            );
            if (pickaxe) {
                try {
                    await bot.equip(pickaxe, 'hand');
                } catch (e) { }
            }

            // Mirar al bloque
            try {
                const lookPos = target.position.offset(0.5, 0.5, 0.5);
                await bot.lookAt(lookPos, true);
            } catch (e) {
                console.error("Error al mirar:", e);
            }

            bot.chat(`⛏ Minando ${target.name}...`);

            try {
                await bot.dig(target);
                bot.chat(`✅ ${target.name} minado.`);
            } catch (err) {
                console.error(err);
                bot.chat("❌ No pude minar este bloque.");
            }

            await new Promise(r => setTimeout(r, 600));
        }
    }
});


bot.on('error', (err) => console.log(' Error:', err.message))
bot.on('kicked', (reason) => console.log(' Kickeado:', reason))
bot.on('end', () => console.log(' Bot desconectado'))