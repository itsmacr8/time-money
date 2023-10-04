class LumpSum {
    type: string;
    amount: string;
    year: number;
    interest: number;
    compound: number;

    constructor(
        type: string,
        amount: string,
        year: number,
        interest: number,
        compound: number,
    ) {
        this.type = type;
        this.amount = amount;
        this.year = year;
        this.interest = interest / 100;
        this.compound = compound;
    }

    findAnswer(renderArea: HTMLElement): void {
        const interestFormula = this.getInterestFormula();
        const yearFormula = this.getYearFormula();
        const TOTAL_INTEREST_UI: string = `${interestFormula}${yearFormula}`;
        const FORMULA = `${this.baseTemplate(
            `${this.getTypeUI()} ${TOTAL_INTEREST_UI}`,
        )}`;
        const SET_VALUE = `${this.baseTemplate(
            `${this.amount} ${this.setValue()}`,
        )}`;
        const TOTAL_INTEREST: number = this.calcInterestWithPower();
        const ANSWER_UI = this.calculateAnswerUI(this.amount, TOTAL_INTEREST);
        const ANSWER = Math.round(
            Number(this.amount.replaceAll(',', '')) * TOTAL_INTEREST,
        );
        this.renderTemplate(
            `${FORMULA}${SET_VALUE}`,
            ANSWER_UI,
            `${ANSWER.toLocaleString('en-IN')} Tk.`,
            renderArea,
        );
    }

    private getTypeUI() {
        let type: string = 'PV';
        if (this.isPresent()) {
            type = 'FV';
        }
        return type;
    }

    protected getInterestFormula() {
        let interest = '(1+i)';
        if (this.isCompound()) {
            interest = '(1+i/m)';
        }
        return interest;
    }

    protected getYearFormula() {
        let yearUI: string = 'n';
        if (this.isPresent()) {
            yearUI = '-n';
        }
        if (this.isCompound()) {
            yearUI = `${yearUI}m`;
        }
        return `<sup>${yearUI}</sup>`;
    }

    private setValue(): string {
        return `${this.getInterestValue()}${this.getYearValue()}`;
    }

    protected getInterestValue() {
        if (this.isCompound()) {
            return `(1+${this.interest}/${this.compound})`;
        }
        return `(1+${this.interest})`;
    }

    protected getYearValue() {
        let yearValue: string = `${this.year}`;
        if (this.isPresent()) {
            yearValue = `-${yearValue}`;
        }
        if (this.isCompound()) {
            yearValue = `${this.year}×${this.compound}`;
            if (this.isPresent()) {
                yearValue = `-(${yearValue})`;
            }
        }
        return `<sup>${yearValue}</sup>`;
    }

    protected calculateAnswerUI(totalAmount: string, interest: number): string {
        return `${totalAmount} × ${interest}`;
    }

    protected calcInterest(): number {
        let interest: number = 1 + this.interest;
        if (this.isCompound()) {
            interest = 1 + this.interest / this.compound;
        }
        return Number(interest.toFixed(5));
    }

    protected calcInterestWithPower(): number {
        let { year } = this;
        const INTEREST: number = this.calcInterest();
        let calcPower: number = INTEREST ** year;
        if (this.isPresent()) {
            calcPower = INTEREST ** -year;
        }
        if (this.isCompound()) {
            year *= this.compound;
            calcPower = INTEREST ** year;
            if (this.isPresent()) {
                calcPower = INTEREST ** -year;
            }
        }
        return Number(calcPower.toFixed(5));
    }

    protected isPresent(): boolean {
        return !!this.type.includes('PV');
    }

    protected isCompound(): boolean {
        return this.compound > 1;
    }

    protected baseTemplate(value: string): string {
        return `<div>${this.type} = ${value}</div>`;
    }

    protected renderTemplate(
        applyFormula: string,
        calculation: string,
        answer: string,
        renderArea: HTMLElement,
    ) {
        const render = renderArea;
        render.innerHTML = `<h2>Answer is:</h2>
                <p class="mb-0">We know,</p>
                <div class="pl-4">
                    ${applyFormula}
                    ${this.baseTemplate(calculation)}
                    ${this.baseTemplate(answer)}
                </div>`;
    }
}

class Annuity extends LumpSum {
    constructor(
        type: string,
        amount: string,
        year: number,
        interest: number,
        compound: number,
    ) {
        super(type, amount, year, interest, compound);
    }

    findAnswer(renderArea: HTMLElement): void {
        const [ANNUITY_DIVIDE_UI, INTEREST_RULE_UI] = this.formula();
        const FORMULA = this.annuityTemplate(
            'a',
            ANNUITY_DIVIDE_UI,
            INTEREST_RULE_UI,
        );

        const SET_VALUE = this.setAnnuityValue(this.setInterestRuleUI());
        const LINE_THREE: string = this.getLineThree();
        const LINE_FOUR = this.getLineFour();
        const ANSWER: number = this.calculateAnswer();

        this.renderTemplate(
            `${FORMULA}${SET_VALUE}${LINE_THREE}`,
            `${LINE_FOUR}`,
            `${ANSWER.toLocaleString('en-IN')} Tk.`,
            renderArea,
        );
    }

    protected formula() {
        const INTEREST_UI: string = this.getInterestFormula();
        const YEAR_UI: string = this.getYearFormula();
        const INTEREST_RULE_UI = this.getInterestRuleUI(INTEREST_UI, YEAR_UI);
        const ANNUITY_DIVIDE_UI: string = this.getAnnuityDivideUI();
        return [ANNUITY_DIVIDE_UI, INTEREST_RULE_UI];
    }

    private calcAnnuityAndInterestUI(CALCULATED_ANNUITY_VALUE: number) {
        const TOTAL_INTEREST: number = this.calcInterestWithPower();
        let calculatedInterestValueUI: string = `${TOTAL_INTEREST} - 1`;
        if (this.isPresent()) {
            calculatedInterestValueUI = `1 - ${TOTAL_INTEREST}`;
        }
        let isCompound: boolean = false;
        let lineThreeUIValues: string[] = [
            CALCULATED_ANNUITY_VALUE.toLocaleString('en-IN'),
            calculatedInterestValueUI,
        ];
        if (this.isCompound()) {
            isCompound = true;
            const annuity = this.amount;
            const interestDivCompound = this.getDivideInterestWithCompound();
            lineThreeUIValues = [
                annuity,
                String(interestDivCompound),
                `<div> × (1 - ${TOTAL_INTEREST})`,
            ];
        }
        return { lineThreeUIValues, isCompound };
    }

    private calcAnnuityAndInterest() {
        let calcAntyVal: number = this.getAnnuity(this.interest);
        if (this.isCompound()) {
            calcAntyVal = this.getAnnuity(this.getDivideInterestWithCompound());
        }

        const TOTAL_INTEREST: number = this.calcInterestWithPower();
        let calculatedInterestValue: number = TOTAL_INTEREST - 1;
        if (this.isPresent()) {
            calculatedInterestValue = 1 - TOTAL_INTEREST;
        }
        return [calcAntyVal, Number(calculatedInterestValue.toFixed(5))];
    }

    private getAnnuityDivideUI(): string {
        let annuityDivideUI: string = 'i';
        if (this.isCompound()) {
            annuityDivideUI = 'i/m';
        }
        return annuityDivideUI;
    }

    private getAnnuityDivideValue(): string {
        let annuityDivideValue: string = `${this.interest}`;
        if (this.isCompound()) {
            annuityDivideValue = `${annuityDivideValue}/${this.compound}`;
        }
        return annuityDivideValue;
    }

    private getInterestRuleUI(interestUI: string, yearUI: string): string {
        let interestRuleUI: string = `<div> × [${interestUI}${yearUI} - 1]`;
        if (this.isPresent()) {
            interestRuleUI = `<div> × [1 - ${interestUI}${yearUI}]`;
        }
        return interestRuleUI;
    }

    private getAnnuity(divideAnnuity: number): number {
        return Math.round(Number(this.amount.replaceAll(',', '')) / divideAnnuity);
    }

    private getDivideInterestWithCompound(): number {
        return Number((this.interest / this.compound).toFixed(5));
    }

    protected setInterestRuleUI() {
        const interestValue = this.getInterestValue();
        return this.getInterestRuleUI(interestValue, this.getYearValue());
    }

    protected setAnnuityValue(interestRuleUI: string): string {
        return this.annuityTemplate(
            this.amount,
            this.getAnnuityDivideValue(),
            interestRuleUI,
        );
    }

    protected getLineThree(due?: boolean) {
        const [CALCULATED_ANNUITY_VALUE] = this.calcAnnuityAndInterest();
        const { lineThreeUIValues, isCompound } = this.calcAnnuityAndInterestUI(
            CALCULATED_ANNUITY_VALUE,
        );

        const [ANNUITY, ANNUITY_DIVIDE_UI] = lineThreeUIValues;
        const DUE_INTEREST = this.calcInterest();

        let lineThree: string = this.baseTemplate(
            `${ANNUITY} (${ANNUITY_DIVIDE_UI})`,
        );
        if (due) {
            lineThree = this.baseTemplate(
                `${ANNUITY} (${ANNUITY_DIVIDE_UI}) × ${DUE_INTEREST}`,
            );
        }
        if (isCompound) {
            let interestRuleUI: string = `${lineThreeUIValues[2]}`;
            if (due) {
                interestRuleUI = `${interestRuleUI} × ${DUE_INTEREST}`;
            }
            lineThree = this.annuityTemplate(
                ANNUITY,
                ANNUITY_DIVIDE_UI,
                interestRuleUI,
            );
        }
        return lineThree;
    }

    protected getLineFour(): string {
        const [CALC_ANNUITY_VAL, CALC_INT_VAL] = this.calcAnnuityAndInterest();
        return this.calculateAnswerUI(
            CALC_ANNUITY_VAL.toLocaleString('en-IN'),
            CALC_INT_VAL,
        );
    }

    protected calculateAnswer(): number {
        const [CALC_ANNUITY_VAL, CALC_INT_VAL] = this.calcAnnuityAndInterest();
        return Math.round(CALC_ANNUITY_VAL * CALC_INT_VAL);
    }

    protected annuityTemplate(
        annuity: string,
        annuityDivUI: string,
        interestRuleUI: string,
    ) {
        return `<div class="d-flex ai-center gap">
                        <div>${this.type} =</div>
                        <div class="d-flex gap text-center">
                            <div class="flex-column">
                                <span>${annuity}</span>
                                <span class="bt-1">${annuityDivUI}</span>
                            </div>
                            ${interestRuleUI}</div>
                        </div>
                    </div>`;
    }
}

class AnnuityDue extends Annuity {
    constructor(
        type: string,
        amount: string,
        year: number,
        interest: number,
        compound: number,
    ) {
        super(type, amount, year, interest, compound);
    }

    findAnswer(renderArea: HTMLElement): void {
        const TYPE = this.type.split('-')[0];
        const DUE = this.type.split('-')[1];
        this.type = `${TYPE}<sub>${DUE}</sub>`;

        let [ANNUITY_DIVIDE_UI, interestRuleUI] = this.formula();
        interestRuleUI = `${interestRuleUI} × ${this.getInterestFormula()}`;
        const FORMULA = this.annuityTemplate(
            'a',
            ANNUITY_DIVIDE_UI,
            interestRuleUI,
        );

        const SET_VALUE = this.setAnnuityValue(
            `${this.setInterestRuleUI()} × ${this.getInterestValue()}`,
        );
        const LINE_THREE: string = this.getLineThree(true);
        const DUE_INTEREST = this.calcInterest();
        const LINE_FOUR = `${this.getLineFour()} × ${DUE_INTEREST}`;
        const ANSWER = Math.round(this.calculateAnswer() * DUE_INTEREST);

        this.renderTemplate(
            `${FORMULA}${SET_VALUE}${LINE_THREE}`,
            `${LINE_FOUR}`,
            ANSWER.toLocaleString('en-IN'),
            renderArea,
        );
    }
}

export { LumpSum, Annuity, AnnuityDue };
