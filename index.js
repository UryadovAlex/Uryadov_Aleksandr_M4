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

function calculate() {
    const base = document.querySelector('.base .choosen').innerHTML;
    const symbol = document.querySelector('.symbol .choosen').innerHTML;
    const live_rate1 = document.querySelector('.live_rate1');
    const live_rate2 = document.querySelector('.live_rate2');

    if (base === symbol) {
        secondCur.value = firstCur.value;
        return;
    }

    emulateLoading();
    fetch(`https://api.ratesapi.io/api/latest?base=${symbol}&symbols=${base}`)
        .then(response => response.json())
        .then(data => {
            let rate = data.rates[base];
            live_rate2.innerHTML = `1 ${symbol} = ${rate} ${base}`;
        })
        .catch(error => alert('Что-то пошло не так!'))
    fetch(`https://api.ratesapi.io/api/latest?base=${base}&symbols=${symbol}`)
        .then(response => response.json())
        .then(data => {
            let rate = data.rates[symbol];
            secondCur.value = (firstCur.value * rate).toFixed(4);
            live_rate1.innerHTML = `1 ${base} = ${rate} ${symbol}`;
        })
        .catch(error => alert('Что-то пошло не так!'))
        .finally(emulateLoading);
}

function emulateLoading() {
    body.classList.toggle('loading');
    img.classList.toggle('hide');
    loading.classList.toggle('show');
    loading.classList.toggle('hide');
}

function chooseCurrencyBase(div) {
    div.addEventListener('click', () => {
        removeChoosenBase();
        div.classList.add('choosen');
        calculate();
    });
}

function removeChoosenBase() {
    document.querySelectorAll('.base.currencies div').forEach(div => {
        if (div.classList.contains('choosen')) div.classList.remove('choosen');
    });
}

function chooseCurrencySymbol(div) {
    div.addEventListener('click', () => {
        removeChoosenSymbol();
        div.classList.add('choosen');
        calculate();
    });
}

function removeChoosenSymbol() {
    document.querySelectorAll('.symbol.currencies div').forEach(div => {
        if (div.classList.contains('choosen')) div.classList.remove('choosen');
    });
}

rows.forEach(row => {
    row.addEventListener('click', () => {
        let hasCurrency = false;
        const currency = row.querySelector('p:last-child').innerHTML;
        if(!table.classList.contains('right')){
            document.querySelectorAll('.base.currencies div:not(:last-child)').forEach(div => {
                if (div.innerHTML === currency) hasCurrency = true;
            })
            if(!hasCurrency) {
                const base = document.querySelector('.base .choosen');
                base.innerHTML = currency;
                arrowFirstAction();
                calculate();
            } else {
                alert('Валюта уже находится в списке. Выберите другую.');
            }
        } else {
            document.querySelectorAll('.symbol.currencies div:not(:last-child)').forEach(div => {
                if (div.innerHTML === currency) hasCurrency = true;
            })
            if (!hasCurrency){
                const symbol = document.querySelector('.symbol .choosen');
                symbol.innerHTML = currency;
                arrowSecondAction();
                calculate();
            } else {
                alert('Валюта уже находится в списке. Выберите другую.');
            }
        }
    });
});

const arrowFirstAction = () => {
    arrowFirst.classList.toggle('arrow_up');
    arrowFirst.classList.toggle('arrow_down');
    if(arrowSecond.classList.contains('arrow_up')) {
        table.classList.toggle('right');
        arrowSecond.classList.toggle('arrow_up');
        arrowSecond.classList.toggle('arrow_down');
    }else {
        table.classList.toggle('hide');
        table.classList.toggle('show');
    }
}

const arrowSecondAction = () => {
    arrowSecond.classList.toggle('arrow_up');
    arrowSecond.classList.toggle('arrow_down');
    if(arrowFirst.classList.contains('arrow_up')){
        table.classList.toggle('right');
        arrowFirst.classList.toggle('arrow_up');
        arrowFirst.classList.toggle('arrow_down');
    }else {
        table.classList.toggle('hide');
        table.classList.toggle('show');
        table.classList.toggle('right');
    }
}

changeButton.addEventListener('click', () => {
    let firstInputValue = firstCur.value;
    firstCur.value = secondCur.value;
    secondCur.value = firstInputValue;
    calculate();
});

document.querySelectorAll('.base.currencies div:not(:last-child)').forEach(chooseCurrencyBase);
document.querySelectorAll('.symbol.currencies div:not(:last-child)').forEach(chooseCurrencySymbol);

arrowFirst.addEventListener('click', arrowFirstAction);
arrowSecond.addEventListener('click', arrowSecondAction);

window.addEventListener('load', calculate);
firstCur.addEventListener('change', calculate);