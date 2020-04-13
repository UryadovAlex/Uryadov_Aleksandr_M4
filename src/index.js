const body = document.querySelector('body');
const changeButton = document.querySelector('.change_button');
const img = document.querySelector('.change_button img');
const loading = document.querySelector('.progress');
const firstCur = document.querySelector('#first_cur');
const secondCur = document.querySelector('#second_cur');
const table = document.querySelector('.table');
const rows = table.querySelectorAll('.row');
const arrowFirst = document.querySelector('.base.currencies div:last-child');
const arrowSecond = document.querySelector('.symbol.currencies div:last-child');


class RequestHandler {
    constructor(updateTime) {
        this.db = [];
        this.updateTime = updateTime;
    }

    async getRate(symbol, base) {
        const rate = this.db.find(objRate => objRate.name === symbol + base);
        if (rate) {
            if ((new Date().getTime() - rate.time) < this.updateTime) {
                return rate;
            } else {
                const data = await this.requestRate(symbol, base);
                rate.time = new Date.getTime();
                rate.rate = data.rates[base];
            }
        } else {
            const data = await this.requestRate(symbol, base);
            const rate = {
                name: symbol + base,
                rate: data.rates[base],
                time: new Date().getTime()
            }
            const reverseRate = {
                name: base + symbol,
                rate: 1 / data.rates[base],
                time: new Date().getTime()
            }
            this.db.push(rate);
            this.db.push(reverseRate);
            return rate;
        }
    }

    requestRate(symbol, base) {
        return fetch(`https://api.ratesapi.io/api/latest?base=${symbol}&symbols=${base}`)
            .then(response => response.json())
            .then(data => data)
            .catch(error => alert('Что-то пошло не так!'));
    }
}

const requestHandler = new RequestHandler(300000);

function calculate(event) {
    const base = document.querySelector('.base .choosen').innerHTML;
    const symbol = document.querySelector('.symbol .choosen').innerHTML;
    const live_rate1 = document.querySelector('.live_rate1');
    const live_rate2 = document.querySelector('.live_rate2');

    if (base === symbol) {
        secondCur.value = firstCur.value;
        return;
    }

    emulateLoading();
    requestHandler.getRate(symbol, base)
        .then(data => {
            let rate = data.rate;
            if (event.target !== document && event.target.classList.contains('right')) {
                live_rate1.innerHTML = `1 ${symbol} = ${rate} ${base}`;
                firstCur.value = (secondCur.value * rate).toFixed(4);
                live_rate2.innerHTML = `1 ${base} = ${1 / rate} ${symbol}`;
            } else {
                live_rate2.innerHTML = `1 ${symbol} = ${rate} ${base}`;
                secondCur.value = (firstCur.value * 1 / rate).toFixed(4);
                live_rate1.innerHTML = `1 ${base} = ${1 / rate} ${symbol}`;
            }
        })
        .finally(emulateLoading);
}

function emulateLoading() {
    body.classList.toggle('loading');
    img.classList.toggle('hide');
    loading.classList.toggle('show');
    loading.classList.toggle('hide');
}

function choose(div) {
    div.addEventListener('click', (event) => {
        div.parentElement.querySelectorAll('div:not(:last-child)').forEach(div => {
            if (div.classList.contains('choosen')) {
                div.classList.remove('choosen');
                choosen = div;
            }
        });
        div.classList.add('choosen');
        calculate(event);
    });
}

rows.forEach(row => {
    row.addEventListener('click', (event) => {
        let hasCurrency = false;
        const currency = row.querySelector('p:last-child').innerHTML;
        if (!table.classList.contains('right')) {
            document.querySelectorAll('.base.currencies div:not(:last-child)').forEach(div => {
                if (div.innerHTML === currency) hasCurrency = true;
            })
            if (!hasCurrency) {
                const base = document.querySelector('.base .choosen');
                base.innerHTML = currency;
                arrowFirstAction();
                calculate(event);
            } else {
                alert('Валюта уже находится в списке. Выберите другую.');
            }
        } else {
            document.querySelectorAll('.symbol.currencies div:not(:last-child)').forEach(div => {
                if (div.innerHTML === currency) hasCurrency = true;
            })
            if (!hasCurrency) {
                const symbol = document.querySelector('.symbol .choosen');
                symbol.innerHTML = currency;
                arrowSecondAction();
                calculate(event);
            } else {
                alert('Валюта уже находится в списке. Выберите другую.');
            }
        }
    });
});

const arrowFirstAction = () => {
    arrowFirst.classList.toggle('arrow_up');
    arrowFirst.classList.toggle('arrow_down');
    if (arrowSecond.classList.contains('arrow_up')) {
        table.classList.toggle('right');
        arrowSecond.classList.toggle('arrow_up');
        arrowSecond.classList.toggle('arrow_down');
    } else {
        table.classList.toggle('hide');
        table.classList.toggle('show');
    }
}

const arrowSecondAction = () => {
    arrowSecond.classList.toggle('arrow_up');
    arrowSecond.classList.toggle('arrow_down');
    if (arrowFirst.classList.contains('arrow_up')) {
        table.classList.toggle('right');
        arrowFirst.classList.toggle('arrow_up');
        arrowFirst.classList.toggle('arrow_down');
    } else {
        table.classList.toggle('hide');
        table.classList.toggle('show');
        table.classList.toggle('right');
    }
}

changeButton.addEventListener('click', (event) => {
    let firstInputValue = firstCur.value;
    firstCur.value = secondCur.value;
    secondCur.value = firstInputValue;
    const choosenBase = document.querySelector('.base.currencies > .choosen');
    const choosenSymbol = document.querySelector('.symbol.currencies > .choosen');
    choosenBase.classList.toggle('choosen');
    choosenSymbol.classList.toggle('choosen');
    const base = choosenBase.innerHTML;
    const symbol = choosenSymbol.innerHTML;

    let isBaseClassAdded = false;
    document.querySelectorAll('.base.currencies div:not(:last-child)').forEach((div) => {
        if (div.innerHTML === symbol) {
            div.classList.add('choosen');
            isBaseClassAdded = true;
        }
    });
    if (!isBaseClassAdded) {
        choosenBase.innerHTML = symbol;
        choosenBase.classList.add('choosen');
    }

    let isSymbolClassAdded = false;
    document.querySelectorAll('.symbol.currencies div:not(:last-child)').forEach((div) => {
        if (div.innerHTML === base) {
            div.classList.add('choosen');
            isSymbolClassAdded = true;
        }

    });
    if (!isSymbolClassAdded) {
        choosenSymbol.innerHTML = base;
        choosenSymbol.classList.add('choosen');
    }

    calculate(event);
});

document.querySelectorAll('.base.currencies div:not(:last-child)').forEach(choose);
document.querySelectorAll('.symbol.currencies div:not(:last-child)').forEach(choose);

arrowFirst.addEventListener('click', arrowFirstAction);
arrowSecond.addEventListener('click', arrowSecondAction);

window.addEventListener('DOMContentLoaded', calculate)
firstCur.addEventListener('change', calculate);
secondCur.addEventListener('change', calculate);