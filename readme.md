## FinneyBot

Sup, I'm Finn.
This is a Minecraft bot built with Node.js using Mineflayer.

This README will guide you through what the bot does and how to install and run it step by step.

---

## What This Bot Does

This bot can interact with players and move autonomously in the world.

Current features:

* Follows players
* Looks at players
* Jumps on command
* Stops movement
* Navigates using pathfinding
* Reacts to chat commands in real time

The bot can calculate paths and adapt to terrain, including basic block interaction when needed.

---

## Requirements

To run this project you need:

* Windows
* Minecraft (TLauncher or similar)
* Node.js installed

---

## Installation

### Install Node.js

1. Go to:

```
https://nodejs.org
```

2. Download the **LTS version**

3. Run the installer and make sure to enable:

```
Add to PATH
```

4. Verify installation by opening CMD and running:

```
node -v
npm -v
```

---

### Create the Project

1. Create a new folder for the bot

2. Open CMD inside that folder

3. Run the following commands one by one:

```
npm init -y
npm install mineflayer
npm install mineflayer-pathfinder
```

---

### Create the Main File

1. Inside the folder, create a file named:

```
index.js
```

2. Paste your bot code into that file

---

## How to Run the Bot

### Step 1: Start Minecraft

Open TLauncher and enter a world using the same version defined in your code.

---

### Step 2: Open to LAN

1. Press `Esc`
2. Click `Open to LAN`
3. Click `Start LAN World`
4. Note the port shown in the chat

---

### Step 3: Update the Port

Open `index.js` and change the port value:

```
port: 25565
```

Replace it with the port you got from Minecraft.

---

### Step 4: Run the Bot

In CMD, inside your project folder, run:

```
node index.js
```

The bot should connect to your world.

---

## Commands

Use these commands in the in-game chat:

* `ven` / `follow` → Bot follows you
* `mirame` / `look` → Bot looks at you
* `salta` / `jump` → Bot jumps
* `aqui` / `come` → Bot moves to your position
* `para` / `stop` → Bot stops all actions

---

## Important Notes

* The LAN port changes every time you open the world. Update it before running the bot.
* Always use the same Minecraft version in both TLauncher and your code.
* If the bot does not move, try switching between Survival or Creative mode.
* This bot is intended for local or private server use.

---

## Project Structure

Main logic is located in:

```
index.js
```

---

## Updates

This project is under active development.

Planned improvements include:

* Better command understanding
* Inventory system
* Task automation (mining, gathering, etc.)
* Mob detection and reactions
* Permission system

---

## Notes

* Do not modify core logic unless you understand it
* Always keep a backup before making changes

---

More updates coming soon.

**// UPDATE SOON //**
