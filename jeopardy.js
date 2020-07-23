const $body = $('body');
const $board = $('#board');

// Generates 6 random numbers from 0-6
const uniqIndexFive = () => {
	let randomArr = [];
	for (let i = 0; i < 100; i++) {
		randomArr.push(_.random(0, 100))
	}
	let arr = _.uniq(randomArr);
	return _.take(arr, 6);
}

// Sort of IDs array
const sortIds = (ids) => {
	let indexFive = uniqIndexFive();
	let newArr = [];
	for (let i = 0; i < indexFive.length; i++) {
		newArr.push(ids[indexFive[i]]);
	}
	return newArr;
}

// Return a List of 6 random IDs of 100 catigories
async function getCategoryIds() {
	let idArr = [];
	const ids = await axios.get('http://jservice.io/api/categories', { params: { count: 100 } });
	for (let id of ids.data) {
		idArr.push(id.id)
	}
	return sortIds(idArr);
}

// use one ID to get 1 Catigorie , A/Q;
async function getCategorieObject(id) {
	let obj = await axios.get('http://jservice.io/api/category', { params: { id: id } });
	return obj;
}

// return new sorted object (5 questions)
const getDataFromObject = (data) => {
	let obj = {};
	let clues = [];
	for (let i = 0; i < 5; i++) {
		clues.push({
			question: data.clues[i].question,
			answer: data.clues[i].answer,
			showing: '?'
		})
	}
	obj.title = data.title.toUpperCase();
	obj.clues = clues;
	return obj;
}

// Get Catigorie the final object
async function createCatigorieObject() {
	let newArr = [];
	let idArr = await getCategoryIds();
	for (let id of idArr) {
		let newObj = await getCategorieObject(id);
		newArr.push(getDataFromObject(newObj.data));
	}
	return newArr;
}

// create and fill table with data
async function fillTable() {
	const data = await createCatigorieObject();
	let $item = $(
		`<div id="jeopardy">
			<table id="board">
				<thead></thead>
				<tbody></tbody>
			</table>
		</div>`
	)
	$body.prepend($item);

	let $thead = $('thead');
	for (let head of data) {
		let $catigorie = $(
			`<th><p>${head.title}</p></th>`
		)
		$thead.append($catigorie);
	}

	let $tbody = $('tbody');
	for (let i = 0; i < 5; i++) {
		let $tableRow = $(`<tr></tr>`)
		for (let j = 0; j < 6; j++) {
			let $tableData = $(`<td>
			<div class="h">${data[j].clues[i].question}</div>
			<div class="h"><b>${data[j].clues[i].answer}<b></div>
			<div class="v"><b>${data[j].clues[i].showing}</b></div>
			</td>`)
			$tableRow.append($tableData);
		}
		$tbody.append($tableRow);
	}
	$('.h').hide();
	handleClick();
}

// handle 2 clicks: show question, show answer
function handleClick() {
	$('td').on('click', function (e) {
		e.preventDefault();

		let q = $(this).children().eq(0);
		let a = $(this).children().eq(1);
		let n = $(this).children().eq(2)
		if (q.attr('class') === 'shown') {
			q.hide();
			a.show()
			$(this).addClass('green');
		}
		if (q.attr('class') === 'h') {
			q.show();
			n.hide();
			q.removeClass('h').addClass('shown');
		}
	})
}

// Loading Screen
async function showLoadingView() {
	let $loading = $(`<div id="loading">Loading...</div>`)
	$('#restart-game').hide();
	$('#restart-game').hide();
	$('#start-game').hide();
	$('#info').hide();
	$body.append($loading);
	await fillTable();
	$loading.remove();
}

// Create START and RESTART btn
 function setupAndStart() {

	 let $info = $(`<div id='info'>
		 <h1>Jeopardy</h1>
		 <h3>"What is Jeopardy!?"</h3>
		 <p>Jeopardy! is one of the longest running game shows in American history. It has been running for 36 years, and contestants have earned millions of dollars since it first aired. Ken Jennings alone won 2.5 million dollars on his historic 74 game hot streak. For trivia nerds out there, it is possibly the best game show ever created.</p></div>`
		 );
	 $body.append($info);

	let $start = $(`<button id="start-game">Start Game</button>`)
	$body.append($start);

	let $restart = $(`<button id="restart-game">Restart Game</button>`)
	$body.append($restart);

	$('#restart-game').hide();

	$('#start-game').on('click', async function (e) {
		e.preventDefault();
		await showLoadingView();
		$('#restart-game').show();
		$('#start-game').hide();
	})

	$('#restart-game').on('click', async function (e) {
		e.preventDefault();
		const $jeopardy = $('#jeopardy');
		$jeopardy.remove()
		await showLoadingView();
		$('#restart-game').show();
	})
}

// run the game
setupAndStart();
