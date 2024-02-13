const playerContainer = document.getElementById('all-players-container');
const newPlayerFormContainer = document.getElementById('new-player-form');

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = '2308-ACC-ET-WEB-PT-A';
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/2308-ACC-ET-WEB-PT-A/players`;

/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */

let state = [];

const fetchAllPlayers = async () => {
    try {
        const response = await fetch(APIURL);
        const players = await response.json();
        const playersArray = players.data.players
        state = playersArray;
        return(playersArray);
    } catch (err) {
        console.error('Uh oh, trouble fetching players!', err);
    }
};


const fetchSinglePlayer = async (playerId) => {
    try {
        const response = await fetch(`${APIURL}/${playerId}`);
        const player = await response.json();
        console.log('Player details:', player);
        
    } catch (err) {
        console.error(`Oh no, trouble fetching player #${playerId}!`, err);
    }
};

const addNewPlayer = async (playerObj) => {
    try {
        const response = await fetch(APIURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(playerObj)
        });
        if (response.ok) {
            console.log('Player has been added to the roster.');
        } else {
            console.error('Failed to add player to the roster.');
        }
    } catch (err) {
        console.error('Oops, something went wrong with adding that player!', err);
    }
};

const removePlayer = async (playerId) => {
    try {
        const response = await fetch(`${APIURL}/${playerId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            console.log(`Player #${playerId} has been removed from the roster.`);
        } else {
            console.error(`Failed to remove player #${playerId} from the roster.`);
        }
    } catch (err) {
        console.error(`Whoops, trouble removing player #${playerId} from the roster!`, err);
    }
};

/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players. 
 * 
 * Then it takes that larger string of HTML and adds it to the DOM. 
 * 
 * It also adds event listeners to the buttons in each player card. 
 * 
 * The event listeners are for the "See details" and "Remove from roster" buttons. 
 * 
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player. 
 * 
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster. 
 * 
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */
const renderAllPlayers = (playerList) => {
    try {
        let playerContainerHTML = '';
        playerList.forEach(player => {
            const playerHTML = `
                <div class="player-card">
                    <h3>${player.name}</h3>
                    <p>Player ID: ${player.id}</p>
                    <p>Breed: ${player.breed}</p>
                    <p>Status: ${player.status}</p>
                    <p><img src="${player.imageUrl}" alt="Player Image"></p>
                    <button class="details-button" data-player-id="${player.id}">See details</button>
                    <button class="remove-button" data-player-id="${player.id}">Remove from roster</button>
                </div>
            `;
            playerContainerHTML += playerHTML;
        });
        playerContainer.innerHTML = playerContainerHTML;

        // Event listener for "See details" button
        const detailsButtons = document.querySelectorAll('.details-button');
        detailsButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const playerId = event.target.dataset.playerId;
                await fetchSinglePlayer(playerId);
            });
        });

        // Event listener for "Remove from roster" button
        const removeButtons = document.querySelectorAll('.remove-button');
        removeButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const playerId = event.target.dataset.playerId;
                await removePlayer(playerId);
                renderAllPlayers(playerList.filter(player => player.id !== Number(playerId)));
            });
        });
    } catch (err) {
        console.error('Uh oh, trouble rendering players!', err);
    }
};

/**
 * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
 * fetches all players from the database, and renders them to the DOM.
 */
const renderNewPlayerForm = () => {
    try {
        const formHTML = `
            <form id="new-player-form">
                <h2>Add New Player</h2>
                <label for="id">id:</label>
                <input type="number" id="id" required>
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required>
                <label for="breed">Breed:</label>
                <input type="text" id="breed" name="breed" required>
                <label for="status">Status:</label>
                <input type="text" id="status" name="status" required>
                <label for="imageUrl">Image URL:</label>
                <input type="text" id="imageUrl" name="imageUrl" required>
                <button type="submit">Add Player</button>
            </form>
        `;
        newPlayerFormContainer.innerHTML = formHTML;

        const form = document.getElementById('new-player-form');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const id = Number(document.getElementById('id').value);
            const name = document.getElementById('name').value;
            const breed = document.getElementById('breed').value;
            const status = document.getElementById('status').value;
            const imageUrl = document.getElementById('imageUrl').value;

            state.push({
                id: id,
                name: name,
                breed: breed,
                status: status,
                imageUrl: imageUrl});

            console.log(state);
            addNewPlayer({
                id: id,
                name: name,
                breed: breed,
                status: status,
                imageUrl: imageUrl
            })
            renderAllPlayers(state);
        });
        
    } catch (err) {
        console.error('Uh oh, trouble rendering the new player form!', err);
    }
}

const init = async () => {
    const players = await fetchAllPlayers();
    renderAllPlayers(players);

    renderNewPlayerForm();
}

init();