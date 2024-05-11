const express = require('express')
const app = express()
const port = 3000

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('database.db', (err) => {
	if (err) {
		console.error('Error opening database', err.message)
	} else {
		console.log('Database connected!')
	}
})

db.run(`CREATE TABLE IF NOT EXISTS gratitudes (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	message TEXT NOT NULL,
	timesLoved INTEGER DEFAULT 0
)`, (err) => {
	if (err) {
		console.error('Error creating table', err.message)
	} else {
		console.log('Table created or already exists.')
	}
})


app.use(express.static('static'))
app.use(express.json())

const exampleGratitude = {
	id: 0,
	timesLoved: 0,
	message: 'That this works'
}

const gratitudes = [

]

app.get('/gratitude', (req, res) => {
	console.log('somebody is touching my gratitudes')
	let storedGratitudes = []
	db.all('SELECT * FROM gratitudes', [], (err, rows) => {
		if (err) { console.error('Error fetching data', err.message) }
		else {
			rows.forEach((row) => {
				
				let constructedGratitude = {
					id: row.id,
					timesLoved: row.timesLoved,
					message: row.message
				}

				storedGratitudes.push(constructedGratitude)
			})
			res.json(storedGratitudes)
		}
	})
})

function parsedId(id) {
	if (parseInt(id)) {
		return id
	} else {
		return false
	}
}

function getGratitudeCardById(id, callback) {
	db.all('SELECT * FROM gratitudes WHERE id = ?', [id], (err, rows) => {
		if (err) { console.error(`Error retrieving gratitude with id ${id}:\n${err.message}`) }
		else {

			if (rows.length > 0) {
				const row = rows[0]
				const gratitude = {
					id: row.id,
					timesLoved: row.timesLoved,
					message: row.message
				}
				callback(null, gratitude)
			} else {
				callback(new Error("No record found"), null)
			}
		}
	})
}

function decrementTimesLoved(id) {
	db.run('BEGIN TRANSACTION;')
	db.run('UPDATE gratitudes SET timesLoved = timesLoved - 1 WHERE id = ?', [id], (err) => {
		if (err) {
			console.log('error')
			console.error(err)
			db.run('ROLLBACK;')
		} else {
			db.run('COMMIT;')
		}
	})
}

function incrementTimesLoved(id) {
	db.run('BEGIN TRANSACTION;')
	db.run('UPDATE gratitudes SET timesLoved = timesLoved + 1 WHERE id = ?', [id], (err) => {
		if (err) {
			console.log('error')
			console.error(err)
			db.run('ROLLBACK;')
		} else {
			db.run('COMMIT;')
		}
	})
}

function deleteGratitude(id) {
	db.run('BEGIN TRANSACTION;')
	db.run('DELETE FROM gratitudes WHERE id = ?', [id], (err) => {
		if (err) {
			console.log(err)
			db.run('ROLLBACK;')
		} else {
			db.run('COMMIT;')
			console.log(`Successfully deleted row${id}`)
		}
	})
}

getGratitudeCardById(3, (err, gratitude) => {
	if (err) {
		console.error(err)
	} else {
		console.log(gratitude)
	}
})

app.post('/gratitude-post', (req, res) => {
	console.log('hello??')
	let newGratitude = req.body
	console.log(`Received new gratitude ${JSON.stringify(newGratitude)}`)
	gratitudes.push(newGratitude)
	console.log("Storing: ", gratitudes)


	res.status(200).send('Received!')

	db.run(`INSERT INTO gratitudes (message, timesLoved) VALUES (?, ?)`, [newGratitude.message, newGratitude.timesLoved], (err) => {
		if (err) {
			console.error('Error inserting data', err.message)
		} else {
			console.log(`A row has been inserted with rowid ${this.lastID}`)
		}
	})
	
})

app.delete('/gratitude/:id', (req, res) => {
	const {
		body,
		params: { id }
	} = req

	const parsedId = parseInt(id)
	
	if (isNaN(parsedId)) return response.sendStatus(400);

	deleteGratitude(id)

	res.status(204).send('Deletion Successful')
})

app.patch('/love-gratitude/:id', (req, res) => {
	const {
		body,
		params: { id }
	} = req

	const parsedId = parseInt(id)
	
	if (isNaN(parsedId)) return response.sendStatus(400);

	getGratitudeCardById(parsedId, (err, gratitude) => {
		if (err) {
			console.error(err)
			res.status(500).send("An error occured while retrieving the gratitude card")
		} else if (!gratitude) {
			res.status(404).send("Card not found.")
		} else {
			console.log(gratitude)
			gratitude.timesLoved = gratitude.timesLoved + 1
			console.log(gratitude.timesLoved)
			incrementTimesLoved(parsedId)
			res.status(200).send("Loved card")
		}
	})
})

app.patch('/unlove-gratitude/:id', (req, res) => {
	const {
		body,
		params: { id }
	} = req

	const parsedId = parseInt(id)

	if (isNaN(parsedId)) return response.sendStatus(400);

	getGratitudeCardById(parsedId, (err, gratitude) => {
		if (err) {
			console.error(err)
			res.status(500).send("An error occured while retrieving the gratitude card")
		} else if (!gratitude) {
			res.status(404).send("Card not found.")
		} else {
			decrementTimesLoved(parsedId)
			res.status(200).send("Unloved card")
		}
	})
})

app.use((req, res, next) => {
	console.log(`Incoming request on ${req.path} with body: ${JSON.stringify(req.body)} and headers: ${JSON.stringify(req.headers)}`);
    next();
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})


