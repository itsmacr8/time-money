import { LumpSum, Annuity, AnnuityDue } from './_classes';

const TIME_VALUE_OF_MONEY_FORM = document.querySelector(
    '[data-time="form"]'
) as HTMLFormElement;

const DOM = {
    type: document.querySelector('[data-time="type"]') as HTMLOptionElement,
    totalAmount: document.querySelector(
        '[data-time="total-amount"]'
    ) as HTMLInputElement,
    interest: document.querySelector(
        '[data-time="interest"]'
    ) as HTMLInputElement,
    year: document.querySelector('[data-time="year"]') as HTMLInputElement,
    compound: document.querySelector(
        '[data-time="compound-frequency"]'
    ) as HTMLInputElement,

    getType() {
        return DOM.type.value;
    },
};

function findAnswerBasedOnProblemType(
    type: string,
    lumpSum: LumpSum,
    annuityDue: AnnuityDue,
    annuity: Annuity,
    answerContainer: HTMLElement
) {
    if (type === 'PV' || type === 'FV') {
        lumpSum.findAnswer(answerContainer);
    } else if (type.includes('Due')) {
        annuityDue.findAnswer(answerContainer);
    } else {
        annuity.findAnswer(answerContainer);
    }
}

DOM.type?.addEventListener('change', () => {
    const TYPE = DOM.getType();
    const AMOUNT_LABEL = document.querySelector(
        '[data-time="input-total-amount"]'
    ) as HTMLLabelElement;

    function changeLabelText() {
        if (TYPE === 'PV' || TYPE === 'FV') {
            AMOUNT_LABEL.innerText = 'Enter present value or future value';
        } else {
            AMOUNT_LABEL.innerText = 'Enter annuity amount';
        }
    }
    changeLabelText();
});

TIME_VALUE_OF_MONEY_FORM?.addEventListener('submit', (event) => {
    event.preventDefault();
    const TYPE: string = DOM.getType();
    const TOTAL_AMOUNT: string = DOM.totalAmount.value;
    const INTEREST: number = Number(DOM.interest.value);
    const YEAR: number = Number(DOM.year.value);
    const COMPOUND: number = Number(DOM.compound.value);

    const ANSWER_CONTAINER = document.querySelector(
        '[data-time="answer"]'
    ) as HTMLElement;
    const LUMP_SUM = new LumpSum(TYPE, TOTAL_AMOUNT, YEAR, INTEREST, COMPOUND);
    const ANNUITY = new Annuity(TYPE, TOTAL_AMOUNT, YEAR, INTEREST, COMPOUND);
    const ANNUITY_DUE = new AnnuityDue(
        TYPE,
        TOTAL_AMOUNT,
        YEAR,
        INTEREST,
        COMPOUND
    );
    findAnswerBasedOnProblemType(
        TYPE,
        LUMP_SUM,
        ANNUITY_DUE,
        ANNUITY,
        ANSWER_CONTAINER
    );
});
