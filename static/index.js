const url = `http://127.0.0.1:3000/gratitude`
const gratitudeContainer = document.getElementById('gratitude-container')
const sendBtn = document.getElementById('send-gratitude-btn')
const newGratitudeText = document.getElementById('new-gratitude-input')

const deleteGratitudeText = document.getElementById('delete-gratitude-input')
const deleteGratitudeBtn = document.getElementById('delete-gratitude-btn')

const testGratitude = {
	timesLoved: 0,
	message: 'That this works too!'
}

function clearCards() {
	gratitudeContainer.innerHTML = ''
}

function generateCard(gratitude) {
	let gratitudeCard = document.createElement('div')
	gratitudeCard.className = 'gratitude-card'

	let header = document.createElement('h3')
	header.innerText = 'I am grateful that...'

	let message = document.createElement('p')
	message.innerHTML = gratitude.message + ` ${gratitude.id}`

	let interactionContainer = document.createElement('div')
	interactionContainer.className = 'card-interaction'
	let loveBtn = document.createElement('button')
	loveBtn.innerText = 'Love'
	loveBtn.addEventListener('click', (e) => {
		alert('loved')
	})

	let loveCounter = document.createElement('p')
	loveCounter.innerText = 5

	interactionContainer.appendChild(loveBtn)
	interactionContainer.appendChild(loveCounter)

	gratitudeCard.appendChild(header)
	gratitudeCard.appendChild(message)
	//gratitudeCard.appendChild(interactionContainer)
	gratitudeContainer.appendChild(gratitudeCard)
}

function testLove() {
	fetch('http://127.0.0.1:3000/love-gratitude/3', {
		method: 'PATCH'
	})
	.then(response => {
		if (response.ok) {
			alert('Successfully loved the post!')
		} else if (response.status === 404) {
			alert('Post not found!')
		} else {
			throw new Error('Something went terribly wrong.')
		}
	})
	.catch(error => {
		console.error('Error: ', error)
		alert('Error: ' + error.message)
	})
}

function testUnLove() {
	fetch('http://127.0.0.1:3000/unlove-gratitude/3', {
		method: 'PATCH'
	})
	.then(response => {
		if (response.ok) {
			alert('Successfully unloved the post!')
		} else if (response.status === 404) {
			alert('Post not found!')
		} else {
			throw new Error('Something went terribly wrong.')
		}
	})
	.catch(error => {
		console.error('Error: ', error)
		alert('Error: ' + error.message)
	})
}

function deleteGratitude(id) {
	fetch(`http://127.0.0.1:3000/gratitude/${id}`, {
		method: 'DELETE'
	})
	.then(response => {
		if (response.ok) {
			alert('deletion success')
			getGratitudes()
		} else if (response.status === 404) {
			alert('Post not found!')
		} else {
			throw new Error('Something went terribly wrong.')
		}
	})
}


function getGratitudes() {
	fetch(url)
	.then((response) => response.json())
	.then((json) => {
		clearCards()
		console.log(json)

		json.forEach((gratitude) => {
			generateCard(gratitude)
		});

	})
}


function validateInput() {
	return newGratitudeText.value.length > 0;
}

sendBtn.addEventListener('click', () => {

	if (!validateInput()) {
		alert('Input cannot be blank!')
		newGratitudeText.focus()
		return
	}
	let newGratitude = {
		timesLoved: 0,
		message: newGratitudeText.value
	}

	newGratitudeText.value = ""

	fetch(url + '-post', {
		method: "POST",
		body: JSON.stringify(newGratitude),
		headers: {
			"Content-type": 'application/json; charset=UTF-8'
		}
	})
		.then((response) => {
			getGratitudes()
		})
})

deleteGratitudeBtn.addEventListener('click', () => {
	deleteGratitude(deleteGratitudeText.value)
	deleteGratitudeText.value = 0
})


getGratitudes()